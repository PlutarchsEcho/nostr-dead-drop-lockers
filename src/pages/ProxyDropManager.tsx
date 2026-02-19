import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Lock, Unlock, User, Send, Package, 
  CheckCircle, AlertTriangle, Copy, MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

// Mock active proxy drops
const MOCK_PROXY_DROPS = [
  {
    id: 'proxy-1',
    lockerName: 'Mission District Secure Box',
    lockerAddress: '2490 Mission St, San Francisco, CA',
    shipperNpub: 'npub1shipper...',
    proxyNpub: 'npub1lockerowner...',
    proxyName: 'Alice (Locker Owner)',
    recipientNpub: 'npub1recipient...',
    itemDescription: 'Hardware wallet package',
    status: 'awaiting_drop', // awaiting_drop, in_locker, picked_up
    createdAt: new Date(Date.now() - 3600000 * 2),
    lockerCode: null, // Generated on confirm
    recipientCode: null,
  },
  {
    id: 'proxy-2',
    lockerName: 'Capitol Hill Tech Hub',
    lockerAddress: '123 Pine St, Seattle, WA',
    shipperNpub: 'npub1shipper2...',
    proxyNpub: 'npub1courier...',
    proxyName: 'Bob (Courier)',
    recipientNpub: 'npub1recipient2...',
    itemDescription: 'Privacy phone + accessories',
    status: 'in_locker',
    createdAt: new Date(Date.now() - 3600000 * 24),
    lockerCode: '847293', // 6-digit code to open locker
    recipientCode: 'X2Y4Z6',
  },
];

// Mock as recipient
const MOCK_INCOMING = [
  {
    id: 'incoming-1',
    lockerName: 'Brooklyn Heights Drop',
    shipperNpub: 'npub1vendor...',
    shipperName: 'CryptoVault Store',
    itemDescription: 'ColdCard Mk4',
    status: 'in_locker',
    recipientCode: 'A1B3C5',
  },
];

