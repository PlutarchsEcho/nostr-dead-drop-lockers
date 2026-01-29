import { useMutation } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { NSecSigner, type NostrEvent } from '@nostrify/nostrify';
import { generateSecretKey } from 'nostr-tools';

export interface UnlockCommandParams {
  recipientPubkey: string;
  lockerId: string;
  paymentPreimage: string;
  rentalInvoice: string;
}

/**
 * Hook to send NIP-17 gift-wrapped unlock commands to locker hardware.
 * 
 * This creates a privacy-preserving encrypted message using the NIP-59 gift wrap protocol:
 * 1. Creates a kind 14 inner message with unlock command JSON
 * 2. Seals it in a kind 13 event encrypted to recipient
 * 3. Wraps in a kind 1059 gift wrap signed by ephemeral key
 * 
 * The locker hardware should:
 * 1. Subscribe to kind 1059 events addressed to its pubkey
 * 2. Decrypt the gift wrap using its private key
 * 3. Verify the seal and extract the inner message
 * 4. Parse the unlock command and verify the payment preimage
 * 5. Trigger the GPIO to unlock the solenoid
 */
export function useSendUnlockCommand() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();

  return useMutation<NostrEvent, Error, UnlockCommandParams>({
    mutationFn: async ({ recipientPubkey, lockerId, paymentPreimage, rentalInvoice }) => {
      if (!user) {
        throw new Error('User is not logged in');
      }

      if (!user.signer.nip44) {
        throw new Error('NIP-44 encryption not available. Please use a signer that supports NIP-44.');
      }

      const now = Math.floor(Date.now() / 1000);

      // Randomize timestamp within past 2 days for metadata privacy
      const randomizeTimestamp = (baseTime: number) => {
        const twoDaysInSeconds = 2 * 24 * 60 * 60;
        const randomOffset = -Math.floor(Math.random() * twoDaysInSeconds);
        return baseTime + randomOffset;
      };

      // Build the unlock command JSON
      const unlockCommand = {
        action: 'unlock',
        locker_id: lockerId,
        payment_preimage: paymentPreimage,
        rental_invoice: rentalInvoice,
      };

      // Step 1: Create the inner Kind 14 Private Direct Message
      const privateMessage: Omit<NostrEvent, 'id' | 'sig'> = {
        kind: 14,
        pubkey: user.pubkey,
        created_at: now,
        tags: [['p', recipientPubkey]],
        content: JSON.stringify(unlockCommand),
      };

      // Step 2: Create Kind 13 Seal (only for recipient, hardware doesn't need sender copy)
      const recipientSeal: Omit<NostrEvent, 'id' | 'sig'> = {
        kind: 13,
        pubkey: user.pubkey,
        created_at: now,
        tags: [],
        content: await user.signer.nip44.encrypt(recipientPubkey, JSON.stringify(privateMessage)),
      };

      // Step 3: Create Kind 1059 Gift Wrap with ephemeral key
      const recipientRandomKey = generateSecretKey();
      const recipientRandomSigner = new NSecSigner(recipientRandomKey);

      // Encrypt the seal using the random signer
      const recipientGiftWrapContent = await recipientRandomSigner.nip44!.encrypt(
        recipientPubkey,
        JSON.stringify(recipientSeal)
      );

      // Sign gift wrap with random ephemeral key
      const recipientGiftWrap = await recipientRandomSigner.signEvent({
        kind: 1059,
        created_at: randomizeTimestamp(now),
        tags: [['p', recipientPubkey]],
        content: recipientGiftWrapContent,
      });

      // Publish to relays
      await nostr.event(recipientGiftWrap);

      return recipientGiftWrap;
    },
    onSuccess: () => {
      toast({
        title: 'Unlock command sent',
        description: 'The encrypted unlock command has been published to the network.',
      });
    },
    onError: (error) => {
      console.error('[UnlockCommand] Failed to send:', error);
      toast({
        title: 'Failed to send unlock command',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export default useSendUnlockCommand;
