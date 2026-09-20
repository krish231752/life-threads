import React, { useState, useMemo } from 'react';
import { Receipt, ReceiptType, Chapter } from '../types';
import { RECEIPT_TYPE_META } from '../utils/receiptHelpers';
import { ReceiptCard } from './explorer/ReceiptCard';
import { 
  Search, 
  MapPin, 
  ArrowUpDown,
  X,
  FileQuestion,
  RotateCcw
} from 'lucide-react';

interface ReceiptExplorerProps {
  receipts: Receipt[];
  chapters: Chapter[];
  onSelectReceipt: (receipt: Receipt) => void;
  onExploreThreadForReceipt: (receiptId: string) => void;
}

export const ReceiptExplorer: React.FC<ReceiptExplorerProps> = ({
  receipts,
  chapters,
  onSelectReceipt,
  onExploreThreadForReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ReceiptType | 'all'>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Available cities in dataset
  const cities = useMemo(() => {
    const set = new Set<string>();
    receipts.forEach((r) => {
      if (r.location?.city) set.add(r.location.city);
    });
    return Array.from(set);
  }, [receipts]);

  // Filter and search with memoization
  const filteredReceipts = useMemo(() => {
    return receipts
      .filter((r) => {
        // Search term matching
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchSub = r.subtitle.toLowerCase().includes(q);
          const matchDesc = (r.description || '').toLowerCase().includes(q);
          const matchTags = r.tags.some((t) => t.toLowerCase().includes(q));
          const matchLoc = (r.location?.name || '').toLowerCase().includes(q);
          if (!matchTitle && !matchSub && !matchDesc && !matchTags && !matchLoc) {
            return false;
          }
        }

        // Type filter
        if (selectedType !== 'all' && r.type !== selectedType) {
          return false;
        }

        // City filter
        if (selectedCity !== 'all' && r.location?.city !== selectedCity) {
          return false;
        }

        // Chapter filter
        if (selectedChapterId !== 'all') {
          const targetChapter = chapters.find((c) => c.id === selectedChapterId);
          if (targetChapter && !targetChapter.receiptIds.includes(r.id)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const tA = new Date(a.timestamp).getTime();
        const tB = new Date(b.timestamp).getTime();
        return sortBy === 'newest' ? tB - tA : tA - tB;
      });
  }, [receipts, searchQuery, selectedType, selectedCity, selectedChapterId, sortBy, chapters]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedCity('all');
    setSelectedChapterId('all');
    setSortBy('newest');
  };

  const hasActiveFilters = searchQuery !== '' || selectedType !== 'all' || selectedCity !== 'all' || selectedChapterId !== 'all';

  return (
    <section 
      aria-label="Digital Receipt Archive"
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8"
    >
      {/* Title & Search Bar */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-0.5 text-xs font-mono text-cyan-300">
          <Search className="h-3 w-3" />
          <span>DIGITAL ARTIFACT ARCHIVE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-tight">
          Receipt Explorer
        </h1>
        <p className="text-sm text-white/60 font-light leading-relaxed">
          Search your life. Every track, taxi stub, late-night search, and quiet photo preserved as an authentic digital fragment.
        </p>
      </div>

      {/* Control Bar: Search Input & Dropdowns */}
      <div className="space-y-4 rounded-3xl border border-white/[0.08] bg-[#0E111A] p-5 sm:p-6">
        {/* Search Field */}
        <div className="relative">
          <label htmlFor="receipt-search-input" className="sr-only">
            Search life receipts
          </label>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            id="receipt-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your life... (e.g. Elsewhere, Devoción, Nils Frahm, JetBlue, modular, tacos)"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-11 pr-10 text-sm text-white placeholder-white/40 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Medium Type Filter Tabs */}
        <div 
          role="radiogroup" 
          aria-label="Filter by receipt medium"
          className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/[0.04]"
        >
          <button
            role="radio"
            aria-checked={selectedType === 'all'}
            onClick={() => setSelectedType('all')}
            className={`rounded-xl px-3 py-1.5 text-xs font-medium border transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
              selectedType === 'all'
                ? 'bg-amber-400 text-black border-amber-400 font-bold shadow-sm'
                : 'bg-white/[0.02] text-white/60 border-white/[0.06] hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            All Mediums ({receipts.length})
          </button>
          {Object.entries(RECEIPT_TYPE_META).map(([typeKey, meta]) => {
            const count = receipts.filter((r) => r.type === typeKey).length;
            const isSelected = selectedType === typeKey;
            const Icon = meta.icon;
            return (
              <button
                key={typeKey}
                role="radio"
                aria-checked={isSelected}
                onClick={() => setSelectedType(typeKey as ReceiptType)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium border transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none ${
                  isSelected
                    ? `${meta.bgLight} ${meta.textColor} ${meta.borderColor} font-bold`
                    : 'bg-white/[0.02] text-white/60 border-white/[0.06] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{meta.label}</span>
                <span className="font-mono text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filters: City, Chapter, Sort Order */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04] text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* City */}
            <div className="flex items-center gap-1.5 text-white/50">
              <MapPin className="h-3.5 w-3.5" />
              <label htmlFor="city-filter-select" className="sr-only">Location Filter</label>
              <span>Location:</span>
              <select
                id="city-filter-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label="Filter receipts by city"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="all" className="bg-[#0E111A]">All Cities</option>
                {cities.map((city) => (
                  <option key={city} value={city} className="bg-[#0E111A]">{city}</option>
                ))}
              </select>
            </div>

            {/* Chapter */}
            <div className="flex items-center gap-1.5 text-white/50">
              <label htmlFor="chapter-filter-select" className="sr-only">Chapter Filter</label>
              <span>Chapter:</span>
              <select
                id="chapter-filter-select"
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value)}
                aria-label="Filter receipts by narrative chapter"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-amber-400 max-w-[160px] truncate"
              >
                <option value="all" className="bg-[#0E111A]">All Chapters</option>
                {chapters.map((ch) => (
                  <option key={ch.id} value={ch.id} className="bg-[#0E111A]">{ch.title}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono text-[11px] underline"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Sort order toggle */}
          <div className="flex items-center gap-2">
            <span className="text-white/40">Sort:</span>
            <button
              onClick={() => setSortBy((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              aria-label={`Sort order: currently ${sortBy === 'newest' ? 'Newest First' : 'Oldest First'}. Click to toggle.`}
              className="flex items-center gap-1 text-white/80 hover:text-white rounded-lg px-2 py-1 bg-white/[0.04] border border-white/[0.08] focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <ArrowUpDown className="h-3 w-3 text-amber-400" />
              <span>{sortBy === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-white/40 font-mono">
        <span>Found {filteredReceipts.length} Matching Fragments</span>
        <span>Click any receipt to open thread</span>
      </div>

      {/* Receipts Card Grid or Empty State */}
      {filteredReceipts.length === 0 ? (
        <div 
          role="status"
          className="rounded-3xl border border-white/[0.08] bg-[#0E111A] p-12 text-center space-y-4 max-w-xl mx-auto"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/10 text-white/40">
            <FileQuestion className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Receipts Match Your Search</h3>
            <p className="text-xs text-white/60 font-light">
              No digital fragments matched your current query or medium filters. Try broadening your search or resetting active filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black px-4 py-2 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      ) : (
        <div 
          role="region" 
          aria-label="Receipt collection cards"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredReceipts.map((rcpt) => (
            <ReceiptCard
              key={rcpt.id}
              receipt={rcpt}
              onSelect={onSelectReceipt}
              onExploreThread={onExploreThreadForReceipt}
            />
          ))}
        </div>
      )}
    </section>
  );
};
