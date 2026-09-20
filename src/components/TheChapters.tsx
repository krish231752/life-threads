import React, { useState } from 'react';
import { Chapter, Receipt } from '../types';
import { RECEIPT_TYPE_META, formatTimestamp } from '../utils/receiptHelpers';
import { 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Calendar, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Compass,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface TheChaptersProps {
  chapters: Chapter[];
  receipts: Receipt[];
  onSelectReceipt: (receipt: Receipt) => void;
  onJumpToThreadWithReceipt: (receiptId: string) => void;
}

export const TheChapters: React.FC<TheChaptersProps> = ({
  chapters,
  receipts,
  onSelectReceipt,
  onJumpToThreadWithReceipt,
}) => {
  const [activeChapterId, setActiveChapterId] = useState<string>(chapters[0]?.id || '');

  const currentChapter = chapters.find((c) => c.id === activeChapterId) || chapters[0];
  const chapterReceipts = receipts.filter((r) => currentChapter?.receiptIds.includes(r.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Editorial Header */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-0.5 text-xs font-mono text-indigo-300">
          <Compass className="h-3 w-3" />
          <span>AUTONOMOUS CLUSTERING & BEHAVIORAL PIVOTS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-white">
          The Chapters of a Digital Life
        </h1>
        <p className="text-sm sm:text-base text-white/60 font-light leading-relaxed">
          Real lives don't move in rigid monthly increments. They pivot around moments of exhaustion, spontaneous flight bookings, quiet morning rituals, and high-voltage breakthroughs.
        </p>
      </div>

      {/* Interactive Chapter Stepper / Timeline Scrubber */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {chapters.map((ch, idx) => {
          const isActive = ch.id === currentChapter?.id;
          return (
            <button
              key={ch.id}
              onClick={() => setActiveChapterId(ch.id)}
              className={`group relative flex flex-col justify-between rounded-2xl p-5 text-left transition border ${
                isActive
                  ? 'border-indigo-400/80 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                  : 'border-white/[0.08] bg-[#0E111A] hover:border-white/20 hover:bg-[#121622]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-3">
                <span className="font-mono text-[10px] text-white/40 tracking-wider">
                  0{idx + 1} // ERA
                </span>
                <span
                  className="h-2.5 w-2.5 rounded-full ring-2 ring-black"
                  style={{ backgroundColor: ch.accentColor }}
                />
              </div>

              <div className="space-y-1">
                <h3 className={`text-base font-bold transition ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                  {ch.title}
                </h3>
                <p className="text-xs text-white/50 line-clamp-1 font-light">
                  {ch.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40 w-full">
                <span>{ch.receiptIds.length} receipts</span>
                <span className={isActive ? 'text-indigo-300 font-medium' : 'text-white/40'}>
                  {isActive ? 'Active View' : 'Select'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Chapter Detailed Narrative Presentation */}
      {currentChapter && (
        <div className="space-y-8">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0E111A] p-6 sm:p-10 space-y-8">
            {/* Top Chapter Metadata */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span 
                    className="inline-block h-2 w-2 rounded-full" 
                    style={{ backgroundColor: currentChapter.accentColor }}
                  />
                  <span className="font-mono text-xs text-white/50 uppercase tracking-wider">
                    {formatTimestamp(currentChapter.startDate).date} — {formatTimestamp(currentChapter.endDate).date}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif text-white">
                  {currentChapter.title}
                </h2>
                <p className="text-sm font-medium text-amber-300/90 italic">
                  "{currentChapter.tagline}"
                </p>
              </div>

              {/* Dominant Themes / Motifs */}
              <div className="flex flex-wrap items-center gap-2">
                {currentChapter.dominantThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-1 text-xs text-white/70"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Narrative Story */}
            <div className="space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-white/40">
                Chapter Synthesis
              </h4>
              <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed max-w-4xl">
                {currentChapter.narrative}
              </p>
            </div>

            {/* Crucial Section: "Something Changed Here" Turning Point */}
            {currentChapter.turningPoint && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.04] p-5 sm:p-6 space-y-3">
                <div className="flex items-center gap-2 text-amber-300">
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">
                    Turning Point Signal
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">
                  {currentChapter.turningPoint.headline}
                </h4>
                <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                  {currentChapter.turningPoint.evidence}
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      const trigger = receipts.find((r) => r.id === currentChapter.turningPoint?.triggerReceiptId);
                      if (trigger) onSelectReceipt(trigger);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 transition"
                  >
                    <span>Inspect Pivotal Trigger Receipt</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Receipts Constituting this Chapter */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-widest text-white/50">
                  Constituent Digital Receipts ({chapterReceipts.length} records)
                </h4>
                <span className="text-xs text-white/40">Click any card to trace its thread</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chapterReceipts.map((rcpt) => {
                  const meta = RECEIPT_TYPE_META[rcpt.type];
                  const Icon = meta.icon;
                  const { date, time } = formatTimestamp(rcpt.timestamp);

                  return (
                    <div
                      key={rcpt.id}
                      onClick={() => onSelectReceipt(rcpt)}
                      className="group cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/20 hover:bg-white/[0.05] transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ${meta.bgLight} ${meta.textColor}`}>
                            <Icon className="h-3 w-3" />
                            {meta.label}
                          </span>
                          <span className="font-mono text-[10px] text-white/40">
                            {time}
                          </span>
                        </div>

                        <h5 className="text-sm font-semibold text-white group-hover:text-amber-300 transition line-clamp-2">
                          {rcpt.title}
                        </h5>

                        <p className="text-xs text-white/60 font-light line-clamp-2">
                          {rcpt.subtitle}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-white/40">
                        <span className="truncate max-w-[140px]">
                          {rcpt.location?.name || date}
                        </span>
                        <span className="text-amber-400/80 group-hover:text-amber-300 flex items-center gap-0.5">
                          View details <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
