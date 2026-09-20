import React, { useState, useMemo, useEffect } from 'react';
import { Receipt, ThreadStory } from '../types';
import { getConnectionsForReceipt } from '../engine/relationshipEngine';
import { RECEIPT_TYPE_META, formatTimestamp } from '../utils/receiptHelpers';
import { 
  GitFork, 
  Sparkles, 
  ExternalLink,
  Zap,
  List,
  Eye,
  AlertCircle
} from 'lucide-react';

interface TheThreadsProps {
  receipts: Receipt[];
  curatedThreads: ThreadStory[];
  onSelectReceipt: (receipt: Receipt) => void;
  onLaunchDiscoveryChain: (seedReceiptId: string) => void;
  selectedReceiptId?: string;
}

export const TheThreads: React.FC<TheThreadsProps> = ({
  receipts,
  curatedThreads,
  onSelectReceipt,
  onLaunchDiscoveryChain,
  selectedReceiptId,
}) => {
  const defaultLeadId = selectedReceiptId || receipts[0]?.id || 'rcpt-046';
  const [activeCenterId, setActiveCenterId] = useState<string>(defaultLeadId);
  const [selectedConnectionIndex, setSelectedConnectionIndex] = useState<number>(0);
  const [showAccessibleList, setShowAccessibleList] = useState<boolean>(false);

  // Synchronize when selectedReceiptId prop changes
  useEffect(() => {
    if (selectedReceiptId) {
      setActiveCenterId(selectedReceiptId);
      setSelectedConnectionIndex(0);
    }
  }, [selectedReceiptId]);

  // Fallback to first receipt if current center was removed
  useEffect(() => {
    if (receipts.length > 0 && !receipts.some((r) => r.id === activeCenterId)) {
      setActiveCenterId(receipts[0].id);
      setSelectedConnectionIndex(0);
    }
  }, [receipts, activeCenterId]);

  const centerReceipt = useMemo(() => {
    return receipts.find((r) => r.id === activeCenterId) || receipts[0];
  }, [activeCenterId, receipts]);

  // Compute connections in real-time
  const connections = useMemo(() => {
    if (!centerReceipt) return [];
    return getConnectionsForReceipt(centerReceipt.id, receipts, 0.20, 8);
  }, [centerReceipt, receipts]);

  const activeConnection = connections[selectedConnectionIndex] || connections[0];

  const centerMeta = centerReceipt ? RECEIPT_TYPE_META[centerReceipt.type] : null;
  const CenterIcon = centerMeta?.icon;

  if (receipts.length === 0) {
    return (
      <div className="mx-auto max-w-xl my-16 rounded-3xl border border-white/[0.08] bg-[#0E111A] p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-white">No Moments Found</h3>
        <p className="text-xs text-white/60 font-light">
          Please upload or select a dataset to analyze relationship threads.
        </p>
      </div>
    );
  }

  return (
    <section 
      aria-label="Relationship Threads Explorer"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10"
    >
      {/* Title & Core Concept */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-mono text-amber-300">
            <GitFork className="h-3 w-3" />
            <span>INTERACTIVE MULTI-MODAL RELATIONSHIP GRAPH</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
            Follow The Threads
          </h1>
          <p className="text-sm text-white/60 font-light leading-relaxed">
            Click any node in the constellation to re-center the web around that moment. Every thread shows the explicit signals that link seemingly unrelated digital fragments.
          </p>
        </div>

        {/* View Toggle: Visual Constellation vs Screen-Reader Friendly Table */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAccessibleList((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/[0.08] transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            aria-pressed={showAccessibleList}
            aria-label="Toggle accessible list view of graph connections"
          >
            {showAccessibleList ? <Eye className="h-3.5 w-3.5 text-amber-400" /> : <List className="h-3.5 w-3.5 text-amber-400" />}
            <span>{showAccessibleList ? 'Visual Graph View' : 'Accessible List View'}</span>
          </button>
        </div>
      </div>

      {/* Curated Anchor Threads Bar */}
      {curatedThreads.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1" role="toolbar" aria-label="Curated Threads quick-jump">
          <span className="text-xs font-mono text-white/40 uppercase tracking-wider mr-1">Curated Threads:</span>
          {curatedThreads.map((th) => (
            <button
              key={th.id}
              onClick={() => {
                setActiveCenterId(th.leadReceiptId);
                setSelectedConnectionIndex(0);
              }}
              aria-label={`Jump to curated thread: ${th.title}`}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium border transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                activeCenterId === th.leadReceiptId
                  ? 'bg-amber-500/20 border-amber-400/80 text-amber-300'
                  : 'bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              {th.title}
            </button>
          ))}
        </div>
      )}

      {/* Screen Reader Invisible Table for Total Accessibility */}
      <div className="sr-only" aria-live="polite">
        <h2>Graph Relationship Data for {centerReceipt?.title}</h2>
        <p>Type: {centerMeta?.label}, Time: {centerReceipt ? formatTimestamp(centerReceipt.timestamp).relative : ''}</p>
        <ol>
          {connections.map((c, i) => (
            <li key={c.targetId}>
              {i + 1}. {c.receipt.type.toUpperCase()} — {c.receipt.title} at {formatTimestamp(c.receipt.timestamp).relative}.
              Match score: {Math.round(c.score * 100)}%. Primary reason: {c.reasons[0]?.description || 'Associated event'}.
            </li>
          ))}
        </ol>
      </div>

      {/* Accessible List View or Visual Constellation */}
      {showAccessibleList ? (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0A0D14] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-base font-bold text-white">
              Accessible Connection Table for: <span className="text-amber-300">{centerReceipt?.title}</span>
            </h3>
            <span className="text-xs font-mono text-white/50">{connections.length} Connected Moments</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white/70">
              <thead>
                <tr className="border-b border-white/10 text-white/40 font-mono">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Correlation</th>
                  <th className="py-2.5 px-3">Primary Evidence</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {connections.map((conn, idx) => (
                  <tr key={conn.targetId} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 capitalize font-mono text-amber-300">{conn.receipt.type}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{conn.receipt.title}</td>
                    <td className="py-2.5 px-3 text-white/50">{formatTimestamp(conn.receipt.timestamp).time}</td>
                    <td className="py-2.5 px-3 font-mono text-amber-400">{Math.round(conn.score * 100)}%</td>
                    <td className="py-2.5 px-3 text-white/60">{conn.reasons[0]?.label}: {conn.reasons[0]?.description}</td>
                    <td className="py-2.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setActiveCenterId(conn.receipt.id);
                          setSelectedConnectionIndex(0);
                        }}
                        className="text-amber-400 hover:underline font-mono text-[11px]"
                      >
                        Pivot Center
                      </button>
                      <button
                        onClick={() => onSelectReceipt(conn.receipt)}
                        className="text-white/60 hover:text-white underline text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Main Interactive Graph & Evidence Deck */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Radial Constellation Web Visualizer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-3xl border border-white/[0.08] bg-[#0A0D14] p-6 sm:p-10 relative overflow-hidden min-h-[540px]">
            {/* Background constellation ambient glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06)_0,transparent_70%)] pointer-events-none" />

            {/* Central Anchor Node */}
            {centerReceipt && CenterIcon && (
              <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
                <div className="relative group">
                  <div className="absolute -inset-2 rounded-2xl bg-amber-500/20 blur-lg animate-pulse" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-amber-400 bg-[#161B26] text-amber-300 shadow-2xl">
                    <CenterIcon className="h-8 w-8" />
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-0.5 font-mono text-[10px] text-amber-300 border border-amber-400/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>Focal Anchor • {centerMeta?.label}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {centerReceipt.title}
                  </h3>
                  <p className="text-xs text-white/50 font-light">
                    {formatTimestamp(centerReceipt.timestamp).relative} • {centerReceipt.location?.name || centerReceipt.location?.city || 'Digital'}
                  </p>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => onSelectReceipt(centerReceipt)}
                    aria-label={`Inspect details for ${centerReceipt.title}`}
                    className="rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 px-3 py-1 text-xs text-white/80 transition flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                  >
                    <span>Inspect Receipt</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => onLaunchDiscoveryChain(centerReceipt.id)}
                    aria-label={`Trace full chain starting from ${centerReceipt.title}`}
                    className="rounded-lg bg-amber-400 text-black font-medium hover:bg-amber-300 px-3 py-1 text-xs transition flex items-center gap-1 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Trace Full Chain</span>
                  </button>
                </div>
              </div>
            )}

            {/* Radiating Connected Nodes */}
            <div className="w-full mt-10 space-y-3">
              <div className="flex items-center justify-between text-xs text-white/40 font-mono uppercase tracking-wider px-1">
                <span>Connected Moments ({connections.length} discovered)</span>
                <span>Click node to inspect signal</span>
              </div>

              {connections.length === 0 ? (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-center text-white/40 text-xs">
                  This moment has no strong connections yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Discovered connection nodes">
                  {connections.map((conn, idx) => {
                    const isSelected = idx === selectedConnectionIndex;
                    const meta = RECEIPT_TYPE_META[conn.receipt.type];
                    const Icon = meta.icon;
                    const { time } = formatTimestamp(conn.receipt.timestamp);

                    return (
                      <button
                        key={conn.targetId}
                        onClick={() => setSelectedConnectionIndex(idx)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedConnectionIndex(idx);
                          }
                        }}
                        aria-pressed={isSelected}
                        aria-label={`Select connection: ${conn.receipt.title}, ${Math.round(conn.score * 100)}% match`}
                        className={`relative flex items-start gap-3 rounded-xl p-3.5 text-left transition border focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                          isSelected
                            ? 'border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.bgLight} ${meta.textColor} border ${meta.borderColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-white/40 uppercase tracking-tight">
                              {meta.label} • {time}
                            </span>
                            <span className="font-mono text-[10px] font-bold text-amber-300">
                              {Math.round(conn.score * 100)}% Match
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-white truncate">
                            {conn.receipt.title}
                          </h4>

                          <p className="text-[11px] text-white/50 truncate font-light">
                            {conn.reasons[0]?.description || conn.receipt.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-6 text-center text-xs text-white/40 font-light">
              Tip: Click <strong className="text-white/70">"Make this the focal node"</strong> in the right panel to pivot the graph to that moment.
            </div>
          </div>

          {/* Right Column: Connection Evidence & Signal Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {activeConnection ? (
              <div className="rounded-3xl border border-white/[0.08] bg-[#0E111A] p-6 sm:p-7 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.06]">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
                      Active Connection Analysis
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      Why These Two Moments Connect
                    </h3>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-xl font-mono font-bold text-amber-300">
                      {Math.round(activeConnection.score * 100)}%
                    </span>
                    <span className="text-[10px] text-white/40 uppercase font-mono">Correlation</span>
                  </div>
                </div>

                {/* Pair Cards */}
                <div className="space-y-2">
                  {/* Center Node */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 space-y-1">
                    <span className="font-mono text-[10px] text-white/40 uppercase">Node A (Focal Center)</span>
                    <p className="text-xs font-semibold text-white">{centerReceipt.title}</p>
                    <p className="text-[11px] text-white/50">{formatTimestamp(centerReceipt.timestamp).relative}</p>
                  </div>

                  <div className="flex justify-center text-amber-400">
                    <span className="font-mono text-xs">↕ Linked By {activeConnection.reasons.length} Evidence Signals ↕</span>
                  </div>

                  {/* Target Node */}
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-3 space-y-1">
                    <span className="font-mono text-[10px] text-amber-400/80 uppercase">Node B (Connected)</span>
                    <p className="text-xs font-semibold text-amber-200">{activeConnection.receipt.title}</p>
                    <p className="text-[11px] text-white/50">{formatTimestamp(activeConnection.receipt.timestamp).relative}</p>
                  </div>
                </div>

                {/* Explanatory Relationship Signals */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-white/50">
                      Documented Evidence Signals:
                    </h4>
                    <span className="text-[10px] font-mono text-white/40">
                      {activeConnection.reasons.filter((r) => r.evidenceClass === 'observed').length} Observed • {activeConnection.reasons.filter((r) => r.evidenceClass === 'inferred').length} Inferred
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activeConnection.reasons.map((reason, rIdx) => {
                      const badgeColors = {
                        temporal: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
                        spatial: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
                        semantic: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
                        behavioral: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
                        sequential: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
                      };

                      const isObserved = reason.evidenceClass === 'observed' || (['spatial', 'temporal'].includes(reason.type) && reason.weight > 0.85);

                      return (
                        <div
                          key={rIdx}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider ${
                                  isObserved
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {isObserved ? 'OBSERVED FACT' : 'INFERRED PATTERN'}
                              </span>
                              <span
                                className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-medium uppercase ${
                                  badgeColors[reason.type]
                                }`}
                              >
                                {reason.type}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-white/40">
                              Confidence: {Math.round(reason.weight * 100)}%
                            </span>
                          </div>
                          <h5 className="text-xs font-semibold text-white">
                            {reason.label}
                          </h5>
                          <p className="text-xs text-white/70 font-light leading-relaxed">
                            {reason.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contextual "Why This Matters" Micro-Story */}
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-3.5 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    <span>Why This Matters</span>
                  </span>
                  <p className="text-xs text-white/80 font-light italic leading-relaxed">
                    {activeConnection.reasons.some((r) => r.type === 'sequential')
                      ? 'Captures an immediate transition from ideation to real-world commitment, illustrating that intention and action unfolded as part of the same uninterrupted mental sequence.'
                      : activeConnection.reasons.some((r) => r.type === 'spatial')
                      ? 'Binds disparate digital actions to a single physical sanctuary, demonstrating how emotional focus is anchored by geographic habits.'
                      : 'Reveals the subtle thematic undercurrents tying distinct creative media into a unified life direction.'}
                  </p>
                </div>

                {/* Actions on this Connected Node */}
                <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setActiveCenterId(activeConnection.receipt.id);
                      setSelectedConnectionIndex(0);
                    }}
                    className="w-full rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium py-2.5 transition flex items-center justify-center gap-2 border border-white/20 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span>Pivot Graph: Make Node B the Center</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onLaunchDiscoveryChain(activeConnection.receipt.id)}
                      className="rounded-xl bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs py-2 transition flex items-center justify-center gap-1.5 font-medium focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                    >
                      <Sparkles className="h-3 w-3 text-amber-400" />
                      <span>Trace Chain</span>
                    </button>

                    <button
                      onClick={() => onSelectReceipt(activeConnection.receipt)}
                      className="rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white border border-white/10 text-xs py-2 transition flex items-center justify-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
                    >
                      <span>View Receipt</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/[0.08] bg-[#0E111A] p-8 text-center text-white/50 text-xs">
                Select a connected moment from the graph to inspect relationship signals.
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
