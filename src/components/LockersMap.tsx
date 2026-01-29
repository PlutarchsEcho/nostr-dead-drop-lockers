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

export function LockersMap() {
  const { nostr } = useNostr();
  const { data } = useQuery({ queryKey: ['lockers'], queryFn: () => fetchLockers(nostr) });

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '600px', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      {data?.map((ev: any) => {
        const g = ev.tags.find((t: any) => t[0] === 'g')?.[1];
        const pos = g ? decodeGeohash(g) : [51.505, -0.09];
        const title = ev.tags.find((t: any) => t[0] === 'title')?.[1] || 'Locker';
        const status = ev.tags.find((t: any) => t[0] === 'status')?.[1] || 'unknown';
        const price = ev.tags.find((t: any) => t[0] === 'price')?.[1] || '0';
        const dimensions = ev.tags.find((t: any) => t[0] === 'dimensions')?.[1] || '';

        return (
          <Marker key={ev.id} position={pos}>
            <Popup>
              <div>
                <h3>{title}</h3>
                <p>Status: {status}</p>
                <p>Dimensions: {dimensions}</p>
                <p>Fee: {price} sats</p>
                <pre style={{ maxHeight: 200, overflow: 'auto' }}>{ev.content}</pre>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default LockersMap;