export default function ProxyDropManager() {
  useSeoMeta({ title: 'Proxy Drops - DeadDropstr' });
  const { toast } = useToast();
  const [drops, setDrops] = useState(MOCK_PROXY_DROPS);
  const [incoming] = useState(MOCK_INCOMING);
  const [activeTab, setActiveTab] = useState('outgoing');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<typeof MOCK_PROXY_DROPS[0] | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    lockerId: '',
    proxyNpub: '',
    proxyName: '',
    recipientNpub: '',
    itemDescription: '',
  });

  // Generate codes when shipper confirms drop
  const confirmDrop = (dropId: string) => {
    const lockerCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
    const recipientCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setDrops(drops.map(d => 
      d.id === dropId 
        ? { ...d, status: 'in_locker' as const, lockerCode, recipientCode }
        : d
    ));
    
    toast({
      title: "Drop Confirmed",
      description: "Codes generated. Message the proxy with the locker code.",
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Proxy Drops</h1>
          <p className="text-muted-foreground">
            Have someone else handle the locker drop for you
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="outgoing">Sending (You're Shipper)</TabsTrigger>
            <TabsTrigger value="incoming">Receiving</TabsTrigger>
          </TabsList>

          <TabsContent value="outgoing" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Your Proxy Shipments</h2>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Package className="h-4 w-4 mr-2" />
                New Proxy Drop
              </Button>
            </div>

            {drops.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active proxy drops</p>
                </CardContent>
              </Card>
            ) : (
              drops.map((drop) => (
                <Card key={drop.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{drop.lockerName}</CardTitle>
                        <CardDescription>{drop.itemDescription}</CardDescription>
                      </div>
                      <Badge variant={drop.status === 'in_locker' ? 'default' : 'outline'}>
                        {drop.status === 'awaiting_drop' ? 'Awaiting Drop' : 'In Locker'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Proxy:</span>
                        <p>{drop.proxyName || drop.proxyNpub}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recipient:</span>
                        <p className="font-mono text-xs">{drop.recipientNpub}</p>
                      </div>
                    </div>

                    {drop.status === 'awaiting_drop' && (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                          <div>
                            <p className="font-medium text-amber-900">Action Required</p>
                            <p className="text-sm text-amber-800">
                              1. Ship package to: <strong>{drop.lockerAddress}</strong>
                            </p>
                            <p className="text-sm text-amber-800">
                              2. Click "Confirm Shipped" to generate codes
                            </p>
                            <p className="text-sm text-amber-800">
                              3. Message the proxy with the locker code
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {drop.status === 'in_locker' && drop.lockerCode && (
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <p className="font-medium text-green-900">Package Secured</p>
                          <p className="text-sm text-green-800">
                            Share these codes via Nostr DM
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-black text-white p-4 rounded-lg text-center">
                            <p className="text-xs text-white/60 mb-1">Locker Code (send to proxy)</p>
                            <div className="flex items-center justify-center gap-2">
                              <p className="font-mono text-2xl tracking-widest">{drop.lockerCode}</p>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-white"
                                onClick={() => copyCode(drop.lockerCode!)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-primary/10 p-4 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground mb-1">Recipient Code (send to recipient)</p>
                            <div className="flex items-center justify-center gap-2">
                              <p className="font-mono text-2xl tracking-widest">{drop.recipientCode}</p>
                              <Button size="icon" variant="ghost" className="h-8 w-8"
                                onClick={() => copyCode(drop.recipientCode!)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1" asChild>
                            <Link to="/messages">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message Proxy
                            </Link>
                          </Button>
                          <Button variant="outline" className="flex-1" asChild>
                            <Link to="/messages">
                              <Send className="h-4 w-4 mr-2" />
                              Message Recipient
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {drop.status === 'awaiting_drop' && (
                      <Button className="w-full" onClick={() => confirmDrop(drop.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Shipped (Generate Codes)
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="incoming" className="space-y-4">
            <h2 className="text-lg font-semibold">Packages for You</h2>
            
            {incoming.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No incoming packages</p>
                </CardContent>
              </Card>
            ) : (
              incoming.map((pkg) => (
                <Card key={pkg.id} className="border-primary/50 bg-primary/5">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{pkg.lockerName}</CardTitle>
                        <CardDescription>From: {pkg.shipperName}</CardDescription>
                      </div>
                      <Badge>Ready for Pickup</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-black text-white p-6 rounded-lg text-center">
                      <p className="text-xs text-white/60 mb-2">Your Pickup Code</p>
                      <p className="font-mono text-3xl tracking-[0.2em]">{pkg.recipientCode}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => copyCode(pkg.recipientCode)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Get Directions
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground text-center">
                      Show this code at the locker keypad or scan NFC to open
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* How it works */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Proxy Drops Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium">1. Pick a Proxy</p>
                <p className="text-sm text-muted-foreground">
                  Choose someone to handle the drop (locker owner, friend, courier)
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium">2. Ship</p>
                <p className="text-sm text-muted-foreground">
                  Send package to locker address
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium">3. Message Proxy</p>
                <p className="text-sm text-muted-foreground">
                  DM them the locker code so they can open it
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Unlock className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium">4. Recipient Picks Up</p>
                <p className="text-sm text-muted-foreground">
                  They use their code to collect
                </p>
              </div>
            </div>

            <div className="mt-6 bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Simple & Flexible:</strong> No encryption needed - just message your proxy 
                the locker code via Nostr DM. The proxy can be anyone: the locker owner, a trusted 
                friend, or a courier service. You control who gets access by who you share the code with.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Proxy Drop Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Proxy Drop</DialogTitle>
            <DialogDescription>
              Have someone else handle the locker placement
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Locker</Label>
              <select 
                className="w-full p-2 border rounded-md"
                value={formData.lockerId}
                onChange={(e) => setFormData({...formData, lockerId: e.target.value})}
              >
                <option value="">Choose a locker...</option>
                <option value="locker-sf-001">Mission District Secure Box (SF)</option>
                <option value="locker-nyc-001">Brooklyn Heights Drop (NYC)</option>
                <option value="locker-sea-001">Capitol Hill Tech Hub (SEA)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Proxy (who will place item in locker)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  placeholder="Name (e.g., Alice)"
                  value={formData.proxyName}
                  onChange={(e) => setFormData({...formData, proxyName: e.target.value})}
                />
                <Input 
                  placeholder="npub1..."
                  value={formData.proxyNpub}
                  onChange={(e) => setFormData({...formData, proxyNpub: e.target.value})}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This can be the locker owner, a friend, or a courier
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Recipient npub (who will pick up)</Label>
              <Input 
                placeholder="npub1..."
                value={formData.recipientNpub}
                onChange={(e) => setFormData({...formData, recipientNpub: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Item Description</Label>
              <Input 
                placeholder="What's being shipped?"
                value={formData.itemDescription}
                onChange={(e) => setFormData({...formData, itemDescription: e.target.value})}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={() => {
              toast({ title: "Proxy drop created" });
              setShowCreateDialog(false);
            }}>
              Create Drop
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
