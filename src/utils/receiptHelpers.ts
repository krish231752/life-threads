import React from 'react';
import {
  Music,
  Film,
  MapPin,
  ShoppingBag,
  Camera,
  MessageSquare,
  Search,
  Calendar,
  FileText,
} from 'lucide-react';
import { ReceiptType } from '../types';

export interface TypeMeta {
  type: ReceiptType;
  label: string;
  pluralLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
}

export const RECEIPT_TYPE_META: Record<ReceiptType, TypeMeta> = {
  music: {
    type: 'music',
    label: 'Music Track',
    pluralLabel: 'Music Tracks',
    icon: Music,
    color: '#818CF8', // Indigo
    bgLight: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/30',
    textColor: 'text-indigo-400',
  },
  movies: {
    type: 'movies',
    label: 'Cinema & Streaming',
    pluralLabel: 'Cinema & Films',
    icon: Film,
    color: '#A855F7', // Purple
    bgLight: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
  },
  places: {
    type: 'places',
    label: 'Place & Check-in',
    pluralLabel: 'Places Visited',
    icon: MapPin,
    color: '#34D399', // Emerald
    bgLight: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
  },
  purchases: {
    type: 'purchases',
    label: 'Financial Receipt',
    pluralLabel: 'Purchases',
    icon: ShoppingBag,
    color: '#F59E0B', // Amber
    bgLight: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-400',
  },
  photos: {
    type: 'photos',
    label: 'Photograph',
    pluralLabel: 'Photographs',
    icon: Camera,
    color: '#EC4899', // Pink
    bgLight: 'bg-pink-500/10',
    borderColor: 'border-pink-500/30',
    textColor: 'text-pink-400',
  },
  messages: {
    type: 'messages',
    label: 'Direct Message',
    pluralLabel: 'Messages',
    icon: MessageSquare,
    color: '#38BDF8', // Sky
    bgLight: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-400',
  },
  searches: {
    type: 'searches',
    label: 'Web Query',
    pluralLabel: 'Searches',
    icon: Search,
    color: '#F43F5E', // Rose
    bgLight: 'bg-rose-500/10',
    borderColor: 'border-rose-500/30',
    textColor: 'text-rose-400',
  },
  events: {
    type: 'events',
    label: 'Calendar Event',
    pluralLabel: 'Events',
    icon: Calendar,
    color: '#FB923C', // Orange
    bgLight: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
  },
  notes: {
    type: 'notes',
    label: 'Personal Note',
    pluralLabel: 'Personal Notes',
    icon: FileText,
    color: '#E2E8F0', // Slate
    bgLight: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
    textColor: 'text-slate-300',
  },
};

export function formatTimestamp(isoString: string): {
  date: string;
  time: string;
  relative: string;
} {
  const d = new Date(isoString);
  const date = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return { date, time, relative: `${date} • ${time}` };
}
