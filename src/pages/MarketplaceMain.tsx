import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search, Filter, Package, Store, Map as MapIcon, List, MapPin, Star, ExternalLink } from 'lucide-react';
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

            {/* Featured Sellers - only show if they service this area */}
            {showSellers && (
              <div className="border-t pt-6 mt-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold">Featured Sellers</h3>
                    <p className="text-sm text-muted-foreground">
                      These sellers offer local drop-off to lockers near {locationSearch}
                    </p>
                  </div>
                  <Badge variant="outline">{relevantSellers.length} in area</Badge>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {relevantSellers.map(seller => (
                    <FeaturedSellerCard key={seller.id} seller={seller} />
                  ))}
                </div>
                
                {/* Premium placement CTA */}
                <Card className="mt-4 bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">
                        Want to be featured here? Reach buyers in {locationSearch} for 10k sats/month
                      </p>
                      <Button size="sm" variant="outline">
                        Get Featured
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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

// Featured seller card - compact ad style
function FeaturedSellerCard({ seller }: { seller: FeaturedSeller }) {
  return (
    <Card className={`hover:border-primary transition-colors ${seller.isPremium ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${seller.isPremium ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            <Store className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{seller.name}</p>
              {seller.isPremium && <Star className="h-3 w-3 text-primary fill-primary" />}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{seller.tagline}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span>★ {seller.trustScore}</span>
              <span>•</span>
              <span>{seller.sales} sales</span>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-1">Sells:</p>
          <div className="flex flex-wrap gap-1">
            {seller.items.slice(0, 3).map(item => (
              <Badge key={item} variant="outline" className="text-xs">{item}</Badge>
            ))}
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-3">
          View Store <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}

// No lockers state with community callout
function NoLockersState({ location, onClear }: { location: string; onClear: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="text-center py-12">
        <CardContent className="space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <MapPin className="h-10 w-10 text-muted-foreground" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-2">No Lockers in {location}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              DeadDropstr uses secure lockers for anonymous exchanges. 
              Help bring privacy-first commerce to your area.
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

      {/* Featured sellers who could expand here */}
      <div>
        <h3 className="text-lg font-bold mb-4">Sellers Interested in {location}</h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {FEATURED_SELLERS.filter(s => s.isPremium).slice(0, 3).map(seller => (
            <Card key={seller.id} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{seller.name}</p>
                    <p className="text-xs text-muted-foreground">Would expand here with lockers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-3 text-center">
          Premium sellers are waiting to serve {location}. Be the first to host a locker!
        </p>
      </div>
    </div>
  );
}