import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { parseLockerEvent, type LockerListing } from '@/lib/lockerTypes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Map, List, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import LockersMap from '@/components/LockersMap';
import { Link } from 'react-router-dom';

export default function MarketplaceMain() {
  const { nostr } = useNostr();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [minTrust, setMinTrust] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: lockers } = useQuery({
    queryKey: ['locker-listings'],
    queryFn: async () => {
      const events = await nostr.query([{ kinds: [30402], '#t': ['locker'], limit: 200 }]);
      return events.map((e: any) => parseLockerEvent(e)).filter(Boolean) as LockerListing[];
    },
    staleTime: 60_000,
  });

  const filteredLockers = useMemo(() => {
    if (!lockers) return [];
    return lockers.filter(locker => {
      const matchesSearch = locker.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            locker.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = locker.price <= maxPrice;
      // Trust score filtering would require pre-fetching trust scores or doing it async
      // For MVP, we filter by price and search term only
      return matchesSearch && matchesPrice;
    });
  }, [lockers, searchTerm, maxPrice]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto p-4 flex-1 flex flex-col gap-4">
        <header className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Marketplace</h1>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <Card>
              <CardContent className="pt-6 grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <Input
                    placeholder="Search lockers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Price: {maxPrice} sats</Label>
                  <Slider
                    min={0}
                    max={50000}
                    step={100}
                    value={[maxPrice]}
                    onValueChange={([v]) => setMaxPrice(v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Trust Score: {minTrust}%</Label>
                  <Slider
                    min={0}
                    max={100}
                    step={10}
                    value={[minTrust]}
                    onValueChange={([v]) => setMinTrust(v)}
                    disabled // Enabled when trust score is integrated into listing
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </header>

        <div className="flex-1 min-h-[500px] border rounded-lg overflow-hidden relative">
          {viewMode === 'map' ? (
            <LockersMap lockers={filteredLockers} />
          ) : (
            <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto">
              {filteredLockers.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No lockers match your filters.
                </div>
              ) : (
                filteredLockers.map(locker => (
                  <Card key={locker.id} className="hover:border-primary transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold truncate pr-4">{locker.title}</h3>
                        <span className="text-sm font-medium whitespace-nowrap">{locker.price} sats</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                        {locker.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{locker.dimensions || 'No dimensions'}</span>
                        <Link to={`/locker/${locker.dTag}`} className="text-primary hover:underline">
                          View Details
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
