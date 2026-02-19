import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { List, Filter, MapPin, DollarSign, Box } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Simple locker type
interface LockerListing {
  id: string;
  dTag: string;
  title: string;
  description: string;
  price: number;
  geohash: string;
  dimensions?: string;
  status: 'available' | 'occupied' | 'maintenance';
  owner: string;
}

function parseLockerEvent(event: any): LockerListing | null {
  try {
    const tags = new Map(event.tags);
    return {
      id: event.id,
      dTag: tags.get('d') || '',
      title: tags.get('title') || 'Unnamed Locker',
      description: event.content || '',
      price: parseInt(tags.get('price') || '0'),
      geohash: tags.get('g') || '',
      dimensions: tags.get('dimensions'),
      status: (tags.get('status') as any) || 'available',
      owner: event.pubkey,
    };
  } catch {
    return null;
  }
}

// Mock data for demo since relays may be empty
const MOCK_LOCKERS: LockerListing[] = [
  {
    id: '1',
    dTag: 'locker-001',
    title: 'Downtown Secure Box',
    description: '24/7 accessible locker in well-lit area. Perfect for small packages.',
    price: 500,
    geohash: '9q8yyz',
    dimensions: '30x40x50 cm',
    status: 'available',
    owner: 'npub1abc...',
  },
  {
    id: '2',
    dTag: 'locker-002',
    title: 'University Campus Drop',
    description: 'Near student center. High traffic, very secure.',
    price: 300,
    geohash: '9q8yym',
    dimensions: '25x35x45 cm',
    status: 'available',
    owner: 'npub1def...',
  },
  {
    id: '3',
    dTag: 'locker-003',
    title: 'Shopping Mall Locker',
    description: 'Inside mall, security cameras. Good for retail exchanges.',
    price: 750,
    geohash: '9q8yyk',
    dimensions: '40x50x60 cm',
    status: 'occupied',
    owner: 'npub1ghi...',
  },
  {
    id: '4',
    dTag: 'locker-004',
    title: 'Suburban Community Box',
    description: 'Residential area, quiet neighborhood. Great for privacy.',
    price: 250,
    geohash: '9q8yyf',
    dimensions: '30x40x40 cm',
    status: 'available',
    owner: 'npub1jkl...',
  },
];

export default function MarketplaceMain() {
  const { nostr } = useNostr();
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Query real lockers from Nostr
  const { data: realLockers, isLoading } = useQuery({
    queryKey: ['locker-listings'],
    queryFn: async () => {
      try {
        const events = await nostr.query([{ kinds: [30402], '#t': ['locker'], limit: 200 }]);
        return events.map(parseLockerEvent).filter(Boolean) as LockerListing[];
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });

  // Use real lockers if available, otherwise mock data
  const lockers = realLockers?.length ? realLockers : MOCK_LOCKERS;

  const filteredLockers = useMemo(() => {
    return lockers.filter(locker => {
      const matchesSearch = !searchTerm || 
        locker.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        locker.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = locker.price <= maxPrice;
      return matchesSearch && matchesPrice;
    });
  }, [lockers, searchTerm, maxPrice]);

  const formatPrice = (sats: number) => {
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(2)}M sats`;
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}k sats`;
    return `${sats} sats`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">Find dead drop lockers near you</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card>
              <CardContent className="pt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <Input
                    placeholder="Search by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Price: {formatPrice(maxPrice)}</Label>
                  <Slider
                    min={0}
                    max={50000}
                    step={500}
                    value={[maxPrice]}
                    onValueChange={([v]) => setMaxPrice(v)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <List className="h-4 w-4" />
          {filteredLockers.length} locker{filteredLockers.length !== 1 ? 's' : ''} found
        </div>

        {/* Locker grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLockers.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Box className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No lockers found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLockers.map(locker => (
              <Card key={locker.id} className="hover:border-primary transition-colors group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {locker.title}
                    </CardTitle>
                    <Badge variant={locker.status === 'available' ? 'default' : 'secondary'}>
                      {locker.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {locker.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium text-foreground">{formatPrice(locker.price)}</span>
                      <span className="text-xs">/hr</span>
                    </div>
                    {locker.dimensions && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Box className="h-4 w-4" />
                        <span>{locker.dimensions}</span>
                      </div>
                    )}
                  </div>

                  {locker.geohash && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="font-mono">{locker.geohash}</span>
                    </div>
                  )}

                  <Button asChild className="w-full mt-2">
                    <Link to={`/locker/${locker.dTag}`}>
                      View Details
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}