import { useSeoMeta } from '@unhead/react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Map, Settings, MessageSquare, Zap } from 'lucide-react';

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
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Deploy a Locker?</CardTitle>
            <CardDescription>
              Flash our ESP32 template onto your hardware, configure via the dashboard, and start earning sats.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </CardContent>
        </Card>
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
