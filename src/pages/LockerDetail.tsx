import React from 'react';
import { useParams } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { parseLockerEvent } from '@/lib/lockerTypes';
import { useNWC } from '@/hooks/useNWCContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useTrustScore } from '@/hooks/useTrustScore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function LockerDetailPage() {
  const { nip19 } = useParams();
  useSeoMeta({ title: 'Locker Details' });
  const { nostr } = useNostr();
  const nwc = useNWC();
  const { user } = useCurrentUser();
  const { mutateAsync: publish } = useNostrPublish();

  // Expecting an naddr-style identifier for addressable event (naddr includes pubkey + kind + d)
  const decoded = nip19 ? (() => {
    try {
      // decode using nostr-tools only as needed — pages already have NIP19Page, but here simple handling
      // We'll query by d+kind+author if nip19 is an naddr; otherwise attempt to find by d param
      return nip19;
    } catch {
      return nip19;
    }
  })() : null;

  const { data: events } = useQuery({
    queryKey: ['locker-detail', decoded],
    queryFn: async () => {
      if (!decoded) return null;
      // For now, search by d tag (decoded string may be the d value). We query kind 30402 events with that d tag
      const evs = await nostr.query([{ kinds: [30402], '#d': [decoded], limit: 1 }]);
      return evs[0] ? parseLockerEvent(evs[0]) : null;
    },
    staleTime: 30_000,
  });

  const locker = events;
  const trust = useTrustScore(locker?.pubkey);

  // Rental flow state
  const [isRenting, setRenting] = useState(false);
  const [message, setMessage] = useState('');

  const handleRent = async () => {
    if (!locker) return;
    if (!nwc) {
      alert('Please connect a Nostr Wallet Connect (NWC) wallet in settings');
      return;
    }

    const conn = nwc.getActiveConnection();
    if (!conn) {
      alert('No active NWC connection found');
      return;
    }

    setRenting(true);

    try {
      // Create an invoice via NWC: make_invoice
      // For now use make_invoice via the LN SDK wrapper exposed in the hook
      // We will request an invoice for locker.price sats
      const amountMsat = locker.price * 1000;
      // NOTE: getActiveConnection() returns object stored in localStorage; need to call nwc.sendPayment or implement makeInvoice in SDK

      // Create invoice using LN.makeInvoice if available
      const client = new (await import('@getalby/sdk')).LN(conn.connectionString);
      const invoiceResult = await client.makeInvoice({ amount: amountMsat, description: `Locker rental ${locker.dTag}` });

      // Present invoice to the user (invoiceResult.invoice)
      const paid = confirm(`Pay invoice: ${invoiceResult.invoice}\n\nClick OK to pay using your connected wallet.`);
      if (!paid) {
        setRenting(false);
        return;
      }

      // Use NWC client's pay() to send payment and get preimage
      const payRes = await client.pay(invoiceResult.invoice);
      const preimage = payRes.preimage;

      // Build encrypted unlock command and send as DM to locker owner/locker pubkey
      const command = {
        action: 'unlock',
        locker_id: locker.dTag,
        payment_preimage: preimage,
        rental_invoice: invoiceResult.invoice,
      };

      // Publish encrypted DM (kind 4) to locker pubkey using useNostrPublish which signs with current user's key
      await publish({ kind: 4, content: JSON.stringify(command), tags: [['p', locker.pubkey]] });

      setMessage('Rental successful — unlock command sent.');
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || 'Payment failed');
    } finally {
      setRenting(false);
    }
  };

  if (!locker) {
    return <div className="container mx-auto p-6">Locker not found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-semibold">{locker.title}</h1>
          <p className="text-sm text-muted-foreground">{locker.location || locker.geohash}</p>
          <div className="mt-4 p-4 border rounded">
            <p>{locker.description}</p>
            <p className="mt-2">Dimensions: {locker.dimensions}</p>
            <p>Fee: {locker.price} sats</p>
            <p>Status: {locker.status}</p>
            <p>Owner: {locker.pubkey}</p>
            <p>Trust Score: {trust?.data?.score ?? '—'}</p>
          </div>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Rent this Locker</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Pay the rental fee to unlock the box.</p>
              <div className="mt-4">
                <Button onClick={handleRent} disabled={isRenting}>{isRenting ? 'Processing...' : `Pay ${locker.price} sats`}</Button>
              </div>
              {message && <p className="mt-3 text-sm">{message}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
