export type ReceiptType =
  | 'music'
  | 'movies'
  | 'places'
  | 'purchases'
  | 'photos'
  | 'messages'
  | 'searches'
  | 'events'
  | 'notes';

export interface LocationData {
  name: string;
  city: string;
  area?: string;
  lat?: number;
  lng?: number;
  venueType?: string;
}

export interface Receipt {
  id: string;
  type: ReceiptType;
  timestamp: string; // ISO-8601 string
  title: string;
  subtitle: string;
  description?: string;
  location?: LocationData;
  tags: string[];
  metadata: {
    // Music
    artist?: string;
    album?: string;
    duration?: string;
    mood?: string;
    bpm?: number;
    // Purchases
    amount?: number;
    currency?: string;
    merchant?: string;
    category?: string;
    paymentMethod?: string;
    // Movies
    platform?: string;
    director?: string;
    runtime?: string;
    genre?: string;
    // Photos
    aspectRatio?: 'landscape' | 'portrait' | 'square';
    camera?: string;
    palette?: string[];
    // Messages
    recipient?: string;
    contactRole?: string;
    sentiment?: 'joy' | 'pensive' | 'anticipation' | 'vulnerable' | 'celebratory';
    direction?: 'sent' | 'received';
    // Searches
    query?: string;
    intent?: 'curiosity' | 'travel' | 'creative' | 'existential' | 'problem-solving';
    // Events
    eventCategory?: string;
    attendees?: string[];
    // Notes
    wordCount?: number;
    pinned?: boolean;
    paperType?: 'lined' | 'grid' | 'blank';
    description?: string;
    [key: string]: unknown;
  };
}

export interface ConnectionReason {
  type: 'temporal' | 'spatial' | 'semantic' | 'behavioral' | 'sequential';
  label: string;
  description: string;
  weight: number; // 0.1 to 1.0
  evidenceClass?: 'observed' | 'inferred'; // 'observed' = empirical data; 'inferred' = algorithmic deduction
}

export interface ReceiptConnection {
  targetId: string;
  score: number; // 0 to 1
  reasons: ConnectionReason[];
}

export interface Chapter {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  eraIcon: string;
  startDate: string;
  endDate: string;
  receiptIds: string[];
  narrative: string;
  turningPoint?: {
    headline: string;
    evidence: string;
    triggerReceiptId: string;
  };
  dominantThemes: string[];
  accentColor: string;
}

export interface ThreadStory {
  id: string;
  title: string;
  leadReceiptId: string;
  connectedReceiptIds: string[];
  categoryTypes: ReceiptType[];
  narrative: string;
  evidence: string[];
  timeSpanMinutes: number;
  locationName?: string;
  coreInsight: string;
  whyThisMatters?: string;
}

export interface LifeStats {
  totalMoments: number;
  typeCounts: Record<ReceiptType, number>;
  totalPlaces: number;
  totalSpend: number;
  dateRange: {
    start: string;
    end: string;
    daysCount: number;
  };
  totalThreadsDiscovered: number;
  totalChapters: number;
  peakHour?: {
    hour: number;
    label: string;
    count: number;
    description: string;
  };
  topSanctuary?: {
    name: string;
    city: string;
    count: number;
  };
  crossMediumRate?: number; // e.g. 78% of moments link to >= 2 different media
}
