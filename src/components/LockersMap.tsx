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

// Geohash to lat/lon decoder for major cities
const GEOHASH_MAP: Record<string, [number, number]> = {
  '9q8yyz': [37.7749, -122.4194], // San Francisco
  '9q8yym': [34.0522, -118.2437], // Los Angeles
  '9q8yyk': [40.7128, -74.0060],  // New York
  '9q8yyf': [41.8781, -87.6298],  // Chicago
  'dpwh': [47.6062, -122.3321],   // Seattle
  'dqcjq': [39.7392, -104.9903],  // Denver
};

function geohashToLatLon(geohash: string): [number, number] | null {
  // Check exact match first
  if (GEOHASH_MAP[geohash]) return GEOHASH_MAP[geohash];
  
  // Check prefix match
  for (const [prefix, coords] of Object.entries(GEOHASH_MAP)) {
    if (geohash.startsWith(prefix)) return coords;
  }
  
  // Return random location in North America for demo
  return [
    25 + Math.random() * 35,  // Lat: 25-60
    -125 + Math.random() * 55 // Lon: -125 to -70
  ];
}

interface MapProps {
  lockers?: Locker[];
  onLockerClick?: (locker: Locker) => void;
  center?: [number, number];
  zoom?: number;
}

export function LockersMap({ 
  lockers = [], 
  onLockerClick, 
  center = [45, -100], 
  zoom = 3 
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [center, zoom]);

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

      const popupContent = locker.price > 0 && locker.price < 1000
        ? `<div style="min-width: 150px;">
            <h3 style="margin: 0 0 5px 0; font-weight: bold;">${locker.title}</h3>
            <p style="margin: 0; color: #666;">${locker.description || ''}</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">
              ${locker.price} products
            </p>
          </div>`
        : `<div style="min-width: 150px;">
            <h3 style="margin: 0 0 5px 0; font-weight: bold;">${locker.title}</h3>
            <p style="margin: 0; color: #666;">${locker.description || ''}</p>
          </div>`;

      const marker = L.marker(coords)
        .addTo(mapRef.current!)
        .bindPopup(popupContent);

      if (onLockerClick) {
        marker.on('click', () => onLockerClick(locker));
      }

      markersRef.current.push(marker);
    });

    // Fit bounds if we have markers
    if (markersRef.current.length > 0 && markersRef.current.length < 10) {
      const group = new L.FeatureGroup(markersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [lockers, onLockerClick]);

  return (
    <div 
      ref={containerRef} 
      style={{ height: '100%', width: '100%', minHeight: '400px' }}
    />
  );
}

export default LockersMap;