import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageSquare, User, ArrowRight, Package } from 'lucide-react';

export default function ProxyDropsInfo() {
  useSeoMeta({ title: 'Using a Proxy - DeadDropstr' });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-2xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Using a Proxy</h1>
          <p className="text-muted-foreground">
            Have someone else handle your locker drop
          </p>
        </header>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>What is a Proxy?</CardTitle>
              <CardDescription>
                A paid service to handle your locker drop
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                A proxy receives your package and places it in a locker for a fee. 
                This is useful when you can't be there in person.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium mb-2">Typical proxy fees:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Locker owner proxy: 5,000 - 15,000 sats per drop</li>
                  <li>Courier service: 10,000 - 50,000 sats per drop</li>
                  <li>Friend/acquaintance: Whatever you agree on</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                  1
                </div>
                <div>
                  <p className="font-medium">Rent the locker</p>
                  <p className="text-sm text-muted-foreground">
                    Go to the marketplace and rent a locker for the time you need
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                  2
                </div>
                <div>
                  <p className="font-medium">Ship to the locker address</p>
                  <p className="text-sm text-muted-foreground">
                    Send your package to the locker location (or have your vendor ship there)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                  3
                </div>
                <div>
                  <p className="font-medium">Pay the proxy fee</p>
                  <p className="text-sm text-muted-foreground">
                    Send sats via Lightning (usually upfront, sometimes half now/half after)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                  4
                </div>
                <div>
                  <p className="font-medium">Message your proxy the code</p>
                  <p className="text-sm text-muted-foreground">
                    Send them the locker access code via Nostr DM (or any secure chat)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                  5
                </div>
                <div>
                  <p className="font-medium">They drop it off</p>
                  <p className="text-sm text-muted-foreground">
                    The proxy uses the code to open the locker and places the item inside
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tell the Recipient</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Once the item is in the locker, message the recipient their pickup code. 
                They can then collect it whenever they're ready.
              </p>
              <Button asChild className="w-full">
                <Link to="/messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Messages
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle>That's It</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                No special systems needed. Just rent a locker and share the codes with 
                whoever needs them via secure message.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link to="/marketplace">
                    <Package className="h-4 w-4 mr-2" />
                    Find a Locker
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/my-lockers">
                    <User className="h-4 w-4 mr-2" />
                    My Lockers
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
