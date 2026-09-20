import React from 'react';
import { Receipt } from '../../types';
import { RECEIPT_TYPE_META, formatTimestamp } from '../../utils/receiptHelpers';
import { MapPin, GitFork } from 'lucide-react';

interface ReceiptCardProps {
  receipt: Receipt;
  onSelect: (receipt: Receipt) => void;
  onExploreThread: (receiptId: string) => void;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  receipt,
  onSelect,
  onExploreThread,
}) => {
  const meta = RECEIPT_TYPE_META[receipt.type];
  const Icon = meta.icon;
  const { date, time } = formatTimestamp(receipt.timestamp);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(receipt);
    }
  };

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`${receipt.type}: ${receipt.title} on ${date}`}
      onClick={() => onSelect(receipt)}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-[#0E111A] p-5 transition hover:border-amber-400/50 hover:bg-[#121622] flex flex-col justify-between space-y-4 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
    >
      {/* Card Header with Type Badge and Timestamp */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${meta.bgLight} ${meta.textColor} border ${meta.borderColor}`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span>{meta.label}</span>
        </span>

        <time dateTime={receipt.timestamp} className="font-mono text-[11px] text-white/40">
          {date} • {time}
        </time>
      </div>

      {/* Specific Visual Accent by Type */}
      <div className="space-y-2">
        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition line-clamp-2">
          {receipt.title}
        </h3>
        <p className="text-xs text-white/60 font-light line-clamp-2">
          {receipt.subtitle}
        </p>

        {/* Purchase specific amount badge */}
        {receipt.type === 'purchases' && typeof receipt.metadata.amount === 'number' && (
          <div className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 font-mono text-xs font-bold text-amber-300">
            <span>${receipt.metadata.amount.toFixed(2)}</span>
            <span className="text-[10px] text-white/40 font-normal">USD</span>
          </div>
        )}

        {/* Photo palette */}
        {receipt.type === 'photos' && Array.isArray(receipt.metadata.palette) && (
          <div className="flex items-center gap-1 pt-1">
            {receipt.metadata.palette.map((color, cIdx) => (
              <span
                key={cIdx}
                className="h-3.5 w-5 rounded-sm border border-black/40"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            <span className="text-[10px] text-white/40 ml-1 font-mono">Palette</span>
          </div>
        )}

        {/* Music BPM / mood */}
        {receipt.type === 'music' && Boolean(receipt.metadata.bpm || receipt.metadata.mood) && (
          <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-300/80">
            {receipt.metadata.bpm && <span>{receipt.metadata.bpm} BPM</span>}
            {receipt.metadata.mood && <span>• {receipt.metadata.mood}</span>}
          </div>
        )}

        {/* Searches Query Box */}
        {receipt.type === 'searches' && Boolean(receipt.metadata.query) && (
          <div className="rounded-lg bg-black/40 border border-white/[0.04] p-2 text-xs font-mono text-rose-300/90 truncate">
            🔍 &quot;{receipt.metadata.query}&quot;
          </div>
        )}

        {/* Notes quote preview */}
        {receipt.type === 'notes' && Boolean(receipt.metadata.description) && (
          <blockquote className="text-xs italic text-white/70 bg-white/[0.02] border-l-2 border-slate-400/50 pl-2.5 py-1 line-clamp-2">
            &ldquo;{String(receipt.metadata.description)}&rdquo;
          </blockquote>
        )}
      </div>

      {/* Card Footer: Location & Action */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/40">
        <span className="flex items-center gap-1 truncate max-w-[160px]">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{receipt.location?.name || receipt.location?.city || 'Digital'}</span>
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onExploreThread(receipt.id);
          }}
          aria-label={`Trace threads for ${receipt.title}`}
          className="text-amber-400 group-hover:text-amber-300 font-medium flex items-center gap-1 text-[11px] focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:outline-none rounded px-1"
        >
          <GitFork className="h-3 w-3" />
          <span>Trace Threads</span>
        </button>
      </div>
    </article>
  );
};
