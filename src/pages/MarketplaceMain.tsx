import { useQuery } from '@tanstack/react-query';
import LockersMap from '@/components/LockersMap';
import { useLockerListings } from '@/hooks/useLockerListings';

export default function MarketplaceMain() {
  const { data: lockers } = useLockerListings();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Dead Drop Locker Marketplace</h1>
        </header>

        <LockersMap />

        <section className="mt-8">
          <h2 className="text-xl font-medium mb-4">Available Lockers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockers?.map((l: any) => (
              <div key={l.id} className="border rounded p-4">
                <h3 className="font-semibold">{l.title}</h3>
                <p className="text-sm text-muted-foreground">{l.location || l.geohash}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span>{l.price} sats</span>
                  <a href={`/naddr/${l.dTag}`} className="text-primary">View</a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
