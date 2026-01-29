import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { parseLockerEvent } from '@/lib/lockerTypes';

export function useLockerListings() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['locker-listings'],
    queryFn: async () => {
      const events = await nostr.query([{ kinds: [30402], '#t': ['locker'], limit: 200 }]);
      return events.map((e: any) => parseLockerEvent(e)).filter(Boolean);
    },
    staleTime: 30_000,
  });
}

export default useLockerListings;
