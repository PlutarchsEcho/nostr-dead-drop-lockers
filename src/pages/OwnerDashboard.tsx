import { useSeoMeta } from '@unhead/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { LoginArea } from '@/components/auth/LoginArea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { useState } from 'react';
import { createLockerTags } from '@/lib/lockerTypes';
import geohash from 'latlon-geohash';
import useMyLockers from '@/hooks/useMyLockers';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Zap, Cpu, Package, Download } from 'lucide-react';

export default function OwnerDashboard() {
  useSeoMeta({ title: 'Owner Dashboard - Dead Drop Network' });
  const { user } = useCurrentUser();
  const { mutateAsync: createEvent, isPending } = useNostrPublish();
  const { toast } = useToast();
  const { data: myLockers, isLoading: loadingLockers } = useMyLockers();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [baseFee, setBaseFee] = useState('1000');
  const [overdueFee, setOverdueFee] = useState('10');
  const [overdueDays, setOverdueDays] = useState('7');
  const [proxyMode, setProxyMode] = useState(false);
  const [proxyFee, setProxyFee] = useState('500');
  const [abandonDays, setAbandonDays] = useState('30');
  const [dimensions, setDimensions] = useState('30x30x45');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const gh = geohash.encode(parseFloat(lat), parseFloat(lng), 7);
      const tags = createLockerTags({
        title,
        description,
        location,
        geohash: gh,
        baseFee: parseInt(baseFee),
        overdueFee: parseInt(overdueFee),
        overdueDays: parseInt(overdueDays),
        proxyMode,
        proxyFee: parseInt(proxyFee),
        abandonDays: parseInt(abandonDays),
        dimensions,
      });

      await createEvent({ kind: 30402, content: description, tags });
      toast({ title: 'Locker Published', description: 'Your locker listing is now live.' });
      setTitle('');
      setDescription('');
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Owner Dashboard</CardTitle>
            <CardDescription>Please log in to manage your lockers.</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginArea className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Host Dashboard</h1>
          <LoginArea className="max-w-60" />
        </header>

        <Tabs defaultValue="lockers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="lockers">My Lockers</TabsTrigger>
            <TabsTrigger value="proxy">Become a Proxy</TabsTrigger>
          </TabsList>

          <TabsContent value="lockers" className="space-y-8">
            {/* My Lockers Section */}
            <section>
              <h2 className="text-xl font-medium mb-4">My Lockers</h2>
              {loadingLockers ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : myLockers && myLockers.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myLockers.map((locker) => (
                    <Card key={locker.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{locker.title}</CardTitle>
                          <Badge variant={locker.status === 'available' ? 'default' : 'secondary'}>
                            {locker.status}
                          </Badge>
                        </div>
                        <CardDescription>{locker.location || locker.geohash}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{locker.description}</p>
                        <div className="flex justify-between text-sm">
                          <span>Fee: {locker.price} sats</span>
                          {locker.proxyMode && <Badge variant="outline">Proxy</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    You haven't created any lockers yet.
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Hardware Requirements Card */}
            <Card className="bg-muted/50 border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Don't Have Hardware Yet?</CardTitle>
                <CardDescription>
                  You'll need a Nostr-compatible smart locker to complete setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  DeadDropstr lockers run on open hardware. Choose your path:
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <Button variant="outline" size="sm" className="h-auto py-2" onClick={() => window.open('https://github.com/PlutarchsEcho/deaddrop-hardware', '_blank')}>
                    <Cpu className="mr-2 h-4 w-4" />
                    View Open Specs
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2">
                    <Package className="mr-2 h-4 w-4" />
                    Order DIY Kit
                  </Button>
                  <Button variant="outline" size="sm" className="h-auto py-2" onClick={() => window.open('https://github.com/PlutarchsEcho/deaddrop-hardware/releases', '_blank')}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Plans
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Estimated build cost: $85-250 depending on features (4G, secure element, enclosure)
                </p>
              </CardContent>
            </Card>

            {/* Create Locker Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Locker</CardTitle>
                <CardDescription>
                  Configure your smart locker and publish it to the network.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Downtown Dead Drop Box #1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dimensions">Dimensions (cm)</Label>
                      <Input
                        id="dimensions"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                        placeholder="WxHxD e.g. 30x30x45"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your locker, its features, and any special instructions..."
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location Address</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="123 Main St, City"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        placeholder="51.505"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        placeholder="-0.09"
                        required
                      />
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium">Fee Structure</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="baseFee">Base Fee (sats)</Label>
                        <Input
                          id="baseFee"
                          type="number"
                          value={baseFee}
                          onChange={(e) => setBaseFee(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="overdueFee">Overdue Fee (%)</Label>
                        <Input
                          id="overdueFee"
                          type="number"
                          value={overdueFee}
                          onChange={(e) => setOverdueFee(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="overdueDays">Overdue After (days)</Label>
                        <Input
                          id="overdueDays"
                          type="number"
                          value={overdueDays}
                          onChange={(e) => setOverdueDays(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Proxy Mode</h3>
                        <p className="text-sm text-muted-foreground">
                          You manually receive and stock items for an extra fee.
                        </p>
                      </div>
                      <Switch checked={proxyMode} onCheckedChange={setProxyMode} />
                    </div>
                    {proxyMode && (
                      <div className="space-y-2">
                        <Label htmlFor="proxyFee">Proxy Fee (sats)</Label>
                        <Input
                          id="proxyFee"
                          type="number"
                          value={proxyFee}
                          onChange={(e) => setProxyFee(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="border rounded-lg p-4 space-y-4">
                    <h3 className="font-medium">Abandoned Property</h3>
                    <p className="text-sm text-muted-foreground">
                      After this period, unclaimed items become owner property or are auctioned.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="abandonDays">Days Until Abandoned</Label>
                      <Input
                        id="abandonDays"
                        type="number"
                        value={abandonDays}
                        onChange={(e) => setAbandonDays(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? 'Publishing...' : 'Publish Locker'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proxy">
            <ProxyRegistration />
          </TabsContent>
        </Tabs>

        <footer className="text-center text-sm text-muted-foreground pt-8">
          <a href="https://shakespeare.diy" target="_blank" rel="noopener noreferrer">
            Vibed with Shakespeare
          </a>
        </footer>
      </div>
    </div>
  );
}

// Proxy Registration Component
function ProxyRegistration() {
  const { toast } = useToast();
  const [isRegistered, setIsRegistered] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    feePerDrop: '10000',
    deposit: '50000',
    serviceAreas: '',
    npub: '',
  });

  const handleRegister = () => {
    toast({
      title: "Proxy Registration Submitted",
      description: `Deposit of ${formData.deposit} sats required to activate.`,
    });
    setIsRegistered(true);
  };

  if (isRegistered) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle>You're a Verified Proxy!</CardTitle>
              <CardDescription>Your proxy service is now active</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Your Fee</p>
              <p className="text-2xl font-bold">{parseInt(formData.feePerDrop).toLocaleString()} sats</p>
              <p className="text-xs text-muted-foreground">per drop</p>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">Deposit Staked</p>
              <p className="text-2xl font-bold">{parseInt(formData.deposit).toLocaleString()} sats</p>
              <p className="text-xs text-muted-foreground">held in escrow</p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
            <p className="font-medium mb-2">How it works:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Shippers will message you with drop requests</li>
              <li>You receive packages at your address or meet for handoff</li>
              <li>You place items in lockers using the codes they provide</li>
              <li>You earn {formData.feePerDrop} sats per completed drop</li>
              <li>Your deposit ensures trust - can be slashed for bad behavior</li>
            </ul>
          </div>

          <Button className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            View Drop Requests
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Become a Verified Proxy</CardTitle>
              <CardDescription>Get paid to handle locker drops for others</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="font-medium">What is a proxy?</p>
            <p className="text-sm text-muted-foreground">
              A proxy receives packages on behalf of shippers and places them in lockers. 
              You earn a fee per drop while providing a valuable service to the network.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Name / Handle</Label>
              <Input 
                placeholder="How shippers will know you"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Your npub (for receiving payments)</Label>
              <Input 
                placeholder="npub1..."
                value={formData.npub}
                onChange={(e) => setFormData({...formData, npub: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Fee per Drop (sats)</Label>
              <Input 
                type="number"
                value={formData.feePerDrop}
                onChange={(e) => setFormData({...formData, feePerDrop: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Typical range: 5,000 - 50,000 sats per drop
              </p>
            </div>

            <div className="space-y-2">
              <Label>Service Areas</Label>
              <Input 
                placeholder="e.g., San Francisco, Bay Area"
                value={formData.serviceAreas}
                onChange={(e) => setFormData({...formData, serviceAreas: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Security Deposit (sats)</Label>
              <Input 
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({...formData, deposit: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 50,000 sats. Held in escrow, returned if you leave the network. 
                Can be slashed for fraud or no-shows.
              </p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Your deposit creates trust. If you fail to complete 
              drops or steal packages, the deposit can be claimed by affected parties 
              through the dispute resolution system.
            </p>
          </div>

          <Button className="w-full" onClick={handleRegister}>
            <Shield className="h-4 w-4 mr-2" />
            Register as Proxy ({formData.deposit} sats deposit)
          </Button>
        </CardContent>
      </Card>

      {/* Existing Proxies */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Top Proxies in the Network</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p className="font-medium">Alice (SF Bay)</p>
              <p className="text-sm text-muted-foreground">★ 4.9 • 127 drops • 10k sats</p>
            </div>
            <Badge variant="secondary">Verified</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p className="font-medium">Bob (NYC)</p>
              <p className="text-sm text-muted-foreground">★ 4.8 • 89 drops • 15k sats</p>
            </div>
            <Badge variant="secondary">Verified</Badge>
          </div>
          <div className="flex items-center justify-between p-3 bg-white rounded-lg">
            <div>
              <p className="font-medium">Carol (Seattle)</p>
              <p className="text-sm text-muted-foreground">★ 5.0 • 45 drops • 8k sats</p>
            </div>
            <Badge variant="secondary">Verified</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
