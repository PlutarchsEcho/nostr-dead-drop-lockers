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
          <h1 className="text-2xl font-semibold">Owner Dashboard</h1>
          <LoginArea className="max-w-60" />
        </header>

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

        <footer className="text-center text-sm text-muted-foreground pt-8">
          <a href="https://shakespeare.diy" target="_blank" rel="noopener noreferrer">
            Vibed with Shakespeare
          </a>
        </footer>
      </div>
    </div>
  );
}
