import { useEffect, useRef, useCallback, useState } from 'react';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { NSecSigner } from '@nostrify/nostrify';

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
 * Hook to subscribe to NWC payment notifications (kind 23196/23197)
 * 
 * This provides real-time payment detection instead of polling.
 * The wallet service publishes encrypted notifications when payments are received.
 */
export function useNWCNotifications({ connectionString, onPaymentReceived, enabled = true }: UseNWCNotificationsOptions) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<PaymentNotification | null>(null);
  const subscriptionRef = useRef<{ close: () => void } | null>(null);
  const signerRef = useRef<NSecSigner | null>(null);

  // Parse connection string and create signer
  const parsed = connectionString ? parseNWCUri(connectionString) : null;

  // Create signer from secret when connection string changes
  useEffect(() => {
    if (!parsed?.secret) {
      signerRef.current = null;
      return;
    }

    try {
      // Convert hex secret to Uint8Array
      const secretBytes = new Uint8Array(32);
      for (let i = 0; i < 32; i++) {
        secretBytes[i] = parseInt(parsed.secret.slice(i * 2, i * 2 + 2), 16);
      }
      signerRef.current = new NSecSigner(secretBytes);
    } catch (err) {
      console.error('[NWC Notifications] Failed to create signer from secret:', err);
      signerRef.current = null;
    }
  }, [parsed?.secret]);

  // Process incoming notification event
  const processNotification = useCallback(async (event: { kind: number; content: string; pubkey: string }) => {
    if (!signerRef.current?.nip44 || !parsed?.walletPubkey) return;

    // Verify event is from the wallet service
    if (event.pubkey !== parsed.walletPubkey) {
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

        setLastNotification(notification);
        onPaymentReceived?.(notification);
      }
    } catch (err) {
      console.error('[NWC Notifications] Failed to process notification:', err);
    }
  }, [parsed?.walletPubkey, onPaymentReceived]);

  // Subscribe to notification events
  useEffect(() => {
    if (!enabled || !parsed || !signerRef.current) {
      setIsConnected(false);
      return;
    }

    const { walletPubkey, relays } = parsed;

    // Get the client pubkey from the signer
    let clientPubkey: string;
    try {
      // NSecSigner exposes the pubkey
      const signer = signerRef.current;
      // We need to derive pubkey from secret - for now use a workaround
      // The signer should have a way to get the pubkey
      clientPubkey = ''; // Will be set by subscription filter using #p tag
    } catch {
      return;
    }

    // Connect to the wallet service's relays
    const relayGroup = nostr.group(relays);

    // Subscribe to kind 23196 (NIP-04) and 23197 (NIP-44) notification events
    // Filter by p-tag targeting our client pubkey
    const subscribe = async () => {
      try {
        // For now, subscribe without p-tag filter (wallet will send to us)
        // In production, derive client pubkey from secret and filter properly
        const sub = relayGroup.req([
          { kinds: [23196, 23197], authors: [walletPubkey], limit: 50 }
        ]);

        setIsConnected(true);

        for await (const msg of sub) {
          if (msg[0] === 'EVENT') {
            const event = msg[2];
            await processNotification(event);
          }
        }
      } catch (err) {
        console.error('[NWC Notifications] Subscription error:', err);
        setIsConnected(false);
      }
    };

    subscribe();

    return () => {
      subscriptionRef.current?.close();
      setIsConnected(false);
    };
  }, [enabled, parsed, nostr, processNotification]);

  return {
    isConnected,
    lastNotification,
  };
}

export default useNWCNotifications;
