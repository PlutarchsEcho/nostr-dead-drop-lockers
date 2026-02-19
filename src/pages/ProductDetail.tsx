import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Store, Truck, MapPin, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';

// Mock product data
const MOCK_PRODUCTS = [
  {
    id: '1',
    dTag: 'prod-001',
    title: 'Privacy-First Smartphone',
    description: 'De-googled Android phone with GrapheneOS pre-installed. Full privacy setup including hardened browser, encrypted messaging, and no Google services. Perfect for those who value their digital privacy.',
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
    description: 'Military-grade signal blocking pouch. Protects against tracking, surveillance, and unauthorized access to your device.',
    price: 45000,
    category: 'Accessories',
    vendor: 'SignalSafe',
    vendorNpub: 'npub1def...',
    inStock: true,
  },
];

// Mock locker locations
const MOCK_LOCKERS = [
  { id: '1', name: 'Downtown SF', location: 'San Francisco, CA', geohash: '9q8yyz' },
  { id: '2', name: 'Union Square', location: 'New York, NY', geohash: '9q8yyk' },
  { id: '3', name: 'Tech Hub', location: 'Seattle, WA', geohash: 'dpwh' },
  { id: '4', name: 'LAX Area', location: 'Los Angeles, CA', geohash: '9q8yym' },
];

export default function ProductDetail() {
  const { dTag } = useParams();
  const { toast } = useToast();
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [selectedLocker, setSelectedLocker] = useState('');
  const [orderStep, setOrderStep] = useState<'locker' | 'confirm' | 'success'>('locker');

  // Find product
  const product = MOCK_PRODUCTS.find(p => p.dTag === dTag) || MOCK_PRODUCTS[0];

  const formatPrice = (sats: number) => {
    if (sats >= 100000000) return `₿ ${(sats / 100000000).toFixed(3)}`;
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(2)}M sats`;
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}k sats`;
    return `${sats} sats`;
  };

  const handleOrder = () => {
    // TODO: Create order on Nostr
    toast({
      title: "Order placed!",
      description: "The vendor has been notified. You'll receive a pickup code once they ship to your selected locker.",
    });
    setShowOrderDialog(false);
    setOrderStep('locker');
    setSelectedLocker('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Back button */}
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/marketplace">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
            <ShoppingBag className="h-32 w-32 text-muted-foreground" />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.category}</Badge>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Store className="h-4 w-4" />
                <span>{product.vendor}</span>
              </div>
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center justify-between py-4 border-y">
              <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
              <Badge variant={product.inStock ? 'default' : 'secondary'}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Ships to DeadDropstr Lockers</p>
                  <p className="text-muted-foreground">Pick up anonymously at a location near you</p>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full"
                disabled={!product.inStock}
                onClick={() => setShowOrderDialog(true)}
              >
                {product.inStock ? 'Buy Now' : 'Out of Stock'}
              </Button>
            </div>
          </div>
        </div>

        {/* How it works */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>How DeadDropstr Delivery Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="font-bold">1</span>
                </div>
                <p className="font-medium">Choose Locker</p>
                <p className="text-sm text-muted-foreground">Select a convenient pickup location</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="font-bold">2</span>
                </div>
                <p className="font-medium">Pay with Bitcoin</p>
                <p className="text-sm text-muted-foreground">Lightning or on-chain</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="font-bold">3</span>
                </div>
                <p className="font-medium">Vendor Ships</p>
                <p className="text-sm text-muted-foreground">Product delivered to your locker</p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="font-bold">4</span>
                </div>
                <p className="font-medium">Pick Up</p>
                <p className="text-sm text-muted-foreground">Receive code & collect anonymously</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>
              Choose a locker location for pickup
            </DialogDescription>
          </DialogHeader>

          {orderStep === 'locker' && (
            <div className="space-y-4">
              <RadioGroup value={selectedLocker} onValueChange={setSelectedLocker}>
                <div className="space-y-2">
                  {MOCK_LOCKERS.map(locker => (
                    <div key={locker.id}>
                      <RadioGroupItem
                        value={locker.id}
                        id={locker.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={locker.id}
                        className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{locker.name}</p>
                            <p className="text-sm text-muted-foreground">{locker.location}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button 
                className="w-full"
                disabled={!selectedLocker}
                onClick={() => setOrderStep('confirm')}
              >
                Continue
              </Button>
            </div>
          )}

          {orderStep === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">Order Summary</p>
                <p className="font-medium">{product.title}</p>
                <p className="text-lg font-bold">{formatPrice(product.price)}</p>
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Deliver to:</p>
                  <p className="font-medium">
                    {MOCK_LOCKERS.find(l => l.id === selectedLocker)?.name}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOrderStep('locker')}>
                  Back
                </Button>
                <Button className="flex-1" onClick={handleOrder}>
                  Pay & Place Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}