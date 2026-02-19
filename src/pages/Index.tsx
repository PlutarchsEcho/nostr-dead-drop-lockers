import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Settings, MessageSquare, Zap, Cpu, Download, Package, Wrench } from 'lucide-react';

export default function Index() {
  useSeoMeta({
    title: 'DeadDropstr - Nostr-Native Smart Lockers',
    description: 'A decentralized marketplace for autonomous physical lockers powered by Nostr and Lightning.',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <header className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            The <span className="text-primary">Nostr-Native</span> Dead Drop Network
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-10">
            Rent autonomous smart lockers for anonymous P2P exchanges. Pay with Lightning. No middlemen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link to="/marketplace">
                <Map className="mr-2 h-5 w-5" />
                Explore Lockers
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link to="/dashboard">
                <Settings className="mr-2 h-5 w-5" />
                Owner Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/60 backdrop-blur">
            <CardHeader>
              <Map className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Find a Locker</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Browse the map to find available smart lockers near you. Filter by size, price, and trust score.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur">
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Pay with Lightning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Rent instantly using Nostr Wallet Connect (NIP-47) or WebLN. The locker unlocks once payment confirms.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur">
            <CardHeader>
              <MessageSquare className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Negotiate Privately</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Chat with buyers or sellers via encrypted NIP-17 messages. Goods payment is direct P2P via zaps.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur">
            <CardHeader>
              <Settings className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Manage Your Box</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Owners configure fees, overdue penalties, proxy mode, and abandoned property rules from their dashboard.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Ready to Deploy a Locker?</h2>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Open Hardware Standard */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <Cpu className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Open Hardware Standard</CardTitle>
              <CardDescription>
                Fully documented, hackable, and extensible
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Our reference design uses off-the-shelf components: ESP32-S3, secure element, 
                4G/WiFi module, and standard electronic locks. Fully open source firmware.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                <li>Nostr-native event processing</li>
                <li>Offline-capable code validation</li>
                <li>Signed access logs</li>
                <li>Battery backup & tamper detection</li>
              </ul>
              <Button variant="outline" className="w-full" onClick={() => window.open('https://github.com/PlutarchsEcho/deaddrop-hardware', '_blank')}>
                <Download className="mr-2 h-4 w-4" />
                View Specs
              </Button>
            </CardContent>
          </Card>

          {/* Ready-to-Go Kits */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <Package className="h-10 w-10 text-primary mb-2" />
              <CardTitle>DIY Kits</CardTitle>
              <CardDescription>
                Everything you need to build your own
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pre-sourced component kits with step-by-step assembly guides. 
                Just add your own lockbox or enclosure.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Basic Kit</span>
                  <span className="font-medium">~$85</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pro Kit (4G + Secure Element)</span>
                  <span className="font-medium">~$150</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Complete Enclosure</span>
                  <span className="font-medium">~$200-500</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Package className="mr-2 h-4 w-4" />
                Browse Kits
              </Button>
            </CardContent>
          </Card>

          {/* Free Plans */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <Wrench className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Build Your Own</CardTitle>
              <CardDescription>
                Free plans and BOMs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Download complete schematics, PCB layouts, 3D printable enclosures, 
                and firmware. Source your own parts anywhere in the world.
              </p>
              <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                <li>Gerber files & PCB designs</li>
                <li>3D printable STL files</li>
                <li>Bill of Materials (BOM)</li>
                <li>Assembly instructions</li>
                <li>Firmware source code</li>
              </ul>
              <Button className="w-full" onClick={() => window.open('https://github.com/PlutarchsEcho/deaddrop-hardware/releases', '_blank')}>
                <Download className="mr-2 h-4 w-4" />
                Download Plans
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Button asChild size="lg">
            <Link to="/dashboard">
              <Settings className="mr-2 h-5 w-5" />
              Configure Your Locker
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <a
          href="https://shakespeare.diy"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Vibed with Shakespeare
        </a>
      </footer>
    </div>
  );
}
