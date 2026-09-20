import React, { useState, useEffect, useMemo } from 'react';
import { Receipt } from '../types';
import { traceDiscoveryChain } from '../engine/relationshipEngine';
import { RECEIPT_TYPE_META, formatTimestamp } from '../utils/receiptHelpers';
import { 
  Sparkles, 
  ArrowDown, 
  RefreshCw, 
  CheckCircle2, 
  MapPin, 
  Zap,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConnectTheDotsProps {
  receipts: Receipt[];
  seedReceiptId?: string;
  onSelectReceipt: (receipt: Receipt) => void;
}

export const ConnectTheDots: React.FC<ConnectTheDotsProps> = ({
  receipts,
  seedReceiptId,
  onSelectReceipt,
}) => {
  const defaultSeed = seedReceiptId || receipts[0]?.id || 'rcpt-046';
  const [selectedSeedId, setSelectedSeedId] = useState<string>(defaultSeed);
  const [revealedCount, setRevealedCount] = useState<number>(1);

  // When seedReceiptId changes from props
  useEffect(() => {
    if (seedReceiptId) {
      setSelectedSeedId(seedReceiptId);
      setRevealedCount(1);
    }
  }, [seedReceiptId]);

  // Fallback to first receipt if current seed not found in receipts
  useEffect(() => {
    if (receipts.length > 0 && !receipts.some((r) => r.id === selectedSeedId)) {
      setSelectedSeedId(receipts[0].id);
      setRevealedCount(1);
    }
  }, [receipts, selectedSeedId]);

  // Compute chain from relationship engine
  const discovery = useMemo(() => {
    return traceDiscoveryChain(selectedSeedId, receipts, 5);
  }, [selectedSeedId, receipts]);

  const { chain, transitions, story, timespanMinutes } = discovery;

  // Trigger celebratory confetti when entire chain is revealed
  useEffect(() => {
    if (revealedCount >= chain.length && chain.length > 1) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#818CF8', '#EC4899', '#34D399'],
        });
      } catch {
        // silent fail if canvas not ready
      }
    }
  }, [revealedCount, chain.length]);

  const handleRevealNext = () => {
    if (revealedCount < chain.length) {
      setRevealedCount((prev) => prev + 1);
    }
  };

  const handleRevealAll = () => {
    setRevealedCount(chain.length);
  };

  const handleReset = () => {
    setRevealedCount(1);
  };

  const pickRandomSeed = () => {
    if (receipts.length === 0) return;
    const random = receipts[Math.floor(Math.random() * receipts.length)];
    setSelectedSeedId(random.id);
    setRevealedCount(1);
  };

  if (receipts.length === 0) {
    return (
      <div 
        role="status"
        className="mx-auto max-w-xl my-16 rounded-3xl border border-white/[0.08] bg-[#0E111A] p-8 text-center space-y-4"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-white">No Receipts to Connect</h3>
        <p className="text-xs text-white/60 font-light">
          Upload or select a dataset to trace step-by-step discovery threads.
        </p>
      </div>
    );
  }

  return (
    <section 
      aria-label="Connect the Dots Discovery Engine"
      className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-10"
    >
      {/* Editorial Header */}
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3.5 py-1 text-xs font-mono text-pink-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>CONNECT THE DOTS • DISCOVERY MODE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
          One Seed. An Entire Chain Revealed.
        </h1>
        <p className="text-sm text-white/60 font-light leading-relaxed">
          Select any single digital receipt. The relationship engine follows the breadcrumbs step-by-step, discovering how disparate actions were secretly woven together.
        </p>
      </div>

      {/* Screen Reader Live Status */}
      <div className="sr-only" aria-live="polite">
        Showing {revealedCount} of {chain.length} connected moments in the discovery thread.
      </div>

      {/* Seed Selector & Quick Sparks */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-[#0E111A] p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <label htmlFor="seed-anchor-select" className="text-xs font-mono uppercase tracking-wider text-white/50">
            Seed Anchor:
          </label>
          <select
            id="seed-anchor-select"
            value={selectedSeedId}
            onChange={(e) => {
              setSelectedSeedId(e.target.value);
              setRevealedCount(1);
            }}
            aria-label="Choose starting seed receipt"
            className="rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 max-w-xs truncate"
          >
            {receipts.map((r) => (
              <option key={r.id} value={r.id} className="bg-[#0E111A] text-white">
                [{r.type.toUpperCase()}] {r.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={pickRandomSeed}
            aria-label="Pick a random seed receipt"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/[0.08] hover:text-white transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
            <span>Random Spark</span>
          </button>

          {revealedCount < chain.length && (
            <button
              onClick={handleRevealAll}
              aria-label="Reveal all connected moments"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/[0.08] hover:text-white transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <span>Reveal All</span>
            </button>
          )}

          {revealedCount < chain.length ? (
            <button
              onClick={handleRevealNext}
              aria-label={`Reveal next moment: step ${revealedCount + 1} of ${chain.length}`}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black px-4 py-2 text-xs font-bold transition shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <span>Reveal Next Dot ({revealedCount}/{chain.length})</span>
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleReset}
              aria-label="Restart discovery chain"
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white px-3 py-2 text-xs font-medium transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <RotateCcw className="h-3.5 w-3.5 text-white/60" />
              <span>Restart Discovery</span>
            </button>
          )}
        </div>
      </div>

      {/* Discovery Chain Progression */}
      <div className="space-y-6">
        <div 
          role="list"
          aria-label="Discovery sequence of connected moments"
          className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-indigo-400 before:to-pink-500"
        >
          {chain.slice(0, revealedCount).map((rcpt, idx) => {
            const meta = RECEIPT_TYPE_META[rcpt.type];
            const Icon = meta.icon;
            const { date, time } = formatTimestamp(rcpt.timestamp);
            const transition = idx > 0 ? transitions[idx - 1] : null;

            return (
              <div 
                key={rcpt.id} 
                role="listitem"
                className="relative space-y-3"
              >
                {/* Node indicator on vertical line */}
                <div 
                  aria-hidden="true"
                  className="absolute -left-6 sm:-left-10 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-amber-400 text-black shadow-md font-mono text-[10px] font-bold"
                >
                  {idx + 1}
                </div>

                {/* Transition Link Badge */}
                {transition && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs text-amber-200/90 inline-flex items-center gap-2 max-w-full">
                    <Zap className="h-3 w-3 text-amber-400 shrink-0" />
                    <span className="font-mono text-[11px]">
                      {transition.reasons[0]?.label || 'Connected'} — {transition.reasons[0]?.description}
                    </span>
                  </div>
                )}

                {/* Receipt Card */}
                <article
                  role="button"
                  tabIndex={0}
                  aria-label={`Step ${idx + 1}: ${rcpt.title} (${rcpt.type}). Click to inspect full receipt.`}
                  onClick={() => onSelectReceipt(rcpt)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectReceipt(rcpt);
                    }
                  }}
                  className="group cursor-pointer rounded-2xl border border-white/[0.08] bg-[#0E111A] p-5 sm:p-6 transition hover:border-amber-400/60 hover:bg-[#121622] space-y-3 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${meta.bgLight} ${meta.textColor}`}>
                      <Icon className="h-3.5 w-3.5" />
                      <span>{meta.label}</span>
                    </span>

                    <time dateTime={rcpt.timestamp} className="font-mono text-xs text-white/50">
                      {date} • {time}
                    </time>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition">
                      {rcpt.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/60 font-light mt-0.5">
                      {rcpt.subtitle}
                    </p>
                  </div>

                  {Boolean(rcpt.metadata.description) && (
                    <blockquote className="text-xs italic text-white/70 bg-white/[0.02] border-l-2 border-amber-400/50 pl-3 py-1">
                      &ldquo;{String(rcpt.metadata.description)}&rdquo;
                    </blockquote>
                  )}

                  <div className="flex flex-wrap items-center justify-between text-xs text-white/40 pt-2 border-t border-white/[0.04] gap-2">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{rcpt.location?.name || rcpt.location?.city || 'Digital'}</span>
                    </span>
                    <span className="text-amber-400 group-hover:translate-x-1 transition text-[11px] font-medium">
                      Inspect receipt details →
                    </span>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {/* Next Step Prompt or Final Synthesis */}
        {revealedCount < chain.length ? (
          <div className="text-center py-6">
            <button
              onClick={handleRevealNext}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 px-6 py-3 text-sm font-bold text-black hover:opacity-90 transition shadow-lg shadow-amber-500/20 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <Sparkles className="h-4 w-4" />
              <span>Reveal Next Connected Moment ({revealedCount + 1} of {chain.length})</span>
            </button>
            <p className="text-xs text-white/40 mt-2 font-light">
              Or click &ldquo;Reveal All&rdquo; in the top bar to see the whole tapestry immediately.
            </p>
          </div>
        ) : (
          /* Final Emergent Micro-Story Box */
          <div 
            role="region"
            aria-label="Emergent thread story synthesis"
            className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/[0.08] to-transparent p-6 sm:p-8 space-y-4 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-amber-300">
              <CheckCircle2 className="h-5 w-5 text-amber-400" />
              <span className="font-mono text-xs font-bold uppercase tracking-widest">
                Thread Complete • Emergent Micro-Story
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif text-white">
              &ldquo;{story}&rdquo;
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/[0.08]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-white/40 uppercase">Total Timespan</span>
                <p className="text-sm font-mono font-semibold text-white">
                  {timespanMinutes < 60
                    ? `${timespanMinutes} minutes`
                    : `${(timespanMinutes / 60).toFixed(1)} hours`}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-white/40 uppercase">Unique Domains Crossed</span>
                <p className="text-sm font-mono font-semibold text-amber-300">
                  {Array.from(new Set(chain.map((r) => r.type))).join(' • ')}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-white/60 leading-relaxed font-light">
                Notice how the person never stopped to document &ldquo;a life event.&rdquo; The song, the late search query, the physical purchase, and the quick note were individual, casual gestures. It is only when connected in sequence that their emotional gravity becomes undeniable.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
