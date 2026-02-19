import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search, Filter, Package, Store, Map as MapIcon, List, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LockersMap } from '@/components/LockersMap';

// Locker type
interface Locker {
  id: string;
  dTag: string;
  name: string;
  description: string;
  price: number; // hourly rate in sats
  geohash: string;
  city: string;
  state: string;
  owner: string;
  dimensions?: string;
  features: string[];
}

// Featured seller - only shows if they service the searched area
interface FeaturedSeller {
  id: string;
  name: string;
  npub: string;
  tagline: string;
  items: string[];
  trustScore: number;
  sales: number;
  // Areas they can drop to (or ship to lockers in)
  servicesAreas: string[]; // geohash prefixes
  isPremium: boolean;
}

// Mock lockers
const MOCK_LOCKERS: Locker[] = [
  {
    id: '1',
    dTag: 'locker-sf-001',
    name: 'Mission District Secure Box',
    description: '24/7 accessible smart locker in secure building. Camera monitored.',
    price: 500,
    geohash: '9q8yyz',
    city: 'San Francisco',
    state: 'CA',
    owner: 'npub1owner1...',
    dimensions: '40x50x60 cm',
    features: ['24/7 Access', 'Camera', 'Climate Controlled'],
  },
  {
    id: '2',
    dTag: 'locker-nyc-001',
    name: 'Brooklyn Heights Drop',
    description: 'Street-level locker. Well-lit area, residential neighborhood.',
    price: 750,
    geohash: '9q8yyk',
    city: 'New York',
    state: 'NY',
    owner: 'npub1owner2...',
    dimensions: '35x45x55 cm',
    features: ['Ground Floor', 'Discreet'],
  },
  {
    id: '3',
    dTag: 'locker-sea-001',
    name: 'Capitol Hill Tech Hub',
    description: 'Indoor location near coffee shops. NFC + QR unlock.',
    price: 400,
    geohash: 'dpwh',
    city: 'Seattle',
    state: 'WA',
    owner: 'npub1owner3...',
    dimensions: '50x60x70 cm',
    features: ['NFC Unlock', 'Indoor', 'WiFi'],
  },
  {
    id: '4',
    dTag: 'locker-la-001',
    name: 'Silverlake Community Box',
    description: 'Community-run locker. Local volunteers maintain.',
    price: 300,
    geohash: '9q8yym',
    city: 'Los Angeles',
    state: 'CA',
    owner: 'npub1owner4...',
    dimensions: '30x40x50 cm',
    features: ['Community Run', 'Cheap'],
  },
];

// Featured sellers who pay for placement in specific areas
const FEATURED_SELLERS: FeaturedSeller[] = [
  {
    id: 'seller-1',
    name: 'CryptoVault',
    npub: 'npub1vault...',
    tagline: 'Premium hardware wallets & security devices',
    items: ['ColdCard', 'SeedSigner', 'Faraday bags'],
    trustScore: 4.9,
    sales: 156,
    servicesAreas: ['9q8yyz', '9q8yyk', 'dpwh'], // SF, NYC, Seattle
    isPremium: true,
  },
  {
    id: 'seller-2',
    name: 'PrivacyFirst',
    npub: 'npub1priv...',
    tagline: 'De-googled phones & privacy tools',
    items: ['Pixel w/ GrapheneOS', 'VPN subs', ' anon SIMs'],
    trustScore: 4.7,
    sales: 89,
    servicesAreas: ['9q8yyz', '9q8yym', 'dpwh'], // SF, LA, Seattle
    isPremium: true,
  },
  {
    id: 'seller-3',
    name: 'SatStacker',
    npub: 'npub1sat...',
    tagline: 'Bitcoin merchandise & educational kits',
    items: ['Metal seeds', 'Books', 'Stickers'],
    trustScore: 5.0,
    sales: 234,
    servicesAreas: ['9q8yyk', 'dqcjq'], // NYC, Denver
    isPremium: false,
  },
];

