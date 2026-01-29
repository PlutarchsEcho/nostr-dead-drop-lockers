import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import qrcode from 'qrcode';
import { useNWC } from '@/hooks/useNWCContext';
import { LN } from '@getalby/sdk';
import { Copy, CheckCircle2, Loader2, Zap, Clock, AlertCircle } from 'lucide-react';

interface InvoiceModalProps {
  open: boolean;
  invoice: string;
  amountSats?: number;
  onClose: () => void;
  onPay: () => Promise<string>;
  onSettled?: (status: { preimage: string }) => Promise<void>;
}

type PaymentState = 'pending' | 'polling' | 'paying' | 'success' | 'error';

export function InvoiceModal({ open, invoice, amountSats, onClose, onPay, onSettled }: InvoiceModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentState>('pending');
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const nwc = useNWC();
  const maxPolls = 60; // 3 minutes at 3s intervals

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPaymentState('pending');
      setMessage(null);
      setCopied(false);
      setPollCount(0);
    }
  }, [open]);

  // Generate QR code
  useEffect(() => {
    if (!invoice) return;
    let mounted = true;
    qrcode.toDataURL(invoice, { width: 256, margin: 2 })
      .then((url) => { if (mounted) setQrDataUrl(url); })
      .catch(() => { if (mounted) setQrDataUrl(null); });
    return () => { mounted = false; };
  }, [invoice]);

  // Poll for invoice settlement
  useEffect(() => {
    if (!open || !invoice) return;

    const active = nwc.getActiveConnection();
    if (!active) return;

    let cancelled = false;
    const pollInterval = 3000;

    const poll = async () => {
      if (cancelled) return;
      setPollCount(prev => prev + 1);

      try {
        const client = new LN(active.connectionString);
        const status = await client.lookupInvoice(invoice);

        if (status && status.state === 'settled' && status.preimage) {
          setPaymentState('success');
          setMessage('Payment confirmed!');
          if (onSettled) {
            await onSettled({ preimage: status.preimage });
          }
          setTimeout(() => {
            if (!cancelled) onClose();
          }, 2000);
          return;
        }
      } catch {
        // Ignore lookup errors, keep polling
      }

      if (!cancelled && pollCount < maxPolls) {
        setTimeout(poll, pollInterval);
      } else if (pollCount >= maxPolls) {
        setMessage('Waiting for payment timed out. You can still pay manually.');
      }
    };

    const timeout = setTimeout(poll, pollInterval);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [open, invoice, nwc, onClose, onSettled, pollCount]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage('Failed to copy');
    }
  };

  const handlePay = async () => {
    setPaymentState('paying');
    setMessage(null);
    try {
      await onPay();
      setPaymentState('success');
      setMessage('Payment successful!');
      setTimeout(() => onClose(), 1500);
    } catch (err: unknown) {
      setPaymentState('error');
      setMessage((err as Error)?.message || 'Payment failed');
    }
  };

  const getStatusBadge = () => {
    switch (paymentState) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Awaiting Payment</Badge>;
      case 'polling':
        return <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Checking...</Badge>;
      case 'paying':
        return <Badge variant="default" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Processing</Badge>;
      case 'success':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" /> Paid</Badge>;
      case 'error':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" /> Failed</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && paymentState !== 'paying') onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Pay Invoice
            </DialogTitle>
            {getStatusBadge()}
          </div>
          <DialogDescription>
            Scan the QR code with any Lightning wallet or pay directly.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount Display */}
          {amountSats && (
            <div className="text-center">
              <span className="text-3xl font-bold">{amountSats.toLocaleString()}</span>
              <span className="text-lg text-muted-foreground ml-2">sats</span>
            </div>
          )}

          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white rounded-lg">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Lightning Invoice QR" className="w-56 h-56" />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center bg-muted rounded">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Invoice Text */}
          <div className="relative">
            <textarea
              readOnly
              value={invoice}
              className="w-full p-3 pr-12 rounded-lg border bg-muted/50 text-xs font-mono resize-none"
              rows={3}
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2"
              onClick={handleCopy}
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Polling Progress */}
          {paymentState === 'pending' && pollCount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Waiting for payment...
                </span>
                <span>{Math.floor((pollCount / maxPolls) * 100)}%</span>
              </div>
              <Progress value={(pollCount / maxPolls) * 100} className="h-1" />
            </div>
          )}

          {/* Status Message */}
          {message && (
            <div className={`text-sm text-center p-2 rounded ${
              paymentState === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              paymentState === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
              'bg-muted text-muted-foreground'
            }`}>
              {message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={paymentState === 'paying'}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={paymentState === 'paying' || paymentState === 'success'}
              className="flex-1"
            >
              {paymentState === 'paying' ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : paymentState === 'success' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Paid!
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground">
            Invoice will auto-detect when paid. You can also copy and pay externally.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InvoiceModal;
