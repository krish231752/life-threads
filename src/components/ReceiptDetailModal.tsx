import React, { useEffect, useRef } from 'react';
import { Receipt } from '../types';
import { RECEIPT_TYPE_META, formatTimestamp } from '../utils/receiptHelpers';
import { getConnectionsForReceipt } from '../engine/relationshipEngine';
import { 
  X, 
  MapPin, 
  Clock, 
  Calendar, 
  GitFork, 
  Sparkles, 
  Tag, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface ReceiptDetailModalProps {
  receipt: Receipt | null;
  allReceipts: Receipt[];
  onClose: () => void;
  onNavigateToThreads: (receiptId: string) => void;
  onLaunchConnectDots: (receiptId: string) => void;
  onSelectConnectedReceipt: (receipt: Receipt) => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  receipt,
  allReceipts,
  onClose,
  onNavigateToThreads,
  onLaunchConnectDots,
  onSelectConnectedReceipt,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!receipt) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [receipt, onClose]);

  if (!receipt) return null;

  const meta = RECEIPT_TYPE_META[receipt.type];
  const Icon = meta.icon;
  const { date, time } = formatTimestamp(receipt.timestamp);

  // Compute connections
  const connections = getConnectionsForReceipt(receipt.id, allReceipts, 0.25, 4);

  // Find chronological neighbors (1 before, 1 after)
  const sorted = [...allReceipts].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const currentIdx = sorted.findIndex((r) => r.id === receipt.id);
  const prevReceipt = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const nextReceipt = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-modal-title"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0E111A] p-6 sm:p-8 shadow-2xl space-y-6 my-8 focus:outline-none"
        tabIndex={-1}
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close details"
          className="absolute top-5 right-5 rounded-full bg-white/[0.06] p-2 text-white/60 hover:bg-white/[0.12] hover:text-white transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 pr-10">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${meta.bgLight} ${meta.textColor} border ${meta.borderColor}`}>
            <Icon className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-semibold ${meta.bgLight} ${meta.textColor}`}>
                {meta.label}
              </span>
              <span className="font-mono text-xs text-white/40">
                {date} • {time}
              </span>
            </div>

            <h2 id="receipt-modal-title" className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {receipt.title}
            </h2>

            <p className="text-sm text-white/60 font-light">
              {receipt.subtitle}
            </p>
          </div>
        </div>

        {/* Metadata Details Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {receipt.location && (
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase">Location</span>
                <p className="font-medium text-white flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-amber-400" />
                  {receipt.location.name} ({receipt.location.city})
                </p>
              </div>
            )}

            {receipt.metadata.amount && (
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase">Amount</span>
                <p className="font-mono font-bold text-amber-300 mt-0.5">
                  ${receipt.metadata.amount.toFixed(2)} {receipt.metadata.currency}
                </p>
              </div>
            )}

            {receipt.metadata.merchant && (
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase">Merchant</span>
                <p className="font-medium text-white mt-0.5">{receipt.metadata.merchant}</p>
              </div>
            )}

            {receipt.metadata.artist && (
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase">Artist / Album</span>
                <p className="font-medium text-white mt-0.5">{receipt.metadata.artist} — {receipt.metadata.album}</p>
              </div>
            )}

            {receipt.metadata.bpm && (
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase">Tempo / Mood</span>
                <p className="font-medium text-white mt-0.5">{receipt.metadata.bpm} BPM • {receipt.metadata.mood}</p>
              </div>
            )}

            {receipt.metadata.recipient && (
              <div>
                <span className="text-[10px] font-mono text-white/40 uppercase">Message Recipient</span>
                <p className="font-medium text-white mt-0.5">{receipt.metadata.recipient}</p>
              </div>
            )}

            {receipt.metadata.query && (
              <div className="col-span-2">
                <span className="text-[10px] font-mono text-white/40 uppercase">Search Query</span>
                <p className="font-mono text-rose-300 mt-0.5">"{receipt.metadata.query}"</p>
              </div>
            )}
          </div>

          {Boolean(receipt.metadata.description) && (
            <div className="pt-2 border-t border-white/[0.04]">
              <span className="text-[10px] font-mono text-white/40 uppercase">Recorded Content</span>
              <p className="text-xs italic text-white/80 mt-1 leading-relaxed bg-black/30 p-3 rounded-xl border border-white/[0.04]">
                "{String(receipt.metadata.description)}"
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.04]">
            <span className="text-[10px] font-mono text-white/40 uppercase mr-1">Tags:</span>
            {receipt.tags.map((t) => (
              <span key={t} className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-white/60">
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Temporal Sequence Context (Before & After) */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-white/40">
            Chronological Sequence (What happened around this moment)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {prevReceipt ? (
              <div
                onClick={() => onSelectConnectedReceipt(prevReceipt)}
                className="cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:bg-white/[0.05] transition"
              >
                <span className="text-[10px] text-white/40 font-mono">← Directly Preceding</span>
                <p className="font-semibold text-white truncate mt-0.5">{prevReceipt.title}</p>
                <p className="text-[10px] text-white/50">{formatTimestamp(prevReceipt.timestamp).time}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 text-white/30 text-[11px]">
                (First moment in archive)
              </div>
            )}

            {nextReceipt ? (
              <div
                onClick={() => onSelectConnectedReceipt(nextReceipt)}
                className="cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:bg-white/[0.05] transition text-right"
              >
                <span className="text-[10px] text-white/40 font-mono">Directly Following →</span>
                <p className="font-semibold text-white truncate mt-0.5">{nextReceipt.title}</p>
                <p className="text-[10px] text-white/50">{formatTimestamp(nextReceipt.timestamp).time}</p>
              </div>
            ) : (
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-3 text-white/30 text-[11px] text-right">
                (Last moment in archive)
              </div>
            )}
          </div>
        </div>

        {/* Top Connected Receipts from Relationship Engine */}
        <div className="space-y-3 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
              Discovered Relationship Threads ({connections.length})
            </span>
            <span className="text-[11px] text-white/40">Click to explore neighbor</span>
          </div>

          <div className="space-y-2">
            {connections.map((conn) => {
              const cMeta = RECEIPT_TYPE_META[conn.receipt.type];
              const CIcon = cMeta.icon;

              return (
                <div
                  key={conn.targetId}
                  onClick={() => onSelectConnectedReceipt(conn.receipt)}
                  className="group cursor-pointer rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 hover:border-amber-400/50 hover:bg-white/[0.04] transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cMeta.bgLight} ${cMeta.textColor}`}>
                      <CIcon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition truncate">
                        {conn.receipt.title}
                      </h4>
                      <p className="text-[11px] text-white/50 truncate font-light">
                        {conn.reasons[0]?.description || conn.receipt.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono text-xs font-bold text-amber-300 shrink-0">
                    {Math.round(conn.score * 100)}% Match
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-white/[0.06]">
          <button
            onClick={() => onNavigateToThreads(receipt.id)}
            className="flex-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold py-3 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <GitFork className="h-3.5 w-3.5" />
            <span>Launch in Relationship Graph</span>
          </button>

          <button
            onClick={() => onLaunchConnectDots(receipt.id)}
            className="flex-1 rounded-xl border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white text-xs font-medium py-3 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-pink-400" />
            <span>Trace In Connect The Dots</span>
          </button>
        </div>
      </div>
    </div>
  );
};
