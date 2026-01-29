import type { NostrEvent } from '@nostrify/nostrify';

export interface LockerListing {
  id: string;
  pubkey: string;
  dTag: string;
  title: string;
  description: string;
  status: 'available' | 'occupied' | 'maintenance';
  geohash: string;
  location?: string;
  price: number;
  currency: string;
  dimensions?: string;
  overdueFee?: number;
  overdueDays?: number;
  proxyMode: boolean;
  proxyFee?: number;
  abandonDays?: number;
  images: string[];
  createdAt: number;
  event: NostrEvent;
}

export interface LockerConfig {
  title: string;
  description: string;
  location: string;
  geohash: string;
  baseFee: number;
  overdueFee: number;
  overdueDays: number;
  proxyMode: boolean;
  proxyFee: number;
  abandonDays: number;
  dimensions: string;
}

export interface UnlockCommand {
  action: 'unlock';
  locker_id: string;
  payment_preimage: string;
  rental_invoice: string;
}

export interface TrustScore {
  pubkey: string;
  positiveReactions: number;
  negativeReactions: number;
  zapsSats: number;
  totalReactions: number;
  score: number;
}

export function parseLockerEvent(event: NostrEvent): LockerListing | null {
  if (event.kind !== 30402) return null;

  const getTag = (name: string): string | undefined => {
    return event.tags.find(([t]) => t === name)?.[1];
  };

  const getTags = (name: string): string[] => {
    return event.tags.filter(([t]) => t === name).map(([, v]) => v);
  };

  const tTags = getTags('t');
  if (!tTags.includes('locker')) return null;

  const dTag = getTag('d');
  if (!dTag) return null;

  const title = getTag('title') || 'Unnamed Locker';
  const status = (getTag('status') as 'available' | 'occupied' | 'maintenance') || 'available';
  const geohash = getTag('g') || '';
  const location = getTag('location');
  
  const priceTag = event.tags.find(([t]) => t === 'price');
  const price = priceTag ? parseInt(priceTag[1]) || 0 : 0;
  const currency = priceTag?.[2] || 'SATS';

  const dimensions = getTag('dimensions');
  const overdueFee = parseInt(getTag('overdue-fee') || '0');
  const overdueDays = parseInt(getTag('overdue-days') || '7');
  const proxyMode = getTag('proxy-mode') === 'true';
  const proxyFee = parseInt(getTag('proxy-fee') || '0');
  const abandonDays = parseInt(getTag('abandon-days') || '30');

  const images = event.tags
    .filter(([t]) => t === 'image')
    .map(([, url]) => url);

  return {
    id: event.id,
    pubkey: event.pubkey,
    dTag,
    title,
    description: event.content,
    status,
    geohash,
    location,
    price,
    currency,
    dimensions,
    overdueFee,
    overdueDays,
    proxyMode,
    proxyFee,
    abandonDays,
    images,
    createdAt: event.created_at,
    event,
  };
}

export function createLockerTags(config: LockerConfig): string[][] {
  const tags: string[][] = [
    ['d', crypto.randomUUID()],
    ['title', config.title],
    ['t', 'locker'],
    ['t', 'dead-drop'],
    ['g', config.geohash],
    ['price', config.baseFee.toString(), 'SATS'],
    ['status', 'available'],
    ['dimensions', config.dimensions],
    ['overdue-fee', config.overdueFee.toString()],
    ['overdue-days', config.overdueDays.toString()],
    ['proxy-mode', config.proxyMode.toString()],
    ['abandon-days', config.abandonDays.toString()],
  ];

  if (config.location) {
    tags.push(['location', config.location]);
  }

  if (config.proxyMode && config.proxyFee > 0) {
    tags.push(['proxy-fee', config.proxyFee.toString()]);
  }

  return tags;
}
