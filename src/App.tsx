import React, { useState, useMemo } from 'react';
import { Header, ActiveTab } from './components/Header';
import { TheLifeOverview } from './components/TheLifeOverview';
import { TheChapters } from './components/TheChapters';
import { TheThreads } from './components/TheThreads';
import { ConnectTheDots } from './components/ConnectTheDots';
import { DigitalJourney } from './components/DigitalJourney';
import { ReceiptExplorer } from './components/ReceiptExplorer';
import { ReceiptDetailModal } from './components/ReceiptDetailModal';
import { DatasetModal } from './components/DatasetModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { ELENA_VANCE_RECEIPTS, MARCUS_RAY_RECEIPTS } from './data/defaultDataset';
import { calculateLifeStats, discoverKeyThreads, clearConnectionCache } from './engine/relationshipEngine';
import { discoverChapters } from './engine/chapterEngine';
import { Receipt, ThreadStory } from './types';

export default function App() {
  const [activePersona, setActivePersona] = useState<'elena' | 'marcus' | 'custom'>('elena');
  const [receipts, setReceipts] = useState<Receipt[]>(ELENA_VANCE_RECEIPTS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modal and focus state
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<Receipt | null>(null);
  const [selectedReceiptForThreads, setSelectedReceiptForThreads] = useState<string | undefined>(undefined);
  const [selectedSeedForConnectDots, setSelectedSeedForConnectDots] = useState<string | undefined>(undefined);
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);

  // Dynamically derive stats, threads, and chapters whenever receipts change
  const stats = useMemo(() => calculateLifeStats(receipts), [receipts]);
  const curatedThreads = useMemo(() => discoverKeyThreads(receipts), [receipts]);
  const chapters = useMemo(() => discoverChapters(receipts), [receipts]);

  // Persona switching
  const handleSelectPersona = (persona: 'elena' | 'marcus') => {
    clearConnectionCache();
    setActivePersona(persona);
    if (persona === 'elena') {
      setReceipts(ELENA_VANCE_RECEIPTS);
    } else {
      setReceipts(MARCUS_RAY_RECEIPTS);
    }
    setActiveTab('overview');
  };

  const handleCustomDatasetLoaded = (newReceipts: Receipt[]) => {
    clearConnectionCache();
    setReceipts(newReceipts);
    setActivePersona('custom');
    setActiveTab('overview');
  };

  const handleResetToDefault = () => {
    clearConnectionCache();
    setReceipts(ELENA_VANCE_RECEIPTS);
    setActivePersona('elena');
    setActiveTab('overview');
  };

  // Navigations and cross-linking
  const handleSelectThread = (thread: ThreadStory) => {
    setSelectedReceiptForThreads(thread.leadReceiptId);
    setActiveTab('threads');
  };

  const handleOpenReceiptInThreads = (receiptId: string) => {
    setSelectedReceiptForThreads(receiptId);
    setSelectedReceiptForModal(null);
    setActiveTab('threads');
  };

  const handleOpenReceiptInConnectDots = (receiptId: string) => {
    setSelectedSeedForConnectDots(receiptId);
    setSelectedReceiptForModal(null);
    setActiveTab('connect-dots');
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F3F4F6] flex flex-col font-sans selection:bg-amber-500/20 selection:text-amber-200">
      {/* Accessible skip link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-amber-400 focus:text-black focus:font-bold focus:rounded-xl focus:shadow-2xl"
      >
        Skip to main content
      </a>

      {/* Sticky Header Navigation */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activePersona={activePersona}
        onSelectPersona={handleSelectPersona}
        onOpenUpload={() => setIsDatasetModalOpen(true)}
        totalMoments={stats.totalMoments}
        totalThreads={stats.totalThreadsDiscovered}
      />

      {/* Main Viewport Container with Error Boundary protection */}
      <main id="main-content" tabIndex={-1} className="flex-1 pb-16 focus:outline-none">
        <ErrorBoundary fallbackTitle="Could not display this section" onReset={handleResetToDefault}>
          {activeTab === 'overview' && (
            <TheLifeOverview
              receipts={receipts}
              stats={stats}
              threads={curatedThreads}
              chapters={chapters}
              onNavigateToTab={setActiveTab}
              onSelectReceipt={setSelectedReceiptForModal}
              onSelectThread={handleSelectThread}
            />
          )}

          {activeTab === 'chapters' && (
            <TheChapters
              chapters={chapters}
              receipts={receipts}
              onSelectReceipt={setSelectedReceiptForModal}
              onJumpToThreadWithReceipt={handleOpenReceiptInThreads}
            />
          )}

          {activeTab === 'threads' && (
            <TheThreads
              receipts={receipts}
              curatedThreads={curatedThreads}
              selectedReceiptId={selectedReceiptForThreads}
              onSelectReceipt={setSelectedReceiptForModal}
              onLaunchDiscoveryChain={handleOpenReceiptInConnectDots}
            />
          )}

          {activeTab === 'connect-dots' && (
            <ConnectTheDots
              receipts={receipts}
              seedReceiptId={selectedSeedForConnectDots}
              onSelectReceipt={setSelectedReceiptForModal}
            />
          )}

          {activeTab === 'journey' && (
            <DigitalJourney
              receipts={receipts}
              chapters={chapters}
              onSelectReceipt={setSelectedReceiptForModal}
            />
          )}

          {activeTab === 'explorer' && (
            <ReceiptExplorer
              receipts={receipts}
              chapters={chapters}
              onSelectReceipt={setSelectedReceiptForModal}
              onExploreThreadForReceipt={handleOpenReceiptInThreads}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Modals */}
      <ReceiptDetailModal
        receipt={selectedReceiptForModal}
        allReceipts={receipts}
        onClose={() => setSelectedReceiptForModal(null)}
        onNavigateToThreads={handleOpenReceiptInThreads}
        onLaunchConnectDots={handleOpenReceiptInConnectDots}
        onSelectConnectedReceipt={setSelectedReceiptForModal}
      />

      <DatasetModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        onLoadCustomDataset={handleCustomDatasetLoaded}
        onResetToDefault={handleResetToDefault}
        currentCount={receipts.length}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-white/[0.06] bg-[#07080C] py-8 text-xs text-white/40">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white tracking-wider">
              LIFE<span className="text-amber-400">//</span>THREADS
            </span>
            <span>—</span>
            <span>Frontend Arena Hackathon: &ldquo;Your Life, In Receipts&rdquo;</span>
          </div>

          <div className="flex items-center gap-4 text-white/50">
            <span>Raw Data → Insights → Connections → Story</span>
            <span className="text-white/20">|</span>
            <button
              onClick={() => setIsDatasetModalOpen(true)}
              className="hover:text-amber-300 transition text-amber-400/80 font-mono focus-visible:ring-1 focus-visible:ring-amber-400 focus-visible:outline-none rounded"
            >
              Upload Custom Challenge JSON
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
