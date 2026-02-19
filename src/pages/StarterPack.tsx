import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Zap, Lock, Box, Radio, ArrowRight, DollarSign, MapPin } from 'lucide-react';

export default function StarterPack() {
  useSeoMeta({ 
    title: 'Starter Pack - DeadDropstr',
    description: 'Build a locker for $25. Bare minimum MVP for maximum geographic reach.'
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Hero */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <DollarSign className="h-4 w-4" />
            Sub-$30 Controller
          </div>
          <h1 className="text-4xl font-bold mb-4">The Starter Pack</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bare bones. Field-upgradable. Maximum geographic reach for minimum cost.
          </p>
        </header>

        {/* Price Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>The Trade-offs</CardTitle>
            <CardDescription>What you give up, what you keep</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Feature</th>
                    <th className="text-left py-2">Full System</th>
                    <th className="text-left py-2 text-primary">Starter Pack</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2">Display</td>
                    <td>1.28" LCD ($8)</td>
                    <td className="text-primary">RGB LED + beeps ($1)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Input</td>
                    <td>Keypad + NFC ($8)</td>
                    <td className="text-primary">NFC only ($3)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Secure Element</td>
                    <td>ATECC608A ($1)</td>
                    <td className="text-primary">Flash encrypt ($0)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Connectivity</td>
                    <td>WiFi + 4G ($15)</td>
                    <td className="text-primary">WiFi only ($0)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Power</td>
                    <td>12V PSU + battery ($20)</td>
                    <td className="text-primary">USB power bank (BYO)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Enclosure</td>
                    <td>Custom ($50+)</td>
                    <td className="text-primary">Repurposed ($0)</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="py-2">Controller</td>
                    <td>~$38</td>
                    <td className="text-primary">~$12</td>
                  </tr>
                  <tr className="font-bold text-lg">
                    <td className="py-2">Total Build</td>
                    <td>~$100-150</td>
                    <td className="text-primary">~$20-40</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Core Spec */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Starter Controller ($12)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Cpu className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">ESP32-C3 ($3)</p>
                    <p className="text-sm text-muted-foreground">Single-core, WiFi/BLE, 4MB flash</p>
                    <a 
                      href="https://www.amazon.com/s?k=esp32-c3-devkit" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Amazon →
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Radio className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">NFC Reader PN532 ($3)</p>
                    <p className="text-sm text-muted-foreground">Only input method. No keypad.</p>
                    <a 
                      href="https://www.amazon.com/s?k=pn532+nfc+module" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Amazon →
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Relay Module ($3)</p>
                    <p className="text-sm text-muted-foreground">Direct lock control. No RS-485 bus.</p>
                    <a 
                      href="https://www.amazon.com/s?k=5v+relay+module+dual" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Amazon →
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Box className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">12V Solenoid ($8)</p>
                    <p className="text-sm text-muted-foreground">Cabinet lock or drawer bolt.</p>
                    <a 
                      href="https://www.amazon.com/s?k=12v+solenoid+lock+electronic" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Amazon →
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium">Power Bank (BYO)</p>
                    <p className="text-sm text-muted-foreground">Any USB power bank you have.</p>
                    <span className="text-xs text-muted-foreground">Or buy: 10000mAh Anker ~$15</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">What You Keep</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">✓</Badge>
                  <span>Full network compatibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">✓</Badge>
                  <span>Nostr event processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">✓</Badge>
                  <span>NFC tap-to-unlock</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">✓</Badge>
                  <span>Phone app control (BLE)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">✓</Badge>
                  <span>Lightning payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">✓</Badge>
                  <span>Access logging to SD</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">✓</Badge>
                  <span>Field-upgradable</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Build Options */}
        <h2 className="text-2xl font-bold mb-6">3 Build Options</h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Box className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Toolbox Retrofit</CardTitle>
              <Badge variant="secondary" className="w-fit">~$25 total</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Plastic toolbox ($10)</li>
                <li>• Starter controller ($12)</li>
                <li>• 12V solenoid ($8)</li>
                <li>• USB power bank (BYO)</li>
                <li>• 30 minute build</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Weather-resistant, portable, perfect for testing.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Ammo Can Special</CardTitle>
              <Badge variant="secondary" className="w-fit">~$35 total</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Metal ammo can ($15)</li>
                <li>• Starter controller ($12)</li>
                <li>• Cabinet lock ($15)</li>
                <li>• Weatherproof USB ($3)</li>
                <li>• Mil-spec rugged</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Outdoor rated, tamper-resistant, long life.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-2">
                <Box className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle>Drawer Retrofit</CardTitle>
              <Badge variant="secondary" className="w-fit">~$20 total</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Existing drawer ($0)</li>
                <li>• Starter controller ($12)</li>
                <li>• 12V solenoid ($8)</li>
                <li>• USB charger (BYO)</li>
                <li>• Indoor only</li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Invisible installation, cheapest option, home use.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Upgrade Path */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upgrade Path</CardTitle>
            <CardDescription>Start cheap. Grow as needed.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-medium">Incremental Upgrades</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <span>Add keypad ($5) → Flash new firmware</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <span>Add screen ($8) → Full UI</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <span>Add RS-485 ($2) → Multi-lock support</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                  <span>Add 4G module ($15) → No WiFi needed</span>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium mb-2">Or Swap Controller</p>
                <p className="text-sm text-muted-foreground">
                  Replace starter controller with full version ($38) and keep all wiring, locks, 
                  and enclosure. Zero waste.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Compatible */}
        <Card className="bg-primary/5 border-primary/20 mb-8">
          <CardHeader>
            <CardTitle>Fully Network Compatible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Starters work with the full DeadDropstr ecosystem:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">✓</Badge>
                <span>Same Nostr events</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">✓</Badge>
                <span>Same marketplace listing</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">✓</Badge>
                <span>Same Lightning payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs">✓</Badge>
                <span>Proxy service compatible</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buy Components - Quick Links */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Get the Parts</CardTitle>
            <CardDescription>
              Verified sources. Prices fluctuate, shop around.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">ESP32-C3 DevKit</p>
                  <Badge>~$3</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  ESP32-C3-DevKitM-1 or NodeMCU-C3
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" 
                    onClick={() => window.open('https://www.aliexpress.com/wholesale?SearchText=esp32-c3-devkit', '_blank')}>
                    AliExpress
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">PN532 NFC Module</p>
                  <Badge>~$3</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  I2C interface, with antenna
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs"
                    onClick={() => window.open('https://www.amazon.com/s?k=pn532+nfc+module', '_blank')}>
                    Amazon
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs"
                    onClick={() => window.open('https://www.aliexpress.com/wholesale?SearchText=pn532+module', '_blank')}>
                    AliExpress
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">5V Relay Module</p>
                  <Badge>~$3</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  2-channel or 4-channel, opto-isolated
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs"
                    onClick={() => window.open('https://www.amazon.com/s?k=5v+relay+module', '_blank')}>
                    Amazon
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">12V Solenoid Lock</p>
                  <Badge>~$8</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Fail-secure, cabinet/drawer size
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs"
                    onClick={() => window.open('https://www.aliexpress.com/wholesale?SearchText=12v+solenoid+lock', '_blank')}>
                    AliExpress
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Ammo Can</p>
                  <Badge>~$15</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Fat 50 or .50 cal surplus
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs"
                    onClick={() => window.open('https://www.amazon.com/s?k=ammo+can+fat+50', '_blank')}>
                    Amazon
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">USB Power Bank</p>
                  <Badge>BYO</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Any 5V 2A+ power bank you have
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" disabled>
                    Repurpose Yours
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">⚠️ Note on Sources</p>
              <p>
                Prices and availability vary by region. These are common sources, but you may find 
                better deals locally. Check electronics distributors (DigiKey, Mouser) for bulk orders.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Community Sourcing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Community Verified Sources</CardTitle>
            <CardDescription>
              Regional suppliers discovered by the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Region</th>
                    <th className="text-left py-2">Supplier</th>
                    <th className="text-left py-2">Good For</th>
                    <th className="text-left py-2">Verified</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2">Global</td>
                    <td className="py-2">AliExpress</td>
                    <td className="py-2">Everything</td>
                    <td className="py-2">—</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">US</td>
                    <td className="py-2">Amazon, Adafruit</td>
                    <td className="py-2">NFC, Relays</td>
                    <td className="py-2">@plutarch</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm">
                <strong>Know a good source?</strong> Submit a PR to the repo with your regional 
                supplier and we'll add it to help others in your area.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold">"Start with $25. Grow with your needs."</h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The starter pack proves the model. Once you have lockers in an area, 
            demand justifies upgrading to full features. The network grows organically 
            from the bottom up.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => window.open('https://github.com/PlutarchsEcho/nostr-dead-drop-lockers/blob/main/STARTER_PACK.md', '_blank')}>
              <DollarSign className="h-4 w-4 mr-2" />
              Get the Full BOM
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.open('https://github.com/PlutarchsEcho/nostr-dead-drop-lockers/discussions', '_blank')}>
              <MapPin className="h-4 w-4 mr-2" />
              Share Your Build
            </Button>
          </div>
        </div>

        {/* Community Sources */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Community Verified Sources</CardTitle>
            <CardDescription>Real parts that builders have used successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Region</th>
                    <th className="text-left py-2">Store</th>
                    <th className="text-left py-2">Part</th>
                    <th className="text-left py-2">Cost</th>
                    <th className="text-left py-2">Verified</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2">🇺🇸 US</td>
                    <td>Amazon</td>
                    <td>ESP32-C3 DevKit</td>
                    <td>$3.50</td>
                    <td className="text-xs">@Plutarch</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">🇺🇸 US</td>
                    <td>Amazon</td>
                    <td>PN532 NFC Module</td>
                    <td>$3.20</td>
                    <td className="text-xs">@Plutarch</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">🇪🇺 EU</td>
                    <td>AliExpress</td>
                    <td>12V Solenoid Lock</td>
                    <td>€6.80</td>
                    <td className="text-xs italic">Need verification</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">🇬🇧 UK</td>
                    <td>Pimoroni</td>
                    <td>ESP32-C3</td>
                    <td>£4.50</td>
                    <td className="text-xs italic">Need verification</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1">Add your source</p>
              <p className="text-muted-foreground">
                Built one? Found a good supplier? Submit the details via{' '}
                <a href="https://github.com/PlutarchsEcho/nostr-dead-drop-lockers/issues/new" className="text-primary hover:underline">
                  GitHub Issue
                </a>{' '}
                and we'll add it to the list.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Full starter pack documentation in{' '}
            <a href="https://github.com/PlarchsEcho/nostr-dead-drop-lockers/blob/main/STARTER_PACK.md" className="text-primary hover:underline">
              STARTER_PACK.md
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
