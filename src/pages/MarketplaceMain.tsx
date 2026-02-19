import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search, Filter, ShoppingBag, Store, Plus, Map as MapIcon, List, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LockersMap } from '@/components/LockersMap';

// Product type
interface Product {
  id: string;
  dTag: string;
  title: string;
  description: string;
  price: number;
  category: string;
  vendor: string;
  vendorNpub: string;
  image?: string;
  inStock: boolean;
  // Available locker locations for this product
  availableAt: string[]; // locker geohashes
}

// Mock products with locker availability
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    dTag: 'prod-001',
    title: 'Privacy-First Smartphone',
    description: 'De-googled Android phone with GrapheneOS pre-installed. Full privacy setup.',
    price: 899000,
    category: 'Electronics',
    vendor: 'PrivacyTech Co',
    vendorNpub: 'npub1abc...',
    inStock: true,
    availableAt: ['9q8yyz', '9q8yyk', 'dpwh', '9q8yym'], // SF, NYC, Seattle, LA
  },
  {
    id: '2',
    dTag: 'prod-002',
    title: 'Faraday Phone Pouch',
    description: 'Military-grade signal blocking pouch. Protects against tracking and surveillance.',
    price: 45000,
    category: 'Accessories',
    vendor: 'SignalSafe',
    vendorNpub: 'npub1def...',
    inStock: true,
    availableAt: ['9q8yyz', '9q8yyk', 'dpwh', '9q8yym', 'dqcjq', '9q8yyf'], // All major cities
  },
  {
    id: '3',
    dTag: 'prod-003',
    title: 'Cold Card Hardware Wallet',
    description: 'Ultra-secure Bitcoin hardware wallet. Air-gapped signing.',
    price: 147000,
    category: 'Bitcoin',
    vendor: 'CoinKite',
    vendorNpub: 'npub1ghi...',
    inStock: true,
    availableAt: ['9q8yyz', '9q8yyk', 'dpwh'], // SF, NYC, Seattle
  },
  {
    id: '4',
    dTag: 'prod-004',
    title: 'Anonymous SIM Card',
    description: 'Pre-paid SIM, no ID required. Activated and ready to use.',
    price: 25000,
    category: 'Communications',
    vendor: 'GhostConnect',
    vendorNpub: 'npub1jkl...',
    inStock: false,
    availableAt: ['9q8yyz', '9q8yym'], // SF, LA only
  },
  {
    id: '5',
    dTag: 'prod-005',
    title: 'Encrypted USB Drive',
    description: 'Hardware-encrypted USB 3.0. Military-grade AES-256.',
    price: 89000,
    category: 'Storage',
    vendor: 'SecureData',
    vendorNpub: 'npub1mno...',
    inStock: true,
    availableAt: ['9q8yyk', 'dpwh', 'dqcjq'], // NYC, Seattle, Denver
  },
  {
    id: '6',
    dTag: 'prod-006',
    title: 'Privacy Screen Protector',
    description: '4-way privacy filter. Blocks side-angle viewing.',
    price: 15000,
    category: 'Accessories',
    vendor: 'PrivacyTech Co',
    vendorNpub: 'npub1abc...',
    inStock: true,
    availableAt: ['9q8yyz', '9q8yyk', 'dpwh', '9q8yym', 'dqcjq'], // Most cities
  },
];

// Locker locations for map
const LOCKER_LOCATIONS = [
  { id: '1', name: 'Downtown SF', geohash: '9q8yyz', lat: 37.7749, lon: -122.4194, city: 'San Francisco', state: 'CA' },
  { id: '2', name: 'Union Square', geohash: '9q8yyk', lat: 40.7128, lon: -74.0060, city: 'New York', state: 'NY' },
  { id: '3', name: 'Tech Hub', geohash: 'dpwh', lat: 47.6062, lon: -122.3321, city: 'Seattle', state: 'WA' },
  { id: '4', name: 'LAX Area', geohash: '9q8yym', lat: 34.0522, lon: -118.2437, city: 'Los Angeles', state: 'CA' },
  { id: '5', name: 'Mile High', geohash: 'dqcjq', lat: 39.7392, lon: -104.9903, city: 'Denver', state: 'CO' },
  { id: '6', name: 'Windy City', geohash: '9q8yyf', lat: 41.8781, lon: -87.6298, city: 'Chicago', state: 'IL' },
];

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Bitcoin', 'Communications', 'Storage'];

