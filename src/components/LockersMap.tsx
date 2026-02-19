import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue in webpack/vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Locker {
  id: string;
  dTag: string;
  title: string;
  price: number;
  geohash: string;
  status: string;
  description?: string;
}

// Simple geohash decoder - just enough for demo
function geohashToLatLon(geohash: string): [number, number] | null {
  // North America approx bounds for demo
  const mockLocations: Record<string, [number, number]> = {
    '9q8yyz': [37.7749, -122.4194], // San Francisco
    '9q8yym': [34.0522, -118.2437], // Los Angeles
    '9q8yyk': [40.7128, -74.0060],  // New York
    '9q8yyf': [41.8781, -87.6298],  // Chicago
    'dpwh': [47.6062, -122.3321],   // Seattle
    'dqcjq': [39.7392, -104.9903],  // Denver
    'd5f': [29.7604, -95.3698],     // Houston
    'dp7c': [45.5017, -73.5673],    // Montreal
    'c2b': [43.6532, -79.3832],     // Toronto
    '9q9p': [49.2827, -123.1207],   // Vancouver
  };
  
  // Check if we have a mock location for this geohash prefix
  for (const [prefix, coords] of Object.entries(mockLocations)) {
    if (geohash.startsWith(prefix)) return coords;
  }
  
  // Return random location in North America for demo
  return [
    25 + Math.random() * 35,  // Lat: 25-60 (US/Canada range)
    -125 + Math.random() * 55 // Lon: -125 to -70 (West to East coast)
  ];
}

interface MapProps {
  lockers?: Locker[];
  onLockerClick?: (locker: Locker) => void;
}

export function LockersMap({ lockers = [], onLockerClick }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map centered on North America
    const map = L.map(containerRef.current).setView([45, -100], 3);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add markers when lockers change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    lockers.forEach(locker => {
      if (!locker.geohash) return;
      
      const coords = geohashToLatLon(locker.geohash);
      if (!coords) return;

      const marker = L.marker(coords)
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 150px;">
            <h3 style="margin: 0 0 5px 0; font-weight: bold;">${locker.title}</h3>
            <p style="margin: 0; color: #666;">${locker.price} sats/hr</p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: ${locker.status === 'available' ? 'green' : 'orange'};">
              ${locker.status}
            </p>
          </div>
        `);

      if (onLockerClick) {
        marker.on('click', () => onLockerClick(locker));
      }

      markersRef.current.push(marker);
    });
  }, [lockers, onLockerClick]);

  return (
    <div 
      ref={containerRef} 
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
    />
  );
}

export default LockersMap;