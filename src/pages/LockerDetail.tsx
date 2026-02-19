import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, MapPin, Clock, Package, Shield, Key, Copy, CheckCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

// Mock locker data
const MOCK_LOCKERS = [
  {
    id: '1',
    dTag: 'locker-sf-001',
    name: 'Mission District Secure Box',
    description: '24/7 accessible smart locker in secure building. Camera monitored. Perfect for package exchanges and dead drops. Located in a well-lit area with foot traffic.',
    price: 500,
    geohash: '9q8yyz',
    address: '2490 Mission St, San Francisco, CA 94110',
    city: 'San Francisco',
    state: 'CA',
    owner: 'npub1owner1...',
    dimensions: '40x50x60 cm',
    features: ['24/7 Access', 'Camera Monitored', 'Climate Controlled', 'NFC Unlock'],
    availability: 'Available now',
  },
  {
    id: '2',
    dTag: 'locker-nyc-001',
    name: 'Brooklyn Heights Drop',
    description: 'Street-level locker in residential neighborhood. Well-lit and discreet. Great for quick exchanges.',
    price: 750,
    geohash: '9q8yyk',
    address: '145 Columbia Heights, Brooklyn, NY 11201',
    city: 'New York',
    state: 'NY',
    owner: 'npub1owner2...',
    dimensions: '35x45x55 cm',
    features: ['Ground Floor', 'Discreet Location', 'QR Code Access'],
    availability: 'Available now',
  },
];

export default function LockerDetail() {
  const { dTag } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'details' | 'duration' | 'payment' | 'confirmation'>('details');
  const [hours, setHours] = useState(24);
  const [copied, setCopied] = useState(false);

  const locker = MOCK_LOCKERS.find(l => l.dTag === dTag) || MOCK_LOCKERS[0];
  const totalCost = locker.price * hours;

  const handlePayment = () => {
    // Simulate payment processing
    toast({
      title: "Payment received!",
      description: "Generating your access credentials...",
    });
    setTimeout(() => setStep('confirmation'), 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  // Generate a random access code
  const accessCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        {/* Header */}
        <Button variant="ghost" className="mb-4 -ml-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {step === 'details' && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{locker.name}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{locker.city}, {locker.state}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{locker.availability}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">{locker.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Package className="h-4 w-4" />
                      <span className="text-sm">Dimensions</span>
                    </div>
                    <p className="font-medium">{locker.dimensions}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Hourly Rate</span>
                    </div>
                    <p className="font-medium">{locker.price} sats</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Features</p>
                  <div className="flex flex-wrap gap-2">
                    {locker.features.map(feature => (
                      <Badge key={feature} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="font-medium">Secure Dead Drop</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This locker uses end-to-end encryption. Only you and the recipient 
                    (if specified) will have access to the contents.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" className="w-full" onClick={() => setStep('duration')}>
                  Rent This Locker
                </Button>
              </CardFooter>
            </Card>
          </>
        )}

        {step === 'duration' && (
          <Card>
            <CardHeader>
              <CardTitle>Select Rental Duration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Rental Hours: {hours} hrs</Label>
                <input
                  type="range"
                  min="1"
                  max="168"
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 hour</span>
                  <span>1 week (168 hrs)</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hourly rate</span>
                  <span>{locker.price} sats</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span>{hours} hours</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{totalCost.toLocaleString()} sats</span>
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  ≈ ${(totalCost / 50000).toFixed(2)} USD
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep('payment')}>
                Continue to Payment
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 'payment' && (
          <Card>
            <CardHeader>
              <CardTitle>Complete Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="w-48 h-48 bg-muted mx-auto rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="h-12 w-12 mx-auto text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Mock Payment</p>
                    <p className="text-xs text-muted-foreground">(Placeholder)</p>
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCost.toLocaleString()} sats</p>
                  <p className="text-sm text-muted-foreground">Scan to pay with Lightning</p>
                </div>
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground text-center">
                  This is a demo. Click "Simulate Payment" to see the confirmation flow.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setStep('duration')}>
                Back
              </Button>
              <Button className="flex-1" onClick={handlePayment}>
                Simulate Payment
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === 'confirmation' && (
          <Card className="border-green-500/50 bg-green-50/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Rental Confirmed!</CardTitle>
                  <p className="text-sm text-muted-foreground">Your locker is ready</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white p-4 rounded-lg border space-y-4">
                <div>
                  <Label className="text-muted-foreground">Locker Address</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-mono text-sm">{locker.address}</p>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(locker.address)}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-muted-foreground">Access Code</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="bg-black text-white px-4 py-2 rounded font-mono text-lg tracking-widest">
                      {accessCode}
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-10 w-10"
                      onClick={() => copyToClipboard(accessCode)}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Enter this code on the locker keypad or scan NFC
                  </p>
                </div>

                <Separator />

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Key className="h-4 w-4" />
                  <span>Valid for {hours} hours from now</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Next Steps:</strong> Go to the locker location and enter your access code. 
                  You can share this code with someone else for a dead drop exchange.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/marketplace')}>
                Back to Marketplace
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
