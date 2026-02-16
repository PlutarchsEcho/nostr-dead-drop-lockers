import { nip19 } from 'nostr-tools';
import { useParams, Link } from 'react-router-dom';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useSeoMeta } from '@unhead/react';
import { parseLockerEvent } from '@/lib/lockerTypes';
import { NoteContent } from '@/components/NoteContent';
import { useAuthor } from '@/hooks/useAuthor';

export function NIP19Page() {
  const { nip19: identifier } = useParams<{ nip19: string }>();
  useSeoMeta({ title: 'NIP-19' });

  const { nostr } = useNostr();

  if (!identifier) return <div className="container mx-auto p-6">Invalid identifier</div>;

  let decoded;
  try {
    decoded = nip19.decode(identifier);
  } catch (err) {
    return <div className="container mx-auto p-6">Invalid NIP-19 identifier</div>;
  }

  const { type, data } = decoded as any;

  // Profile (npub, nprofile)
  const profileQuery = useQuery({
    queryKey: ['nip19', identifier, 'profile'],
    enabled: type === 'npub' || type === 'nprofile',
    queryFn: async () => {
      const pubkey = data?.pubkey ?? data; // nprofile may have data.pubkey
      if (!pubkey) return null;
      const events = await nostr.query([{ kinds: [0], authors: [pubkey], limit: 1 }]);
      const ev = events?.[0];
      if (!ev) return { pubkey };
      try {
        const meta = JSON.parse(ev.content || '{}');
        return { pubkey, metadata: meta };
      } catch {
        return { pubkey };
      }
    },
  });

  // Note (note)
  const noteQuery = useQuery({
    queryKey: ['nip19', identifier, 'note'],
    enabled: type === 'note',
    queryFn: async () => {
      const id = data;
      if (!id) return null;
      const events = await nostr.query([{ ids: [id], kinds: [1], limit: 1 }]);
      return events?.[0] ?? null;
    },
  });

  // Nevent (nevent1)
  const eventQuery = useQuery({
    queryKey: ['nip19', identifier, 'event'],
    enabled: type === 'nevent',
    queryFn: async () => {
      const id = data?.id ?? data;
      if (!id) return null;
      const events = await nostr.query([{ ids: [id], limit: 1 }]);
      return events?.[0] ?? null;
    },
  });

  // Naddr (addressable)
  const naddrQuery = useQuery({
    queryKey: ['nip19', identifier, 'naddr'],
    enabled: type === 'naddr',
    queryFn: async () => {
      const addr = data;
      if (!addr) return null;
      const kind = addr.kind;
      const pubkey = addr.pubkey;
      const identifierTag = addr.identifier;
      const events = await nostr.query([{ kinds: [kind], authors: [pubkey], '#d': [identifierTag], limit: 1 }]);
      return events?.[0] ?? null;
    },
  });

  // Renderers
  if (type === 'npub' || type === 'nprofile') {
    const profile = profileQuery.data;
    if (!profileQuery.isFetched) return <div className="container mx-auto p-6">Loading profile…</div>;
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Profile</h1>
          <p className="text-sm text-muted-foreground mb-4">pubkey: <code>{profile?.pubkey}</code></p>
          {profile?.metadata ? (
            <div className="space-y-2">
              <img src={profile.metadata.picture} alt="avatar" className="w-28 h-28 rounded-full" />
              <h2 className="text-xl font-semibold">{profile.metadata.display_name ?? profile.metadata.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.metadata.about}</p>
              {profile.metadata.website && <p><a href={profile.metadata.website} target="_blank" rel="noreferrer" className="text-primary">Website</a></p>}
            </div>
          ) : (
            <p>No metadata available.</p>
          )}
        </div>
      </div>
    );
  }

  if (type === 'note') {
    const note = noteQuery.data;
    if (noteQuery.isLoading) return <div className="container mx-auto p-6">Loading note…</div>;
    if (!note) return <div className="container mx-auto p-6">Note not found</div>;

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Text Note</h1>
        <div className="prose max-w-none whitespace-pre-wrap">
          <NoteContent event={note} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Author: <Link to={`/${nip19.encode({ type: 'npub', data: note.pubkey })}`}>{note.pubkey}</Link></p>
      </div>
    );
  }

  if (type === 'nevent') {
    const ev = eventQuery.data;
    if (eventQuery.isLoading) return <div className="container mx-auto p-6">Loading event…</div>;
    if (!ev) return <div className="container mx-auto p-6">Event not found</div>;

    return (
      <div className="container mx-auto p-6">
        <h1 className="text-xl font-semibold">Event (kind: {ev.kind})</h1>
        <div className="mt-4 prose max-w-none whitespace-pre-wrap">
          {ev.kind === 1 ? <NoteContent event={ev} /> : <pre>{ev.content}</pre>}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Author: <code>{ev.pubkey}</code></p>
      </div>
    );
  }

  if (type === 'naddr') {
    const ev = naddrQuery.data;
    if (naddrQuery.isLoading) return <div className="container mx-auto p-6">Loading addressable event…</div>;
    if (!ev) return <div className="container mx-auto p-6">Addressable event not found</div>;

    // If it's a locker (30402) parse and show summary
    if (ev.kind === 30402) {
      const locker = parseLockerEvent(ev);
      if (!locker) return <div className="container mx-auto p-6">Invalid locker event</div>;
      return (
        <div className="container mx-auto p-6">
          <h1 className="text-2xl font-semibold">{locker.title}</h1>
          <p className="text-sm text-muted-foreground">Owner: <code>{locker.pubkey}</code></p>
          <p className="mt-2">{locker.description}</p>
          <div className="mt-4">
            <p>Dimensions: {locker.dimensions}</p>
            <p>Fee: {locker.price} {locker.currency}</p>
            <p>Status: {locker.status}</p>
            <Link to={`/locker/${identifier}`} className="text-primary">Open Locker Page</Link>
          </div>
        </div>
      );
    }

    // Generic addressable event display
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-xl font-semibold">Addressable Event</h1>
        <pre className="mt-4 whitespace-pre-wrap">{ev.content}</pre>
        <p className="mt-2 text-sm text-muted-foreground">Author: <code>{ev.pubkey}</code></p>
      </div>
    );
  }

  return <div className="container mx-auto p-6">Unsupported identifier type</div>;
}

export default NIP19Page;
