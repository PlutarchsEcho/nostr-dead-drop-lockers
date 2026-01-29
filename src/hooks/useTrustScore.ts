import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { TrustScore } from '@/lib/lockerTypes';

export function useTrustScore(pubkey: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['trust-score', pubkey],
    queryFn: async (): Promise<TrustScore | null> => {
      if (!pubkey) return null;

      // Query reactions (kind 7) and zaps (kind 9735) where the target is this pubkey
      const events = await nostr.query([
        { kinds: [7], '#p': [pubkey], limit: 500 },
        { kinds: [9735], '#p': [pubkey], limit: 200 },
      ]);

      let positiveReactions = 0;
      let negativeReactions = 0;
      let zapsSats = 0;

      for (const event of events) {
        if (event.kind === 7) {
          const content = event.content.trim();
          if (content === '-') {
            negativeReactions++;
          } else {
            // '+', emoji, or anything else counts as positive
            positiveReactions++;
          }
        } else if (event.kind === 9735) {
          // Parse bolt11 from the description tag to get amount
          // For simplicity, count each zap as 1000 sats average
          zapsSats += 1000;
        }
      }

      const zapPoints = Math.floor(zapsSats / 1000);
      const totalReactions = positiveReactions + negativeReactions;
      const score = totalReactions > 0
        ? Math.round(((positiveReactions + zapPoints) / (totalReactions + zapPoints)) * 100)
        : 50; // default neutral score

      return {
        pubkey,
        positiveReactions,
        negativeReactions,
        zapsSats,
        totalReactions,
        score,
      };
    },
    enabled: !!pubkey,
    staleTime: 60_000,
  });
}

export default useTrustScore;
