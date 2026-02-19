import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Search, Filter, ShoppingBag, Store, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';

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
}

// Mock products for demo
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
  },
];

const CATEGORIES = ['All', 'Electronics', 'Accessories', 'Bitcoin', 'Communications', 'Storage'];

export default function MarketplaceMain() {
  const { nostr } = useNostr();
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);

  // Query real products from Nostr
  const { data: realProducts, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const events = await nostr.query([{ kinds: [30402], '#t': ['product'], limit: 200 }]);
        // Parse events into products
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
        })) as Product[];
      } catch {
        return [];
      }
    },
    staleTime: 60_000,
  });

  const products = realProducts?.length ? realProducts : MOCK_PRODUCTS;

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = !searchTerm || 
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price <= maxPrice;
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesPrice && matchesCategory;
    });
  }, [products, searchTerm, maxPrice, selectedCategory]);

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
              <Button asChild>
                <Link to="/dashboard">
                  <Plus className="h-4 w-4 mr-2" />
                  List Product
                </Link>
              </Button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
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

        {/* Product grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map(product => (
              <Card key={product.id} className="hover:border-primary transition-colors group flex flex-col">
                {/* Product image placeholder */}
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
                </CardContent>

                <CardFooter className="pt-0 flex items-center justify-between">
                  <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                  <Button asChild size="sm" disabled={!product.inStock}>
                    <Link to={`/product/${product.dTag}`}>
                      {product.inStock ? 'Buy Now' : 'Out of Stock'}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Vendor onboarding form component
function VendorOnboardingForm({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: '',
    description: '',
    contact: '',
  });

  const handleSubmit = () => {
    // TODO: Publish vendor profile to Nostr
    console.log('Vendor registration:', formData);
    onComplete();
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <>
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
        </>
      )}
      
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