import React, { useState, useMemo } from 'react';
import { Receipt, Chapter, ReceiptType } from '../types';
import { RECEIPT_TYPE_META, formatTimestamp } from '../utils/receiptHelpers';
import { 
  Compass, 
  ChevronRight,
  RotateCcw,
  FileQuestion
} from 'lucide-react';

interface DigitalJourneyProps {
  receipts: Receipt[];
  chapters: Chapter[];
  onSelectReceipt: (receipt: Receipt) => void;
}

export const DigitalJourney: React.FC<DigitalJourneyProps> = ({
  receipts,
  chapters,
  onSelectReceipt,
}) => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ReceiptType | 'all'>('all');
  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(receipts[0]?.id || null);

  // Sort chronologically
  const sortedReceipts = useMemo(() => {
    return [...receipts].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [receipts]);

  const filteredReceipts = useMemo(() => {
    if (selectedTypeFilter === 'all') return sortedReceipts;
    return sortedReceipts.filter((r) => r.type === selectedTypeFilter);
  }, [sortedReceipts, selectedTypeFilter]);

  const activeReceipt = receipts.find((r) => r.id === activeReceiptId) || filteredReceipts[0] || receipts[0];

  if (receipts.length === 0) {
    return (
      <div 
        role="status"
        className="mx-auto max-w-xl my-16 rounded-3xl border border-white/[0.08] bg-[#0E111A] p-8 text-center space-y-4"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <Compass className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-white">No Journey Data</h3>
        <p className="text-xs text-white/60 font-light">
          Load a dataset to view the flowing chronological constellation journey.
        </p>
      </div>
    );
  }

  return (
    <section 
      aria-label="Chronological Digital Journey Stream"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8"
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-mono text-emerald-300">
            <Compass className="h-3 w-3" />
            <span>THE CONSTELLATION STORY PATH</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            The Flowing Digital Journey
          </h1>
          <p className="text-sm text-white/60 font-light leading-relaxed">
            Every moment in time plotted along the arc of transition. Notice how clusters tighten during breakthrough events and expand into gentle waves during periods of quiet reflection.
          </p>
        </div>

        {/* Medium Filter Chips */}
        <div 
          role="radiogroup" 
          aria-label="Filter journey by medium"
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            role="radio"
            aria-checked={selectedTypeFilter === 'all'}
            onClick={() => setSelectedTypeFilter('all')}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              selectedTypeFilter === 'all'
                ? 'bg-white/10 text-white border-white/20'
                : 'bg-white/[0.02] text-white/50 border-white/[0.06] hover:text-white'
            }`}
          >
            All Types ({sortedReceipts.length})
          </button>
          {Object.entries(RECEIPT_TYPE_META).map(([typeKey, meta]) => {
            const count = sortedReceipts.filter((r) => r.type === typeKey).length;
            if (count === 0) return null;
            const isSelected = selectedTypeFilter === typeKey;
            const Icon = meta.icon;
            return (
              <button
                key={typeKey}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedTypeFilter(typeKey as ReceiptType)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                  isSelected
                    ? `${meta.bgLight} ${meta.textColor} ${meta.borderColor}`
                    : 'bg-white/[0.02] text-white/50 border-white/[0.06] hover:text-white'
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{meta.label}</span>
                <span className="font-mono text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapters Horizon Bar */}
      {chapters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2" role="region" aria-label="Narrative chapters overview">
          {chapters.map((ch, idx) => (
            <div
              key={ch.id}
              className="rounded-xl border border-white/[0.06] bg-[#0E111A] p-3 text-left space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-white/40">PHASE 0{idx + 1}</span>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ch.accentColor }} />
              </div>
              <h4 className="text-xs font-bold text-white truncate">{ch.title}</h4>
              <p className="text-[11px] text-white/50 truncate font-light">{ch.tagline}</p>
            </div>
          ))}
        </div>
      )}

      {/* Active Spotlight Header */}
      {activeReceipt && (
        <div 
          role="region"
          aria-label="Spotlighted moment details"
          className="rounded-2xl border border-amber-500/30 bg-[#0E111A] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-start gap-3.5">
            {(() => {
              const meta = RECEIPT_TYPE_META[activeReceipt.type];
              const Icon = meta.icon;
              return (
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.bgLight} ${meta.textColor} border ${meta.borderColor}`}>
                  <Icon className="h-6 w-6" />
                </div>
              );
            })()}
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-400 font-medium uppercase">
                  Spotlighted Moment
                </span>
                <span className="text-white/30">•</span>
                <time dateTime={activeReceipt.timestamp} className="font-mono text-xs text-white/50">
                  {formatTimestamp(activeReceipt.timestamp).relative}
                </time>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {activeReceipt.title}
              </h3>
              <p className="text-xs text-white/60 font-light">
                {activeReceipt.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectReceipt(activeReceipt)}
            aria-label={`Open detailed receipt story for ${activeReceipt.title}`}
            className="self-start sm:self-auto rounded-xl bg-amber-400 hover:bg-amber-300 text-black px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 shrink-0 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            <span>Open Receipt Story</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Interactive Constellation Ribbon Timeline */}
      <div className="relative rounded-3xl border border-white/[0.08] bg-[#0A0D14] p-6 sm:p-8 overflow-hidden space-y-6">
        <div className="flex items-center justify-between text-xs text-white/40 font-mono uppercase tracking-wider">
          <span>Flow of Moments (Earliest → Latest)</span>
          <span>Showing {filteredReceipts.length} Points</span>
        </div>

        {filteredReceipts.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center space-y-3">
            <FileQuestion className="h-6 w-6 text-white/40 mx-auto" />
            <p className="text-xs text-white/50">No moments found for selected medium filter.</p>
            <button
              onClick={() => setSelectedTypeFilter('all')}
              className="text-amber-400 text-xs font-mono underline inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Show all types</span>
            </button>
          </div>
        ) : (
          <>
            {/* Constellation Dots Grid / Stream */}
            <div 
              role="list"
              aria-label="Chronological node sequence"
              className="relative py-4 overflow-x-auto scrollbar-none"
            >
              <div role="presentation" className="flex items-center gap-3 min-w-max py-4 px-2">
                {filteredReceipts.map((rcpt, idx) => {
                  const meta = RECEIPT_TYPE_META[rcpt.type];
                  const Icon = meta.icon;
                  const isSelected = rcpt.id === activeReceiptId;

                  return (
                    <div
                      key={rcpt.id}
                      role="listitem"
                      tabIndex={0}
                      aria-current={isSelected ? 'true' : undefined}
                      aria-label={`${rcpt.title}, ${formatTimestamp(rcpt.timestamp).date}`}
                      onClick={() => setActiveReceiptId(rcpt.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActiveReceiptId(rcpt.id);
                        }
                      }}
                      className="group relative cursor-pointer flex flex-col items-center gap-2 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-xl"
                    >
                      {/* Glowing Node */}
                      <div
                        className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/20 text-amber-300 scale-125 shadow-lg shadow-amber-500/20 z-10'
                            : `${meta.borderColor} ${meta.bgLight} ${meta.textColor} hover:scale-110 hover:border-white/40`
                        }`}
                        title={`${rcpt.title} (${formatTimestamp(rcpt.timestamp).date})`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Micro Timestamp Label */}
                      <span className="font-mono text-[9px] text-white/40 group-hover:text-white transition whitespace-nowrap">
                        {formatTimestamp(rcpt.timestamp).date.split(',')[0]}
                      </span>

                      {/* Connecting Horizontal Line Segment */}
                      {idx < filteredReceipts.length - 1 && (
                        <div className="absolute top-5 left-10 w-3 h-0.5 bg-white/10 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Density & Chronological Stream Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
              {filteredReceipts.slice(0, 9).map((rcpt) => {
                const meta = RECEIPT_TYPE_META[rcpt.type];
                const Icon = meta.icon;
                const { date } = formatTimestamp(rcpt.timestamp);

                return (
                  <div
                    key={rcpt.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Inspect ${rcpt.title}`}
                    onClick={() => {
                      setActiveReceiptId(rcpt.id);
                      onSelectReceipt(rcpt);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActiveReceiptId(rcpt.id);
                        onSelectReceipt(rcpt);
                      }
                    }}
                    className="cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/20 transition space-y-2 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium ${meta.bgLight} ${meta.textColor}`}>
                        <Icon className="h-3 w-3" />
                        <span>{meta.label}</span>
                      </span>
                      <span className="font-mono text-[10px] text-white/40">
                        {date}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white truncate">
                      {rcpt.title}
                    </h4>

                    <p className="text-[11px] text-white/50 truncate font-light">
                      {rcpt.subtitle}
                    </p>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-white/40">
                      <span className="truncate">{rcpt.location?.name || rcpt.location?.city || 'Digital'}</span>
                      <span className="text-amber-400">View →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