// City/zip to geohash mapping
const LOCATION_MAP: Record<string, string[]> = {
  'san francisco': ['9q8yyz'], 'sf': ['9q8yyz'], '94102': ['9q8yyz'], '94103': ['9q8yyz'],
  'new york': ['9q8yyk'], 'nyc': ['9q8yyk'], '10001': ['9q8yyk'],
  'seattle': ['dpwh'], '98101': ['dpwh'],
  'los angeles': ['9q8yym'], 'la': ['9q8yym'], '90001': ['9q8yym'],
  'denver': ['dqcjq'], '80201': ['dqcjq'],
  'chicago': ['9q8yyf'], '60601': ['9q8yyf'],
};

export default function MarketplaceMain() {
  const { nostr } = useNostr();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  // Get location geohashes from search
  const locationGeohashes = useMemo(() => {
    if (!locationSearch.trim()) return null;
    const key = locationSearch.toLowerCase().trim();
    return LOCATION_MAP[key] || null;
  }, [locationSearch]);

  // Filter lockers by location and search
  const filteredLockers = useMemo(() => {
    return MOCK_LOCKERS.filter(locker => {
      const matchesSearch = !searchTerm || 
        locker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        locker.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        locker.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = locker.price <= maxPrice;
      const matchesLocation = !locationGeohashes || locationGeohashes.some(gh => locker.geohash.startsWith(gh));
      return matchesSearch && matchesPrice && matchesLocation;
    });
  }, [searchTerm, maxPrice, locationGeohashes]);

  // Find featured sellers who service this area
  const relevantSellers = useMemo(() => {
    if (!locationGeohashes) return [];
    return FEATURED_SELLERS.filter(seller => 
      seller.servicesAreas.some(area => locationGeohashes.some(gh => area.startsWith(gh)))
    );
  }, [locationGeohashes]);

  const formatPrice = (sats: number) => {
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}k`;
    return `${sats}`;
  };

  const hasNoLockers = locationSearch && !locationGeohashes;
  const showSellers = relevantSellers.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Locker Marketplace</h1>
              <p className="text-muted-foreground">Find secure drop boxes for anonymous exchanges</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMapDialogOpen(true)}>
                <MapIcon className="h-4 w-4 mr-2" />
                Browse Map
              </Button>
              <Button asChild>
                <Link to="/dashboard">
                  <Package className="h-4 w-4 mr-2" />
                  List Your Locker
                </Link>
              </Button>
            </div>
          </div>

          {/* Search Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lockers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Enter city or zip code..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2 flex-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <List className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Map
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label>Max Hourly Rate: {formatPrice(maxPrice)} sats</Label>
                  <Slider
                    min={0}
                    max={5000}
                    step={100}
                    value={[maxPrice]}
                    onValueChange={([v]) => setMaxPrice(v)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        {hasNoLockers ? (
          <NoLockersState 
            location={locationSearch}
            onClear={() => setLocationSearch('')}
          />
        ) : (
          <div className="space-y-6">
            {/* Results count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              {filteredLockers.length} locker{filteredLockers.length !== 1 ? 's' : ''} found
              {locationSearch && <span>near {locationSearch}</span>}
            </div>

            {/* Locker Grid */}
            {viewMode === 'map' ? (
              <div className="grid lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2 min-h-[500px]">
                  <LockersMap 
                    lockers={filteredLockers.map(l => ({
                      id: l.id,
                      dTag: l.dTag,
                      title: l.name,
                      price: l.price,
                      geohash: l.geohash,
                      status: 'available',
                      description: `${l.city}, ${l.state}`,
                    }))}
                  />
                </Card>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {filteredLockers.map(locker => (
                    <LockerCard key={locker.id} locker={locker} compact />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredLockers.map(locker => (
                  <LockerCard key={locker.id} locker={locker} />
                ))}
              </div>
            )}

            {/* Featured Circular Economy Seller */}
            {filteredLockers.length > 0 && (
              <div className="border-t border-dashed pt-6 mt-8">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Featured from the circular economy
                  </h3>
                  <Badge variant="outline" className="text-xs">P2P Network</Badge>
                </div>
                
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">CryptoVault</h4>
                          <Badge variant="secondary" className="text-xs">★ 4.9 Trust</Badge>
                          <Badge variant="outline" className="text-xs">156 sales</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Premium hardware wallets & security devices. Ships to any locker or local drop-off.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs">ColdCard</Badge>
                          <Badge variant="outline" className="text-xs">SeedSigner</Badge>
                          <Badge variant="outline" className="text-xs">Faraday Bags</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline">Message</Button>
                        <Button size="sm">View Store</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {relevantSellers.map(seller => (
                    <Button key={seller.id} variant="outline" size="sm" className="h-auto py-1.5">
                      <Store className="h-3 w-3 mr-1.5" />
                      {seller.name}
                    </Button>
                  ))}
                  <Button variant="ghost" size="sm" className="h-auto py-1.5 text-muted-foreground">
                    Join network →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Screen Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-6xl h-[80vh] p-0">
          <div className="grid md:grid-cols-3 h-full">
            <div className="md:col-span-2 h-full min-h-[400px]">
              <LockersMap 
                lockers={MOCK_LOCKERS.map(l => ({
                  id: l.id,
                  dTag: l.dTag,
                  title: l.name,
                  price: l.price,
                  geohash: l.geohash,
                  status: 'available',
                  description: `${l.city}, ${l.state}`,
                }))}
              />
            </div>
            <div className="p-4 overflow-y-auto border-l">
              <h3 className="font-semibold text-lg mb-4">All Locations</h3>
              <div className="space-y-2">
                {MOCK_LOCKERS.map(locker => (
                  <Card key={locker.id} className="cursor-pointer hover:border-primary">
                    <CardContent className="p-3">
                      <p className="font-medium text-sm">{locker.name}</p>
                      <p className="text-xs text-muted-foreground">{locker.city}, {locker.state}</p>
                      <p className="text-sm font-medium mt-1">{formatPrice(locker.price)} sats/hr</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Locker card component
function LockerCard({ locker, compact = false }: { locker: Locker; compact?: boolean }) {
  if (compact) {
    return (
      <Card className="hover:border-primary transition-colors">
        <CardContent className="p-3">
          <p className="font-medium text-sm">{locker.name}</p>
          <p className="text-xs text-muted-foreground">{locker.city}, {locker.state}</p>
          <p className="text-sm font-medium mt-1">{locker.price} sats/hr</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-primary transition-colors group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base group-hover:text-primary transition-colors">
            {locker.name}
          </CardTitle>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{locker.city}, {locker.state}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {locker.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {locker.features.map(feature => (
            <Badge key={feature} variant="secondary" className="text-xs">{feature}</Badge>
          ))}
        </div>
        {locker.dimensions && (
          <p className="text-xs text-muted-foreground">{locker.dimensions}</p>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex items-center justify-between">
        <span className="text-lg font-bold">{locker.price} <span className="text-sm font-normal text-muted-foreground">sats/hr</span></span>
        <Button asChild size="sm">
          <Link to={`/locker/${locker.dTag}`}>Rent</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// No lockers state
function NoLockersState({ location, onClear }: { location: string; onClear: () => void }) {
  return (
    <Card className="text-center py-12">
      <CardContent className="space-y-4">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
        
        <div>
          <h3 className="text-xl font-bold mb-2">No lockers in {location}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Be the first to host a locker and enable local P2P trades.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild>
            <Link to="/dashboard">
              <Package className="h-4 w-4 mr-2" />
              Host a Locker
            </Link>
          </Button>
          <Button variant="outline" onClick={onClear}>
            Clear Search
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}