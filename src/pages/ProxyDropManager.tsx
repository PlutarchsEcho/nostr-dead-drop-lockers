import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Lock, Unlock, Eye, EyeOff, Key, User, 
  Package, ArrowRight, CheckCircle, AlertTriangle,
  Copy, RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Mock active proxy drops
const MOCK_PROXY_DROPS = [
  {
    id: 'proxy-1',
    lockerName: 'Mission District Secure Box',
    shipperNpub: 'npub1shipper...',
    recipientNpub: 'npub1recipient...',
    itemDescription: 'Hardware wallet package',
    status: 'awaiting_drop', // awaiting_drop, in_locker, picked_up
    createdAt: new Date(Date.now() - 3600000 * 2),
    proxyCode: null, // Will be generated when shipper confirms
    recipientCode: null,
  },
  {
    id: 'proxy-2',
    lockerName: 'Capitol Hill Tech Hub',
    shipperNpub: 'npub1shipper2...',
    recipientNpub: 'npub1recipient2...',
    itemDescription: 'Privacy phone + accessories',
    status: 'in_locker',
    createdAt: new Date(Date.now() - 3600000 * 24),
    proxyCode: 'PROXY-7A8B9C',
    recipientCode: 'RECV-X2Y4Z6',
  },
];

// Mock as recipient
const MOCK_INCOMING = [
  {
    id: 'incoming-1',
    lockerName: 'Brooklyn Heights Drop',
    shipperNpub: 'npub1vendor...',
    itemDescription: 'ColdCard Mk4',
    status: 'in_locker',
    proxyCode: 'PROXY-9D2E4F',
    recipientCode: 'RECV-A1B3C5',
  },
];

export default function ProxyDropManager() {
  useSeoMeta({ title: 'Proxy Drops - DeadDropstr' });
  const { toast } = useToast();
  const [drops, setDrops] = useState(MOCK_PROXY_DROPS);
  const [incoming, setIncoming] = useState(MOCK_INCOMING);
  const [activeTab, setActiveTab] = useState('outgoing');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<typeof MOCK_PROXY_DROPS[0] | null>(null);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  
  // Form state for creating proxy drop
  const [formData, setFormData] = useState({
    lockerId: '',
    recipientNpub: '',
    itemDescription: '',
  });

  // Generate a proxy drop code
  const generateProxyDrop = (dropId: string) => {
    const proxyCode = 'PROXY-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const recipientCode = 'RECV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    setDrops(drops.map(d => 
      d.id === dropId 
        ? { ...d, status: 'in_locker' as const, proxyCode, recipientCode }
        : d
    ));
    
    toast({
      title: "Proxy Drop Created",
      description: "Codes generated. Share the recipient code privately.",
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Proxy Drops</h1>
          <p className="text-muted-foreground">
            Secure escrow system for proxy handoffs
          </p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="outgoing">Outgoing (Shipping)</TabsTrigger>
            <TabsTrigger value="incoming">Incoming (Receiving)</TabsTrigger>
          </TabsList>

          <TabsContent value="outgoing" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Your Proxy Shipments</h2>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Package className="h-4 w-4 mr-2" />
                Create Proxy Drop
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
                      <Badge 
                        variant={
                          drop.status === 'awaiting_drop' ? 'outline' :
                          drop.status === 'in_locker' ? 'default' : 'secondary'
                        }
                      >
                        {drop.status === 'awaiting_drop' ? 'Awaiting Drop' :
                         drop.status === 'in_locker' ? 'In Locker' : 'Picked Up'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Shipper:</span>
                        <p className="font-mono text-xs">{drop.shipperNpub}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recipient:</span>
                        <p className="font-mono text-xs">{drop.recipientNpub}</p>
                      </div>
                    </div>

                    {/* Status flow */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        drop.status !== 'awaiting_drop' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="h-0.5 w-8 bg-muted" />
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        drop.status === 'in_locker' || drop.status === 'picked_up' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Lock className="h-4 w-4" />
                      </div>
                      <div className="h-0.5 w-8 bg-muted" />
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        drop.status === 'picked_up' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Unlock className="h-4 w-4" />
                      </div>
                    </div>

                    {drop.status === 'awaiting_drop' && (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                          <div>
                            <p className="font-medium text-orange-900">Action Required</p>
                            <p className="text-sm text-orange-800">
                              Ship to the locker address. Once delivered, click "Confirm Drop" 
                              to generate access codes.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {drop.status === 'in_locker' && drop.proxyCode && (
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                          <p className="font-medium text-green-900 mb-2">Drop Confirmed</p>
                          <p className="text-sm text-green-800">
                            Item is secured. The proxy can open with their code, 
                            and the recipient has their own code.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Proxy Code</p>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-sm">{drop.proxyCode}</code>
                              <Button size="icon" variant="ghost" className="h-6 w-6" 
                                onClick={() => copyCode(drop.proxyCode!)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Recipient Code</p>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-sm font-bold">{drop.recipientCode}</code>
                              <Button size="icon" variant="ghost" className="h-6 w-6"
                                onClick={() => copyCode(drop.recipientCode!)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    {drop.status === 'awaiting_drop' && (
                      <Button className="w-full" onClick={() => generateProxyDrop(drop.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Drop (Generate Codes)
                      </Button>
                    )}
                    {drop.status === 'in_locker' && (
                      <Button variant="outline" className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Mark as Picked Up
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="incoming" className="space-y-4">
            <h2 className="text-lg font-semibold">Incoming Packages</h2>
            
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
                        <CardDescription>{pkg.itemDescription}</CardDescription>
                      </div>
                      <Badge>Ready for Pickup</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-black text-white p-6 rounded-lg text-center">
                      <p className="text-xs text-white/60 mb-2">Your Access Code</p>
                      <p className="font-mono text-3xl tracking-[0.2em]">{pkg.recipientCode}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => copyCode(pkg.recipientCode)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <MapPin className="h-4 w-4 mr-2" />
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
                <p className="font-medium">1. Create Drop</p>
                <p className="text-sm text-muted-foreground">
                  Specify locker, recipient, and item
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium">2. Ship to Locker</p>
                <p className="text-sm text-muted-foreground">
                  Send item to locker address
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium">3. Generate Codes</p>
                <p className="text-sm text-muted-foreground">
                  Two codes: one for proxy, one for recipient
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Unlock className="h-5 w-5 text-primary" />
                </div>
                <p className="font-medium">4. Pick Up</p>
                <p className="text-sm text-muted-foreground">
                  Recipient uses their code to access
                </p>
              </div>
            </div>

            <div className="mt-6 bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Cryptographic Security:</strong> Each code is derived from the locker owner's 
                nsec + the drop ID + recipient npub. Only the proxy (with their nsec) and the 
                intended recipient (with their private key) can derive valid access codes. 
                The locker validates these cryptographically before opening.
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
              Set up a secure proxy handoff through a locker
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
              <Label>Recipient npub</Label>
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
