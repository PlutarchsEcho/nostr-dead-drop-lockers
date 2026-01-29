import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import qrcode from 'qrcode';

interface InvoiceModalProps {
  open: boolean;
  invoice: string;
  onClose: () => void;
  onPay: () => Promise<string>; // returns preimage
}

export function InvoiceModal({ open, invoice, onClose, onPay }: InvoiceModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!invoice) return;
    let mounted = true;
    qrcode.toDataURL(invoice)
      .then((url) => { if (mounted) setQrDataUrl(url); })
      .catch(() => { if (mounted) setQrDataUrl(null); });
    return () => { mounted = false; };
  }, [invoice]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invoice);
      setMessage('Copied to clipboard');
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage('Copy failed');
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    setMessage(null);
    try {
      const preimage = await onPay();
      setMessage('Payment successful');
      // leave modal open for a moment so UI can show success
      setTimeout(() => { setPaying(false); onClose(); }, 1200);
      return preimage;
    } catch (err: any) {
      setMessage(err?.message || 'Payment failed');
      setPaying(false);
      throw err;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Rental Invoice</DialogTitle>
          <DialogDescription>
            Scan the invoice QR with your wallet or pay with the connected Nostr Wallet Connect connection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {qrDataUrl ? (
            <div className="flex justify-center">
              <img src={qrDataUrl} alt="invoice-qr" className="w-48 h-48" />
            </div>
          ) : (
            <div className="p-4 bg-muted text-center rounded">QR unavailable</div>
          )}

          <textarea readOnly value={invoice} className="w-full p-2 rounded border" rows={3} />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={handleCopy} size="sm">Copy Invoice</Button>
            </div>
            <div className="text-sm text-muted-foreground">{message}</div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} disabled={paying}>Cancel</Button>
            <Button onClick={handlePay} disabled={paying}>{paying ? 'Paying...' : 'Pay with Connected Wallet'}</Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export default InvoiceModal;
