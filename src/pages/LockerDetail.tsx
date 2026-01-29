import { useParams } from 'react-router-dom';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useSeoMeta } from '@unhead/react';
import { parseLockerEvent } from '@/lib/lockerTypes';
import { useNWC } from '@/hooks/useNWCContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useTrustScore } from '@/hooks/useTrustScore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { LN } from '@getalby/sdk';

export default function LockerDetail() {
  const { nip19 } = useParams<{ nip19: string }>();
  useSeoMeta({ title: 'Locker Details' });
  const { nostr } = useNostr();
  const nwc = useNWC();
  const { mutateAsync: publish } = useNostrPublish();
  const { user } = useCurrentUser();
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

  const handleRent = async () => {
    if (!locker) return;
    const active = nwc.getActiveConnection();
    if (!active) {
      setMessage('No wallet connected. Open Wallet Connect and connect to a wallet.');
      return;
    }

    setRenting(true);
    try {
      const client = new LN(active.connectionString);
      const amountMsat = locker.price * 1000;
      const invoice = await client.makeInvoice({ amount: amountMsat, description: `Locker rental ${locker.dTag}` });
      const confirmPay = confirm(`Invoice: ${invoice.invoice}\nPay with connected wallet?`);
      if (!confirmPay) {
        setRenting(false);
        return;
      }
      const payRes = await client.pay(invoice.invoice);
      const preimage = payRes.preimage;

      const unlockCmd = {
        action: 'unlock',
        locker_id: locker.dTag,
        payment_preimage: preimage,
        rental_invoice: invoice.invoice
      };

      // Publish unlock command as a DM to locker pubkey (encrypted DM)
      await publish({ kind: 4, content: JSON.stringify(unlockCmd), tags: [['p', locker.pubkey]] });
      setMessage('Unlock command sent. Waiting for hardware to unlock.');
    } catch (err: any) {
      setMessage(err?.message ?? 'Rental failed');
    } finally {
      setRenting(false);
    }
  };

  if (!locker) {
    return <div className="container mx-auto p-6">Locker not found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
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

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Rent this Locker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">This will create a rental invoice via your connected wallet and unlock the locker once paid.</p>
            <Button onClick={handleRent} disabled={renting} className="mt-4">{renting ? 'Processing...' : `Rent for ${locker.price} sats`}</Button>
            {message && <p className="mt-2 text-sm">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
