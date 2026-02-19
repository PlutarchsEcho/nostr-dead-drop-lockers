import { useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, MapPin, Package, ArrowRight, Plus, Minus, 
  Unlock, RotateCcw, AlertTriangle, CheckCircle, Zap
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

// Mock active rentals
const MOCK_RENTALS = [
  {
    id: 'rental-1',
    lockerId: 'locker-sf-001',
    lockerName: 'Mission District Secure Box',
    address: '2490 Mission St, San Francisco, CA 94110',
    accessCode: 'A7B9C2',
    startTime: new Date(Date.now() - 3600000 * 2), // 2 hours ago
    endTime: new Date(Date.now() + 3600000 * 22), // 22 hours remaining
    totalHours: 24,
    hourlyRate: 500,
    totalPaid: 12000,
    status: 'active',
    demandLevel: 'high', // affects refund percentage
  },
  {
    id: 'rental-2',
    lockerId: 'locker-sea-001',
    lockerName: 'Capitol Hill Tech Hub',
    address: '123 Pine St, Seattle, WA 98101',
    accessCode: 'D4E8F1',
    startTime: new Date(Date.now() - 3600000 * 48), // 2 days ago
    endTime: new Date(Date.now() + 3600000 * 24), // 1 day remaining
    totalHours: 72,
    hourlyRate: 400,
    totalPaid: 28800,
    status: 'active',
    demandLevel: 'medium',
  },
];

// Mock rental history
const MOCK_HISTORY = [
  {
    id: 'rental-0',
    lockerName: 'Brooklyn Heights Drop',
    startTime: new Date(Date.now() - 86400000 * 7),
    endTime: new Date(Date.now() - 86400000 * 6),
    totalPaid: 18000,
    status: 'completed',
  },
];

export default function UserDashboard() {
  useSeoMeta({ title: 'My Rentals - DeadDropstr' });
  const { toast } = useToast();
  const [rentals, setRentals] = useState(MOCK_RENTALS);
  const [selectedRental, setSelectedRental] = useState<typeof MOCK_RENTALS[0] | null>(null);
  const [extendDialogOpen, setExtendDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [extendHours, setExtendHours] = useState(12);

  const getTimeRemaining = (endTime: Date) => {
    const diff = endTime.getTime() - Date.now();
    if (diff <= 0) return { hours: 0, minutes: 0, expired: true };
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return { hours, minutes, expired: false };
  };

  const getRefundInfo = (rental: typeof MOCK_RENTALS[0]) => {
    const timeLeft = getTimeRemaining(rental.endTime);
    const hoursRemaining = timeLeft.hours + timeLeft.minutes / 60;
    const unusedHours = Math.ceil(hoursRemaining);
    const unusedValue = unusedHours * rental.hourlyRate;
    
    // Refund percentage based on demand level
    const refundRates = {
      low: 0.9,    // 90% refund
      medium: 0.75, // 75% refund
      high: 0.5,   // 50% refund (high demand keeps value)
    };
    
    const refundRate = refundRates[rental.demandLevel as keyof typeof refundRates] || 0.75;
    const refundAmount = Math.floor(unusedValue * refundRate);
    
    return { unusedHours, unusedValue, refundAmount, refundRate };
  };

  const handleExtend = () => {
    if (!selectedRental) return;
    
    const cost = extendHours * selectedRental.hourlyRate;
    
    // Simulate extension
    setRentals(rentals.map(r => 
      r.id === selectedRental.id 
        ? { ...r, endTime: new Date(r.endTime.getTime() + extendHours * 3600000) }
        : r
    ));
    
    toast({
      title: "Rental Extended",
      description: `Added ${extendHours} hours for ${cost.toLocaleString()} sats`,
    });
    setExtendDialogOpen(false);
    setSelectedRental(null);
  };

  const handleRelease = () => {
    if (!selectedRental) return;
    
    const { refundAmount } = getRefundInfo(selectedRental);
    
    // Simulate release
    setRentals(rentals.filter(r => r.id !== selectedRental.id));
    
    toast({
      title: "Locker Released",
      description: refundAmount > 0 
        ? `${refundAmount.toLocaleString()} sats refunded` 
        : "No refund - high demand area",
    });
    setReleaseDialogOpen(false);
    setSelectedRental(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">My Lockers</h1>
          <p className="text-muted-foreground">Manage your active rentals</p>
        </header>

        {/* Active Rentals */}
        <div className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Rentals ({rentals.length})
          </h2>
          
          {rentals.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active rentals</p>
                <Button asChild className="mt-4">
                  <Link to="/marketplace">Find a Locker</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            rentals.map((rental) => {
              const timeLeft = getTimeRemaining(rental.endTime);
              const progressPercent = ((rental.totalHours - (timeLeft.hours + timeLeft.minutes/60)) / rental.totalHours) * 100;
              
              return (
                <Card key={rental.id} className={timeLeft.hours < 4 ? 'border-orange-500/50' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{rental.lockerName}</CardTitle>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{rental.address}</span>
                        </div>
                      </div>
                      <Badge variant={timeLeft.hours < 4 ? 'destructive' : 'default'}>
                        {timeLeft.expired ? 'Expired' : `${timeLeft.hours}h ${timeLeft.minutes}m left`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time elapsed</span>
                        <span className="font-medium">{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Access code */}
                    <div className="bg-black text-white p-4 rounded-lg">
                      <p className="text-xs text-white/60 mb-1">Access Code</p>
                      <div className="flex items-center justify-between">
                        <p className="font-mono text-2xl tracking-[0.3em]">{rental.accessCode}</p>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-white hover:text-white/80"
                          onClick={() => {
                            navigator.clipboard.writeText(rental.accessCode);
                            toast({ title: "Code copied" });
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>

                    {/* Demand indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Demand:</span>
                      <Badge 
                        variant={rental.demandLevel === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {rental.demandLevel}
                      </Badge>
                      {rental.demandLevel === 'high' && (
                        <span className="text-xs text-muted-foreground">
                          (Early release = 50% refund)
                        </span>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedRental(rental);
                        setExtendDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedRental(rental);
                        setReleaseDialogOpen(true);
                      }}
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Release Early
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>

        {/* Rental History */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">History</h2>
          {MOCK_HISTORY.map((rental) => (
            <Card key={rental.id} className="opacity-60">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{rental.lockerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {rental.startTime.toLocaleDateString()} - {rental.endTime.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">Completed</Badge>
                  <p className="text-sm text-muted-foreground mt-1">{rental.totalPaid.toLocaleString()} sats</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Extend Dialog */}
      <Dialog open={extendDialogOpen} onOpenChange={setExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time</DialogTitle>
            <DialogDescription>
              Extend your rental for {selectedRental?.lockerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Additional Hours: {extendHours}</Label>
              <input
                type="range"
                min="1"
                max="72"
                value={extendHours}
                onChange={(e) => setExtendHours(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1 hour</span>
                <span>3 days</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>{selectedRental?.hourlyRate} sats/hr</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{((extendHours * (selectedRental?.hourlyRate || 0))).toLocaleString()} sats</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setExtendDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleExtend}>
              <Zap className="h-4 w-4 mr-2" />
              Pay & Extend
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Release Dialog */}
      <Dialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Locker Early</DialogTitle>
            <DialogDescription>
              Return this locker to the pool and receive a partial refund
            </DialogDescription>
          </DialogHeader>
          
          {selectedRental && (
            <div className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                {(() => {
                  const { unusedHours, unusedValue, refundAmount, refundRate } = getRefundInfo(selectedRental);
                  return (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unused time</span>
                        <span>~{unusedHours} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unused value</span>
                        <span>{unusedValue.toLocaleString()} sats</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Refund rate</span>
                        <span>{Math.round(refundRate * 100)}% ({selectedRental.demandLevel} demand)</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Your refund</span>
                        <span className="text-green-600">{refundAmount.toLocaleString()} sats</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              {selectedRental.demandLevel === 'high' && (
                <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-orange-800">
                    This is a high-demand area. Early release refunds are limited to 50% 
                    to maintain locker availability for others.
                  </p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                The access code will be deactivated immediately. Make sure you've retrieved your items.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setReleaseDialogOpen(false)}>
              Keep Rental
            </Button>
            <Button variant="destructive" className="flex-1" onClick={handleRelease}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Release & Refund
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