// City/zip to geohash mapping (simplified)
const LOCATION_MAP: Record<string, string[]> = {
  'san francisco': ['9q8yyz'],
  'sf': ['9q8yyz'],
  '94102': ['9q8yyz'], // SF zip
  '94103': ['9q8yyz'],
  'new york': ['9q8yyk'],
  'nyc': ['9q8yyk'],
  '10001': ['9q8yyk'], // NYC zip
  'seattle': ['dpwh'],
  '98101': ['dpwh'], // Seattle zip
  'los angeles': ['9q8yym'],
  'la': ['9q8yym'],
  '90001': ['9q8yym'], // LA zip
  'denver': ['dqcjq'],
  '80201': ['dqcjq'], // Denver zip
  'chicago': ['9q8yyf'],
  '60601': ['9q8yyf'], // Chicago zip
};

export default function MarketplaceMain() {
  const { nostr } = useNostr();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  // Query real products from Nostr
  const { data: realProducts, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const events = await nostr.query([{ kinds: [30402], '#t': ['product'], limit: 200 }]);
        return events.map((e: any) => ({
          id: e.id,
          dTag: e.tags.find((t: any) => t[0] === 'd')?.[1] || '',
          title: e.tags.find((t: any) => t[0] === 'title')?.[1] || 'Unnamed Product',
          description: e.content || '',
          price: parseInt(e.tags.find((t: any) => t[0] === 'price')?.[1] || '0'),
          category: e.tags.find((t: any) => t[0] === 'category')?.[1] || 'Other',
          vendor: e.tags.find((t: any) => t[0] === 'vendor')?.[1] || 'Unknown',
          vendorNpub: e.pubkey,
          inStock: e.tags.find((t: any) => t[0] === 'stock')?.[1] !== '0',
          availableAt: e.tags.find((t: any) => t[0] === 'locations')?.[1]?.split(',') || [],
        })) as Product[];
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });

  const products = realProducts?.length ? realProducts : MOCK_PRODUCTS;

  // Filter by location if searched
  const locationGeohashes = useMemo(() => {
    if (!locationSearch.trim()) return null;
    const key = locationSearch.toLowerCase().trim();
    return LOCATION_MAP[key] || null;
  }, [locationSearch]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price <= maxPrice;
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      
      // Filter by location if specified
      let matchesLocation = true;
      if (selectedLocation) {
        matchesLocation = product.availableAt.includes(selectedLocation);
      } else if (locationGeohashes) {
        // Check if product is available at any of the location geohashes
        matchesLocation = locationGeohashes.some(gh => 
          product.availableAt.some(pa => pa.startsWith(gh))
        );
      }
      
      return matchesSearch && matchesPrice && matchesCategory && matchesLocation;
    });
  }, [products, searchTerm, maxPrice, selectedCategory, locationGeohashes, selectedLocation]);

  // Products available at a specific locker (for map popup)
  const getProductsAtLocker = (geohash: string) => {
    return products.filter(p => p.availableAt.includes(geohash) && p.inStock);
  };

  const formatPrice = (sats: number) => {
    if (sats >= 100000000) return `₿ ${(sats / 100000000).toFixed(3)}`;
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(2)}M sats`;
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}k sats`;
    return `${sats} sats`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">Products shipped to dead drop lockers</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setMapDialogOpen(true)}>
                <MapIcon className="h-4 w-4 mr-2" />
                Browse Map
              </Button>
              <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Store className="h-4 w-4 mr-2" />
                    Become a Vendor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Become a Vendor</DialogTitle>
                    <DialogDescription>
                      Sell products that ship to DeadDropstr lockers
                    </DialogDescription>
                  </DialogHeader>
                  <VendorOnboardingForm onComplete={() => setVendorDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                onChange={(e) => {
                  setLocationSearch(e.target.value);
                  setSelectedLocation(null); // Clear specific location when typing
                }}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category pills */}
            <div className="flex gap-2 flex-wrap flex-1">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
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

          {/* Location chips if searched */}
          {(locationSearch || selectedLocation) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Showing products available near:</span>
              {selectedLocation ? (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedLocation(null)}>
                  {LOCKER_LOCATIONS.find(l => l.geohash === selectedLocation)?.name} ✕
                </Badge>
              ) : (
                <Badge variant="secondary">{locationSearch}</Badge>
              )}
            </div>
          )}

          {/* Expanded filters */}
          {showFilters && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <Label>Max Price: {formatPrice(maxPrice)}</Label>
                  <Slider
                    min={0}
                    max={10000000}
                    step={10000}
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
          <ShoppingBag className="h-4 w-4" />
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : viewMode === 'map' ? (
          // Map View
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 min-h-[600px]">
              <LockersMap 
                lockers={LOCKER_LOCATIONS.map(l => ({
                  id: l.id,
                  dTag: l.id,
                  title: l.name,
                  price: 0,
                  geohash: l.geohash,
                  status: 'available',
                  description: `${l.city}, ${l.state}`,
                }))}
                onLockerClick={(locker) => {
                  setSelectedLocation(locker.geohash);
                  setViewMode('grid');
                }}
              />
            </Card>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              <h3 className="font-semibold text-lg">Available Products</h3>
              {filteredProducts.length === 0 ? (
                locationSearch && !locationGeohashes ? (
                  <NoLockersInArea 
                    location={locationSearch} 
                    onClear={() => setLocationSearch('')}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">No products match your filters</p>
                )
              ) : (
                filteredProducts.map(product => (
                  <Card key={product.id} className="hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-medium text-sm">{product.title}</h4>
                        <Badge variant={product.inStock ? 'default' : 'secondary'} className="text-xs">
                          {product.inStock ? 'In Stock' : 'Out'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {product.vendor}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                        <Button asChild size="sm" variant="ghost">
                          <Link to={`/product/${product.dTag}`}>View</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        ) : locationSearch && !locationGeohashes ? (
          // No lockers in searched area
          <NoLockersInArea 
            location={locationSearch} 
            onClear={() => setLocationSearch('')}
          />
        ) : filteredProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
              {locationSearch && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setLocationSearch('')}
                >
                  Clear Location Filter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="hover:border-primary transition-colors group flex flex-col">
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-2">
                      {product.title}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {product.category}
                  </Badge>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-3 w-3" />
                    <span className="truncate">{product.vendor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>Available at {product.availableAt.length} locations</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 flex items-center justify-between">
                  <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                  <Button asChild size="sm" disabled={!product.inStock}>
                    <Link to={`/product/${product.dTag}`}>
                      {product.inStock ? 'Buy' : 'Out of Stock'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Map Dialog */}
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent className="max-w-6xl h-[80vh] p-0">
          <div className="grid md:grid-cols-3 h-full">
            <div className="md:col-span-2 h-full min-h-[400px]">
              <LockersMap 
                lockers={LOCKER_LOCATIONS.map(l => ({
                  id: l.id,
                  dTag: l.id,
                  title: l.name,
                  price: getProductsAtLocker(l.geohash).length,
                  geohash: l.geohash,
                  status: 'available',
                  description: `${l.city}, ${l.state}`,
                }))}
                onLockerClick={(locker) => {
                  setSelectedLocation(locker.geohash);
                  setMapDialogOpen(false);
                }}
              />
            </div>
            <div className="p-4 overflow-y-auto border-l">
              <h3 className="font-semibold text-lg mb-4">Select a Location</h3>
              <div className="space-y-2">
                {LOCKER_LOCATIONS.map(locker => {
                  const productsAtLocation = getProductsAtLocker(locker.geohash);
                  return (
                    <Card 
                      key={locker.id} 
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => {
                        setSelectedLocation(locker.geohash);
                        setMapDialogOpen(false);
                      }}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{locker.name}</p>
                            <p className="text-sm text-muted-foreground">{locker.city}, {locker.state}</p>
                          </div>
                          <Badge>{productsAtLocation.length} products</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Local/peer sellers for circular economy
const LOCAL_SELLERS = [
  {
    id: 'local-1',
    name: 'CryptoMike',
    npub: 'npub1mike...',
    location: 'Near You',
    items: ['Hardware wallets', 'Faraday bags', 'Used mining rigs'],
    trustScore: 4.8,
    sales: 23,
  },
  {
    id: 'local-2',
    name: 'PrivacyPam',
    npub: 'npub1pam...',
    location: 'Nearby',
    items: ['De-googled phones', 'Privacy accessories', 'Books'],
    trustScore: 4.9,
    sales: 47,
  },
  {
    id: 'local-3',
    name: 'BitcoinBill',
    npub: 'npub1bill...',
    location: 'Local',
    items: ['Sats for cash', 'Cold storage setup', 'Node help'],
    trustScore: 5.0,
    sales: 12,
  },
];

// No lockers in area component - shows local peer sellers
function NoLockersInArea({ location, onClear }: { location: string; onClear: () => void }) {
  return (
    <div className="space-y-8">
      {/* Info banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1">No Lockers in {location}</h3>
              <p className="text-muted-foreground">
                Keep it local. These sellers in your area offer meetup or direct shipping. 
                No lockers needed for peer-to-peer trades.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Local sellers grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Local Sellers Near You</h3>
          <Badge variant="outline">P2P Circular Economy</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {LOCAL_SELLERS.map((seller) => (
            <Card key={seller.id} className="hover:border-primary transition-colors group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {seller.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>★ {seller.trustScore}</span>
                      <span>•</span>
                      <span>{seller.sales} sales</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Sells:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {seller.items.map(item => (
                      <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => alert(`Message ${seller.name} via Nostr DM`)}
                  >
                    Message
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => alert(`View ${seller.name}'s listings`)}
                  >
                    View Listings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Premium placement CTA */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-lg">Want premium placement here?</h4>
              <p className="text-muted-foreground text-sm">
                List your items for just 10k sats/month. Be the first seller people see in your area.
              </p>
            </div>
            <Button asChild>
              <Link to="/dashboard">
                Become a Featured Seller
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alternative actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t">
        <Button variant="outline" onClick={onClear}>
          Clear Search
        </Button>
        <Button variant="outline" onClick={() => window.open('https://github.com/PlutarchsEcho/nostr-dead-drop-lockers', '_blank')}>
          Request Locker in {location}
        </Button>
      </div>
    </div>
  );
}

// Vendor onboarding form component
function VendorOnboardingForm({ onComplete }: { onComplete: () => void }) {
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    contact: '',
  });

  const handleSubmit = () => {
    console.log('Vendor registration:', formData);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Store Name</Label>
        <Input
          placeholder="Your store name"
          value={formData.storeName}
          onChange={e => setFormData({ ...formData, storeName: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input
          placeholder="What do you sell?"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Contact (Nostr DM or Email)</Label>
        <Input
          placeholder="How buyers can reach you"
          value={formData.contact}
          onChange={e => setFormData({ ...formData, contact: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} className="flex-1">
          Register as Vendor
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p className="font-medium mb-2">How it works:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Register your store profile</li>
          <li>List products with prices in sats</li>
          <li>When someone buys, you'll receive their chosen locker location</li>
          <li>Ship the product to that locker</li>
          <li>Buyer gets notified and picks up with a code</li>
        </ol>
      </div>
    </div>
  );
}