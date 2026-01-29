import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { parseLockerEvent } from '@/lib/lockerTypes';

export default function useMyLockers() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['my-lockers'],
    queryFn: async () => {
      // Query the latest lockers by the current user (will be filtered by client-side if needed)
      const events = await nostr.query([{ kinds: [30402], limit: 100 }]);
      return events.map((e: any) => parseLockerEvent(e)).filter(Boolean);
    },
    staleTime: 30_000,
  });
}
