import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import geohash from 'latlon-geohash';

function decodeGeohash(hash: string) {
  try {
    const { latitude, longitude } = geohash.decode(hash);
    return [latitude, longitude] as [number, number];
  } catch (e) {
    return [0, 0] as [number, number];
  }
}

async function fetchLockers(nostr: any) {
  const events = await nostr.query([{ kinds: [30402], '#t': ['locker'], limit: 200 }]);
  return events;
}

export function LockersMap({ lockers }: { lockers?: any[] }) {
  const { nostr } = useNostr();
  // Accept lockers passed in or query directly
  const { data } = useQuery({ queryKey: ['lockers'], queryFn: () => fetchLockers(nostr) });
  const events = lockers ?? data ?? [];

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {events?.map((ev: any) => {
        // Handle both parsed lockers (with geohash prop) and raw events (with tags)
        const g = ev.geohash || ev.tags?.find((t: any) => t[0] === 'g')?.[1];
        const title = ev.title || ev.tags?.find((t: any) => t[0] === 'title')?.[1] || 'Locker';
        const dTag = ev.dTag || ev.tags?.find((t: any) => t[0] === 'd')?.[1];
        const status = ev.status || ev.tags?.find((t: any) => t[0] === 'status')?.[1] || 'unknown';
        const price = ev.price || ev.tags?.find((t: any) => t[0] === 'price')?.[1] || '0';
        const dimensions = ev.dimensions || ev.tags?.find((t: any) => t[0] === 'dimensions')?.[1] || '';
        const content = ev.description || ev.content || '';

        const pos = g ? decodeGeohash(g) : [51.505, -0.09];

        return (
          <Marker key={ev.id} position={pos}>
            <Popup>
              <div>
                <h3 className="font-bold">{title}</h3>
                <p>Status: {status}</p>
                <p>Dimensions: {dimensions}</p>
                <p>Fee: {price} sats</p>
                <p className="line-clamp-2 text-sm text-gray-600 mt-1">{content}</p>
                {dTag && <a href={`/locker/${dTag}`} className="block mt-2 text-blue-600 hover:underline">View Details</a>}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default LockersMap;
