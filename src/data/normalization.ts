import { Receipt, ReceiptType } from '../types';
import { sanitizeString, isValidDate, VALID_RECEIPT_TYPES } from './validation';

/**
 * Maps arbitrary category / type strings to supported ReceiptType enum.
 */
export function normalizeReceiptType(rawType: unknown): ReceiptType {
  if (!rawType) return 'notes';
  const typeStr = String(rawType).toLowerCase().trim();

  if (VALID_RECEIPT_TYPES.has(typeStr as ReceiptType)) {
    return typeStr as ReceiptType;
  }

  if (['music', 'song', 'audio', 'track', 'spotify', 'album', 'listen'].some((k) => typeStr.includes(k))) {
    return 'music';
  }
  if (['movie', 'film', 'cinema', 'video', 'stream', 'netflix', 'criterion', 'hulu'].some((k) => typeStr.includes(k))) {
    return 'movies';
  }
  if (['place', 'location', 'checkin', 'venue', 'foursquare', 'swarm', 'visit', 'arrival'].some((k) => typeStr.includes(k))) {
    return 'places';
  }
  if (['purchase', 'payment', 'buy', 'transaction', 'expense', 'order', 'receipt', 'card', 'checkout'].some((k) => typeStr.includes(k))) {
    return 'purchases';
  }
  if (['photo', 'image', 'picture', 'snapshot', 'camera', 'jpg', 'png'].some((k) => typeStr.includes(k))) {
    return 'photos';
  }
  if (['message', 'chat', 'sms', 'text', 'dm', 'imessage', 'whatsapp', 'slack', 'signal'].some((k) => typeStr.includes(k))) {
    return 'messages';
  }
  if (['search', 'query', 'google', 'lookup', 'find', 'prompt'].some((k) => typeStr.includes(k))) {
    return 'searches';
  }
  if (['event', 'calendar', 'flight', 'meeting', 'ticket', 'show', 'concert', 'schedule'].some((k) => typeStr.includes(k))) {
    return 'events';
  }

  return 'notes';
}

/**
 * Normalizes an array of arbitrary raw receipt objects into validated, sanitized Receipt models.
 */
export function normalizeDataset(rawItems: any[]): Receipt[] {
  return rawItems.map((item, idx) => {
    const rawObj = item && typeof item === 'object' ? item : {};

    // ID resolution
    const id = rawObj.id ? sanitizeString(rawObj.id, 64) : `moment-${idx + 1}`;

    // Type resolution
    const rawType = rawObj.type || rawObj.category || rawObj.kind || rawObj.medium;
    const type = normalizeReceiptType(rawType);

    // Timestamp resolution with validation
    const rawTimestamp = rawObj.timestamp || rawObj.datetime || rawObj.date || rawObj.created_at || rawObj.time;
    let timestamp: string;
    if (isValidDate(rawTimestamp)) {
      timestamp = new Date(rawTimestamp).toISOString();
    } else {
      // Graceful fallback: maintain a predictable sequence
      const fallbackDate = new Date(2024, 9, 14, 12, idx % 60);
      timestamp = fallbackDate.toISOString();
    }

    // Title resolution
    const rawTitle = rawObj.title || rawObj.name || rawObj.subject || rawObj.headline || `Moment #${idx + 1}`;
    const title = sanitizeString(rawTitle, 150);

    // Subtitle resolution
    const rawSubtitle = rawObj.subtitle || rawObj.text || rawObj.artist || rawObj.merchant || rawObj.venue || rawObj.description || '';
    const subtitle = sanitizeString(rawSubtitle, 200);

    // Description resolution
    const rawDescription = rawObj.description || rawObj.notes || rawObj.text || rawObj.content || rawObj.body;
    const description = rawDescription ? sanitizeString(rawDescription, 1000) : undefined;

    // Location normalization
    let location: Receipt['location'] = undefined;
    const rawLoc = rawObj.location || rawObj.venue || rawObj.place;
    if (rawLoc) {
      if (typeof rawLoc === 'string') {
        const cleanLoc = sanitizeString(rawLoc, 100);
        location = { name: cleanLoc, city: 'Unknown' };
      } else if (typeof rawLoc === 'object') {
        const locObj = rawLoc;
        location = {
          name: sanitizeString(locObj.name || locObj.venue || 'Venue', 100),
          city: locObj.city ? sanitizeString(locObj.city, 60) : 'Unknown',
          area: locObj.area ? sanitizeString(locObj.area, 60) : undefined,
          lat: typeof locObj.lat === 'number' && !isNaN(locObj.lat) ? locObj.lat : undefined,
          lng: typeof locObj.lng === 'number' && !isNaN(locObj.lng) ? locObj.lng : undefined,
        };
      }
    }

    // Tags normalization
    let tags: string[] = [];
    if (Array.isArray(rawObj.tags)) {
      tags = rawObj.tags
        .filter((t: unknown) => typeof t === 'string' && t.trim().length > 0)
        .map((t: string) => sanitizeString(t.toLowerCase().replace(/[^a-z0-9_-]/g, ''), 40));
    } else if (typeof rawObj.tags === 'string' && rawObj.tags.trim()) {
      tags = rawObj.tags
        .split(/[,;|]/)
        .map((t: string) => sanitizeString(t.toLowerCase().trim().replace(/[^a-z0-9_-]/g, ''), 40))
        .filter((t: string) => t.length > 0);
    }
    if (tags.length === 0) {
      tags = [type];
    }

    // Metadata preservation and sanitization
    const metadata: Record<string, any> = {};
    if (rawObj.metadata && typeof rawObj.metadata === 'object') {
      Object.entries(rawObj.metadata).forEach(([k, v]) => {
        const cleanKey = sanitizeString(k, 40);
        if (typeof v === 'string') {
          metadata[cleanKey] = sanitizeString(v, 300);
        } else if (typeof v === 'number' && !isNaN(v)) {
          metadata[cleanKey] = v;
        } else if (typeof v === 'boolean') {
          metadata[cleanKey] = v;
        } else if (Array.isArray(v)) {
          metadata[cleanKey] = v.slice(0, 10).map((elem) => (typeof elem === 'string' ? sanitizeString(elem, 50) : elem));
        }
      });
    }

    // Extract common direct attributes into metadata if not present
    const numericAmount = typeof rawObj.amount === 'number' ? rawObj.amount :
      typeof rawObj.cost === 'number' ? rawObj.cost :
      typeof rawObj.price === 'number' ? rawObj.price : undefined;
    if (numericAmount !== undefined && !metadata.amount) {
      metadata.amount = numericAmount;
    }
    if (rawObj.currency && !metadata.currency) {
      metadata.currency = sanitizeString(rawObj.currency, 5);
    }
    if (rawObj.artist && !metadata.artist) {
      metadata.artist = sanitizeString(rawObj.artist, 100);
    }
    if (rawObj.query && !metadata.query) {
      metadata.query = sanitizeString(rawObj.query, 200);
    }
    if (rawObj.palette && Array.isArray(rawObj.palette) && !metadata.palette) {
      metadata.palette = rawObj.palette.slice(0, 5).map((c: unknown) => sanitizeString(c, 20));
    }

    return {
      id,
      type,
      timestamp,
      title,
      subtitle,
      description,
      location,
      tags,
      metadata,
    };
  });
}
