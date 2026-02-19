import { useSeoMeta } from '@unhead/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cpu, Lock, Zap, Radio, Shield, Layers, Box } from 'lucide-react';

export default function HardwareArchitecture() {
  useSeoMeta({ 
    title: 'Hardware Architecture - DeadDropstr',
    description: 'Modular open hardware standard for smart lockers'
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Modular Hardware Architecture</h1>
          <p className="text-muted-foreground mt-2">
            One controller. Many locks. Infinite configurations.
          </p>
        </header>

        {/* Core Concept */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>The Separation Principle</CardTitle>
            <CardDescription>
              Intelligence and actuation are separate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Master Controller</p>
                    <p className="text-sm text-muted-foreground">
                      ESP32-S3, secure element, display, keypad, NFC. One per installation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Lock Modules</p>
                    <p className="text-sm text-muted-foreground">
                      Simple actuators (solenoid, motor, electromagnetic). Many per installation.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Visual Diagram */}
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Example: 4-Drawer Filing Cabinet</p>
                <div className="space-y-2">
                  <div className="bg-primary/20 border border-primary/30 p-3 rounded text-center">
                    <Cpu className="h-4 w-4 inline mr-2" />
                    <span className="text-sm font-medium">Controller</span>
                    <p className="text-xs text-muted-foreground">Screen • Keypad • NFC • Signer</p>
                  </div>
                  <div className="flex justify-center">
                    <div className="w-0.5 h-4 bg-muted-foreground/30"></div>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">RS-485 Bus</div>
                  <div className="grid grid-cols-4 gap-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="bg-muted border p-2 rounded text-center">
                        <Lock className="h-3 w-3 mx-auto mb-1" />
                        <span className="text-xs">Lock {i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controller Spec */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Master Controller Unit</CardTitle>
            <CardDescription>
              The brain of the operation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <Cpu className="h-4 w-4" /> Compute
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• ESP32-S3 (dual core)</li>
                  <li>• 8MB PSRAM</li>
                  <li>• 16MB Flash</li>
                  <li>• ATECC608A secure element</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <Radio className="h-4 w-4" /> Connectivity
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• WiFi 6</li>
                  <li>• Optional 4G (SIM7600)</li>
                  <li>• Optional LoRa</li>
                  <li>• RS-485 to locks</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <Layers className="h-4 w-4" /> Interfaces
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 1.28" round LCD</li>
                  <li>• 4x4 keypad</li>
                  <li>• NFC/RFID (PN532)</li>
                  <li>• RS-485 bus</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Cost:</strong> ~$38 for PCB + components. ~$50-100 with enclosure, PSU, battery.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lock Types */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Lock Module Options</CardTitle>
            <CardDescription>
              Choose the right actuator for your use case
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-3 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Solenoid Bolt</p>
                    <Badge variant="secondary">~$8</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Light-duty drawers and cabinets. Spring-return locked without power.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Power: 12V 0.5A • Control: RS-485 • Feedback: Microswitch
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Motorized Deadbolt</p>
                    <Badge variant="secondary">~$25</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Heavy drawers, lockers, doors. Battery backup required.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Power: 12V 1A • Control: RS-485 + H-bridge • Feedback: Hall sensor
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 border rounded-lg">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                  <Lock className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Electromagnetic</p>
                    <Badge variant="secondary">~$15</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Filing cabinets, metal enclosures. Continuous power when unlocked.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Power: 12V 0.3A continuous • Control: RS-485 • Feedback: Current sense
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <Box className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Smart Padlock (Retrofit)</p>
                    <Badge variant="secondary">~$40</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Existing lockers, bikes, gates. Wireless connection.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Power: Internal LiPo • Control: BLE or 433MHz • Manual key override
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Configurations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Example Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">4-Drawer Filing Cabinet</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• 1x Controller ($38)</p>
                  <p>• 4x Solenoid locks ($32)</p>
                  <p>• Enclosure + PSU ($50)</p>
                  <p className="font-medium text-primary">Total: ~$120</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">8-Unit Locker Bank</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• 1x Controller + 4G ($60)</p>
                  <p>• 8x Motorized locks ($200)</p>
                  <p>• Metal enclosures ($150)</p>
                  <p className="font-medium text-primary">Total: ~$410</p>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Outdoor Secure Box</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Integrated controller ($80)</p>
                  <p>• Steel enclosure + deadbolt ($150)</p>
                  <p>• Solar + battery ($80)</p>
                  <p className="font-medium text-primary">Total: ~$310</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Communication Protocol</CardTitle>
            <CardDescription>
              RS-485 bus for reliable multi-drop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <p className="text-muted-foreground mb-2">// Example: Unlock locker #3</p>
              <p>[START] [0x03] [0x01] [0x00] [CRC] [END]</p>
              <p className="text-muted-foreground mt-2">// Lock responds</p>
              <p>[ACK] [0x03] [STATUS_LOCKED]</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
              <div>
                <p className="font-medium">Wiring</p>
                <p className="text-muted-foreground">4-wire bus: +12V, GND, A, B</p>
                <p className="text-muted-foreground">Daisy-chain up to 32 locks</p>
              </div>
              <div>
                <p className="font-medium">Range</p>
                <p className="text-muted-foreground">1200 meters max</p>
                <p className="text-muted-foreground">Addresses 1-255</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Security Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Offline Validation</p>
                  <p className="text-sm text-muted-foreground">
                    Codes validated locally using secure element. No cloud dependency.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Signed Access Logs</p>
                  <p className="text-sm text-muted-foreground">
                    Every access cryptographically signed by device key. Tamper-evident.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Tamper Detection</p>
                  <p className="text-sm text-muted-foreground">
                    Accelerometer, case switches, vibration sensors. Alerts logged and uploaded.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="font-medium">Encrypted Bus</p>
                  <p className="text-sm text-muted-foreground">
                    RS-485 communication encrypted. Snooping wires reveals nothing.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Power Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Power Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4" />
                  <p className="font-medium">Mains Powered</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  12V PSU + battery backup. Indoor use.
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4" />
                  <p className="font-medium">Solar</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  50W panel + 20Ah LiFePO4. 3 days autonomy.
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4" />
                  <p className="font-medium">Battery Only</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  12V 10Ah pack. 1-2 weeks typical use.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Full specs, schematics, and firmware at{' '}
            <a href="https://github.com/PlutarchsEcho/deaddrop-hardware" className="text-primary hover:underline">
              github.com/PlutarchsEcho/deaddrop-hardware
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
