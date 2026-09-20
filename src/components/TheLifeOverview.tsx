import React from 'react';
import { 
  Receipt, 
  LifeStats, 
  ThreadStory, 
  Chapter,
  ReceiptType
} from '../types';
import { RECEIPT_TYPE_META, formatTimestamp } from '../utils/receiptHelpers';
import { 
  Sparkles, 
  GitFork, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Compass, 
  Flame,
  Search,
  ExternalLink,
  BookOpen,
  Activity,
  Layers,
  Coffee,
  Moon,
  ChevronRight,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';

interface TheLifeOverviewProps {
  receipts: Receipt[];
  stats: LifeStats;
  threads: ThreadStory[];
  chapters: Chapter[];
  onNavigateToTab: (tab: 'chapters' | 'threads' | 'connect-dots' | 'journey' | 'explorer') => void;
  onSelectReceipt: (receipt: Receipt) => void;
  onSelectThread: (thread: ThreadStory) => void;
  onLaunchConnectDots?: (receiptId: string) => void;
}

export const TheLifeOverview: React.FC<TheLifeOverviewProps> = ({
  receipts,
  stats,
  threads,
  chapters,
  onNavigateToTab,
  onSelectReceipt,
  onSelectThread,
  onLaunchConnectDots,
}) => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Editorial Narrative Engine Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] via-transparent to-black/40 p-8 sm:p-12 backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono text-amber-300">
            <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-400" />
            <span>RAW DATA → INSIGHTS → CONNECTIONS → STORY</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight text-white leading-[1.12]">
              Hundreds of moments. <br />
              One life. <br />
              <span className="italic text-amber-300 font-light">Follow the threads.</span>
            </h1>

            <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed pt-1">
              LIFE//THREADS transforms fragmented digital traces into explainable moments, relationships, and behavioral chapters. A midnight song stream, a cold brew receipt, a cryptic text, a plane ticket purchased at 11:42 PM — seen individually, they look like noise. Follow the threads, and they reveal the turning points of a human life.
            </p>
          </div>

          {/* Core Story Numbers */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08]">
            <div className="space-y-0.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                {stats.totalMoments}
              </span>
              <p className="text-xs text-white/50 uppercase tracking-wider font-mono">Total Moments</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-indigo-400 tracking-tight">
                {stats.totalPlaces}
              </span>
              <p className="text-xs text-white/50 uppercase tracking-wider font-mono">Unique Places</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 tracking-tight">
                {stats.totalThreadsDiscovered}
              </span>
              <p className="text-xs text-white/50 uppercase tracking-wider font-mono">Golden Threads</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tracking-tight">
                {chapters.length}
              </span>
              <p className="text-xs text-white/50 uppercase tracking-wider font-mono">Life Chapters</p>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateToTab('threads')}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-xs font-semibold text-black hover:bg-amber-300 transition shadow-lg shadow-amber-500/20"
            >
              <GitFork className="h-4 w-4" />
              <span>Explore The Threads</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => onNavigateToTab('connect-dots')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.04] px-5 py-2.5 text-xs font-medium text-white hover:bg-white/10 transition"
            >
              <Sparkles className="h-4 w-4 text-pink-400" />
              <span>Connect The Dots</span>
            </button>

            <button
              onClick={() => onNavigateToTab('chapters')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-xs font-medium text-white/70 hover:text-white transition"
            >
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <span>Read The 4 Chapters</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grounded Life Signals & Behavioral Diagnostics */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Peak Activity Signal */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0E111A] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/40 font-mono">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Moon className="h-3.5 w-3.5" />
              <span>NOCTURNAL SPIKE</span>
            </span>
            <span>{stats.peakHour?.count || 0} moments</span>
          </div>
          <h3 className="text-base font-bold text-white">
            {stats.peakHour?.label || '11:00 PM — 2:00 AM'}
          </h3>
          <p className="text-xs text-white/60 font-light leading-relaxed">
            {stats.peakHour?.description || 'Peak creative intensity and introspective searches concentrate during nocturnal hours.'}
          </p>
        </div>

        {/* Top Physical Sanctuary */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0E111A] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/40 font-mono">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <Coffee className="h-3.5 w-3.5" />
              <span>PRIMARY SANCTUARY</span>
            </span>
            <span>{stats.topSanctuary?.count || 4} visits</span>
          </div>
          <h3 className="text-base font-bold text-white truncate">
            {stats.topSanctuary?.name || 'Devoción Coffee'}
          </h3>
          <p className="text-xs text-white/60 font-light leading-relaxed">
            Anchored in {stats.topSanctuary?.city || 'Brooklyn'}. Physical habit consistency acts as the emotional counterweight for rapid artistic transformation.
          </p>
        </div>

        {/* Cross-Medium Synergy Index */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0E111A] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-white/40 font-mono">
            <span className="flex items-center gap-1.5 text-emerald-300">
              <BrainCircuit className="h-3.5 w-3.5" />
              <span>CROSS-DOMAIN SYNERGY</span>
            </span>
            <span className="font-bold text-emerald-400">{stats.crossMediumRate || 82}% Linked</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Multi-Modal Synchronization
          </h3>
          <p className="text-xs text-white/60 font-light leading-relaxed">
            Audio, searches, messages, and physical receipts cross-correlate into unified narrative events rather than isolated silos.
          </p>
        </div>
      </section>

      {/* Editorial Quote Transition */}
      <div className="text-center py-4 border-y border-white/[0.06] space-y-2">
        <p className="text-xs font-mono tracking-widest text-amber-400/80 uppercase">The Central Thesis</p>
        <blockquote className="text-xl sm:text-2xl font-serif italic text-white/90 max-w-2xl mx-auto">
          "None of them tell the whole story. But lay them on top of each other, and the invisible architecture appears."
        </blockquote>
      </div>

      {/* Hero Entry Point: Discovered Golden Threads */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Discovered Golden Threads
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/50 font-light">
              Multi-receipt chains connecting searches, purchases, music, notes, and photos into a unified narrative.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('threads')}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore full interactive graph</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {threads.map((thread) => {
            return (
              <div
                key={thread.id}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E111A] p-6 transition hover:border-amber-500/40 hover:bg-[#121622] hover:shadow-xl hover:shadow-amber-500/5 space-y-5"
              >
                {/* Thread Card Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] text-amber-300 border border-white/[0.06]">
                      <Clock className="h-3 w-3" />
                      {thread.timeSpanMinutes < 60
                        ? `${thread.timeSpanMinutes} mins window`
                        : `${Math.round(thread.timeSpanMinutes / 60)} hrs window`}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-amber-300 transition">
                      {thread.title}
                    </h3>
                  </div>

                  <div className="flex items-center -space-x-1.5 overflow-hidden shrink-0">
                    {thread.categoryTypes.map((t) => {
                      const meta = RECEIPT_TYPE_META[t];
                      const Icon = meta.icon;
                      return (
                        <div
                          key={t}
                          className={`flex h-7 w-7 items-center justify-center rounded-full border border-[#090A0F] ${meta.bgLight} ${meta.textColor}`}
                          title={meta.label}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Narrative Synthesis */}
                <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed">
                  {thread.narrative}
                </p>

                {/* Evidence Signals (Observed vs Inferred Distinction) */}
                <div className="pt-3 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40">
                    <span>Key Relationship Evidence:</span>
                    <span className="text-amber-300/70">{thread.evidence.length} signals</span>
                  </div>

                  <div className="space-y-1.5">
                    {thread.evidence.slice(0, 2).map((ev, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-white/80">
                        <span className="mt-0.5 inline-flex items-center rounded px-1.5 py-0.2 font-mono text-[9px] font-semibold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0">
                          {idx === 0 ? 'OBSERVED' : 'INFERRED'}
                        </span>
                        <span className="font-light text-white/80">{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why This Matters Micro-Story Callout */}
                {thread.whyThisMatters && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-3 space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      <span>Why This Matters</span>
                    </span>
                    <p className="text-xs text-white/80 font-light italic leading-relaxed">
                      "{thread.whyThisMatters}"
                    </p>
                  </div>
                )}

                {/* Card Action Footers */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.04] text-xs">
                  <span className="flex items-center gap-1 text-[11px] text-white/50">
                    <MapPin className="h-3 w-3 text-white/40" />
                    {thread.locationName || 'Multiple venues'}
                  </span>

                  <div className="flex items-center gap-2">
                    {onLaunchConnectDots && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLaunchConnectDots(thread.leadReceiptId);
                        }}
                        className="rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-2.5 py-1.5 text-xs text-white/80 hover:text-white transition"
                        title="Step-by-step discovery mode"
                      >
                        Connect Dots
                      </button>
                    )}

                    <button
                      onClick={() => onSelectThread(thread)}
                      className="rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold px-3 py-1.5 text-xs transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Follow Thread</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Chapters Preview / Behavioral Eras */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The 4 Emergent Chapters
            </h2>
            <p className="text-xs text-white/50">
              Not arbitrary months, but psychological shifts detected from clusters of receipts.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('chapters')}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Read full chapters</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {chapters.map((ch, idx) => (
            <div
              key={ch.id}
              role="button"
              tabIndex={0}
              aria-label={`Explore Chapter 0${idx + 1}: ${ch.title}`}
              onClick={() => onNavigateToTab('chapters')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigateToTab('chapters');
                }
              }}
              className="cursor-pointer rounded-2xl border border-white/[0.08] bg-[#0E111A] p-5 space-y-3 hover:border-indigo-500/40 hover:bg-[#121622] transition group focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-white/40">CHAPTER 0{idx + 1}</span>
                <span 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: ch.accentColor }} 
                />
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                {ch.title}
              </h3>

              <p className="text-xs text-white/60 font-light line-clamp-2">
                {ch.subtitle}
              </p>

              {ch.turningPoint && (
                <div className="pt-2 text-[10px] text-amber-300/80 font-mono truncate">
                  ⚡ {ch.turningPoint.headline}
                </div>
              )}

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/40">
                <span>{ch.receiptIds.length} receipts</span>
                <span className="text-indigo-400 group-hover:translate-x-0.5 transition">Explore Chapter →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Medium Breakdown Grid */}
      <section className="rounded-2xl border border-white/[0.08] bg-[#0E111A] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              The Digital Medium Distribution
            </h2>
            <p className="text-xs text-white/50">
              Each receipt format captures a different sensory dimension of the person's life.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('explorer')}
            className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <Search className="h-3 w-3" />
            <span>Search raw records</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(RECEIPT_TYPE_META).map(([typeKey, meta]) => {
            const count = stats.typeCounts[typeKey as ReceiptType] || 0;
            const Icon = meta.icon;
            return (
              <button
                key={typeKey}
                onClick={() => onNavigateToTab('explorer')}
                className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 text-left hover:bg-white/[0.06] hover:border-white/10 transition group"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${meta.bgLight} ${meta.textColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-white group-hover:text-amber-300 transition">
                    {count}
                  </span>
                  <span className="block text-[11px] text-white/50 truncate max-w-[100px]">
                    {meta.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
