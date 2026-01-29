import { useParams } from 'react-router-dom';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useSeoMeta } from '@unhead/react';
import { parseLockerEvent } from '@/lib/lockerTypes';
import { useNWC } from '@/hooks/useNWCContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTrustScore } from '@/hooks/useTrustScore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { LN } from '@getalby/sdk';
import useSendUnlockCommand from '@/hooks/useSendUnlockCommand';
import InvoiceModal from '@/components/InvoiceModal';

export default function LockerDetail() {
  const { nip19 } = useParams<{ nip19: string }>();
  useSeoMeta({ title: 'Locker Details' });
  const { nostr } = useNostr();
  const nwc = useNWC();
  const { user } = useCurrentUser();
  const { mutateAsync: sendUnlock } = useSendUnlockCommand();

  const { data: locker } = useQuery({
    queryKey: ['locker-detail', nip19],
    queryFn: async () => {
      if (!nip19) return null;
      const events = await nostr.query([{ kinds: [30402], '#d': [nip19], limit: 1 }]);
      if (!events || events.length === 0) return null;
      return parseLockerEvent(events[0]);
    },
    staleTime: 60_000,
  });

  const trust = useTrustScore(locker?.pubkey);
  const [renting, setRenting] = useState(false);
  const [message, setMessage] = useState('');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState('');

  const { connections, activeConnection, setActiveConnection, getActiveConnection } = nwc;

  const handleRent = async () => {
    if (!locker) return;
    const active = getActiveConnection();
    if (!active) {
      setMessage('No wallet connected. Please connect a Nostr Wallet Connect wallet first.');
      return;
    }

    setRenting(true);
    setMessage('');
    try {
      const client = new LN(active.connectionString);
      const amountMsat = locker.price * 1000;
      const invoice = await client.makeInvoice({ amount: amountMsat, description: `Locker rental ${locker.dTag}` });
      setCurrentInvoice(invoice.invoice);
      setInvoiceModalOpen(true);
    } catch (err: any) {
      setMessage(err?.message ?? 'Failed to create invoice');
      setRenting(false);
    }
  };

  const handlePayInvoice = async (): Promise<string> => {
    if (!locker) throw new Error('No locker');
    const active = getActiveConnection();
    if (!active) throw new Error('No wallet connected');
    const client = new LN(active.connectionString);
    const payRes = await client.pay(currentInvoice);
    const preimage = payRes.preimage;

    await sendUnlock({
      recipientPubkey: locker.pubkey,
      lockerId: locker.dTag,
      paymentPreimage: preimage,
      rentalInvoice: currentInvoice,
    });

    setMessage('Unlock command sent via NIP-17. Locker should open shortly.');
    setRenting(false);
    return preimage;
  };

  if (!locker) {
    return <div className="container mx-auto p-6">Locker not found.</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      {connections.length > 1 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Wallet</span>
          <select
            className="px-2 py-1 border rounded bg-background"
            value={activeConnection ?? ''}
            onChange={(e) => setActiveConnection(e.target.value)}
          >
            {connections.map((c) => (
              <option key={c.connectionString} value={c.connectionString}>
                {c.alias ?? 'NWC Wallet'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="card">
        <CardHeader>
          <CardTitle>{locker.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{locker.location || locker.geohash}</p>
          <p className="mt-2">Dimensions: {locker.dimensions}</p>
          <p>Fee: {locker.price} sats</p>
          <p>Owner: {locker.pubkey}</p>
          <p>Trust Score: {trust?.data?.score ?? '—'}</p>
          <p className="mt-2 text-sm text-muted-foreground">{locker.description}</p>
        </CardContent>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Rent this Locker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This will create a rental invoice via your connected wallet and unlock the locker once paid.
            </p>
            <Button onClick={handleRent} disabled={renting} className="mt-4">
              {renting ? 'Creating invoice...' : `Rent for ${locker.price} sats`}
            </Button>
            {message && <p className="mt-2 text-sm">{message}</p>}
          </CardContent>
        </Card>
      </div>

      <InvoiceModal
        open={invoiceModalOpen}
        invoice={currentInvoice}
        onClose={() => {
          setInvoiceModalOpen(false);
          if (renting) setRenting(false);
        }}
        onPay={handlePayInvoice}
      />
    </div>
  );
}
