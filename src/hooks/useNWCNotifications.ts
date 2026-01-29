import { useEffect, useRef, useCallback, useState } from 'react';
import { useNostr } from '@nostrify/react';
import { NSecSigner } from '@nostrify/nostrify';
import { getPublicKey } from 'nostr-tools';

interface PaymentNotification {
  type: 'incoming' | 'outgoing';
  state?: string;
  invoice?: string;
  preimage?: string;
  payment_hash?: string;
  amount?: number;
  settled_at?: number;
}

interface UseNWCNotificationsOptions {
  connectionString: string | null;
  onPaymentReceived?: (notification: PaymentNotification) => void;
  enabled?: boolean;
}

/**
 * Parse NWC connection URI to extract wallet pubkey, secret, and relay URLs
 */
function parseNWCUri(uri: string): { walletPubkey: string; secret: string; relays: string[] } | null {
  try {
    // Format: nostr+walletconnect://<pubkey>?relay=<url>&secret=<hex>
    const url = new URL(uri.replace('nostr+walletconnect://', 'https://'));
    const walletPubkey = url.hostname || url.pathname.replace('//', '');
    const secret = url.searchParams.get('secret');
    const relays: string[] = [];
    
    url.searchParams.forEach((value, key) => {
      if (key === 'relay') {
        relays.push(value);
      }
    });

    if (!walletPubkey || !secret || relays.length === 0) {
      return null;
    }

    return { walletPubkey, secret, relays };
  } catch {
    return null;
  }
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Hook to subscribe to NWC payment notifications (kind 23196/23197)
 * 
 * This provides real-time payment detection instead of polling.
 * The wallet service publishes encrypted notifications when payments are received.
 */
export function useNWCNotifications({ connectionString, onPaymentReceived, enabled = true }: UseNWCNotificationsOptions) {
  const { nostr } = useNostr();
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<PaymentNotification | null>(null);
  const subscriptionRef = useRef<{ close: () => void } | null>(null);
  const signerRef = useRef<NSecSigner | null>(null);
  const clientPubkeyRef = useRef<string | null>(null);

  // Parse connection string
  const parsed = connectionString ? parseNWCUri(connectionString) : null;

  // Create signer and derive client pubkey from secret
  useEffect(() => {
    if (!parsed?.secret) {
      signerRef.current = null;
      clientPubkeyRef.current = null;
      return;
    }

    try {
      const secretBytes = hexToBytes(parsed.secret);
      signerRef.current = new NSecSigner(secretBytes);
      
      // Derive client pubkey from secret using nostr-tools
      clientPubkeyRef.current = getPublicKey(secretBytes);
      
      console.log('[NWC Notifications] Client pubkey derived:', clientPubkeyRef.current.slice(0, 16) + '...');
    } catch (err) {
      console.error('[NWC Notifications] Failed to create signer from secret:', err);
      signerRef.current = null;
      clientPubkeyRef.current = null;
    }
  }, [parsed?.secret]);

  // Process incoming notification event
  const processNotification = useCallback(async (event: { kind: number; content: string; pubkey: string; tags: string[][] }) => {
    if (!signerRef.current?.nip44 || !parsed?.walletPubkey || !clientPubkeyRef.current) return;

    // Verify event is from the wallet service
    if (event.pubkey !== parsed.walletPubkey) {
      return;
    }

    // Verify the notification is addressed to our client pubkey
    const pTag = event.tags.find(([t]) => t === 'p');
    if (pTag && pTag[1] !== clientPubkeyRef.current) {
      // This notification is for a different client
      return;
    }

    try {
      // Decrypt the notification content
      // NIP-47: notifications are encrypted with NIP-44 (kind 23197) or NIP-04 (kind 23196)
      let decrypted: string;
      
      if (event.kind === 23197 && signerRef.current.nip44) {
        decrypted = await signerRef.current.nip44.decrypt(parsed.walletPubkey, event.content);
      } else if (event.kind === 23196 && signerRef.current.nip04) {
        decrypted = await signerRef.current.nip04.decrypt(parsed.walletPubkey, event.content);
      } else {
        return;
      }

      const payload = JSON.parse(decrypted);
      
      if (payload.notification_type === 'payment_received' && payload.notification) {
        const notification: PaymentNotification = {
          type: 'incoming',
          state: payload.notification.state,
          invoice: payload.notification.invoice,
          preimage: payload.notification.preimage,
          payment_hash: payload.notification.payment_hash,
          amount: payload.notification.amount,
          settled_at: payload.notification.settled_at,
        };

        console.log('[NWC Notifications] Payment received:', notification);
        setLastNotification(notification);
        onPaymentReceived?.(notification);
      }
    } catch (err) {
      console.error('[NWC Notifications] Failed to process notification:', err);
    }
  }, [parsed?.walletPubkey, onPaymentReceived]);

  // Subscribe to notification events
  useEffect(() => {
    if (!enabled || !parsed || !signerRef.current || !clientPubkeyRef.current) {
      setIsConnected(false);
      return;
    }

    const { walletPubkey, relays } = parsed;
    const clientPubkey = clientPubkeyRef.current;

    // Connect to the wallet service's relays
    const relayGroup = nostr.group(relays);

    let cancelled = false;

    // Subscribe to notification events filtered by:
    // - kinds: 23196 (NIP-04) and 23197 (NIP-44)
    // - authors: wallet service pubkey
    // - #p: our client pubkey (so we only receive our notifications)
    const subscribe = async () => {
      try {
        console.log('[NWC Notifications] Subscribing to relays:', relays);
        console.log('[NWC Notifications] Filter: authors=%s, #p=%s', walletPubkey.slice(0, 16) + '...', clientPubkey.slice(0, 16) + '...');
        
        const sub = relayGroup.req([
          { 
            kinds: [23196, 23197], 
            authors: [walletPubkey], 
            '#p': [clientPubkey],
            limit: 50 
          }
        ]);

        if (!cancelled) {
          setIsConnected(true);
        }

        for await (const msg of sub) {
          if (cancelled) break;
          
          if (msg[0] === 'EVENT') {
            const event = msg[2] as { kind: number; content: string; pubkey: string; tags: string[][] };
            await processNotification(event);
          } else if (msg[0] === 'EOSE') {
            console.log('[NWC Notifications] End of stored events, now listening for new notifications');
          }
        }
      } catch (err) {
        console.error('[NWC Notifications] Subscription error:', err);
        if (!cancelled) {
          setIsConnected(false);
        }
      }
    };

    subscribe();

    return () => {
      cancelled = true;
      subscriptionRef.current?.close();
      setIsConnected(false);
    };
  }, [enabled, parsed, nostr, processNotification]);

  return {
    isConnected,
    lastNotification,
    clientPubkey: clientPubkeyRef.current,
  };
}

export default useNWCNotifications;
