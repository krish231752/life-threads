import React from 'react';
import { 
  Sparkles, 
  GitFork, 
  Compass, 
  BookOpen, 
  Search, 
  Layers,
  Database,
  Upload,
  RefreshCw,
  Share2
} from 'lucide-react';

export type ActiveTab = 'overview' | 'chapters' | 'threads' | 'connect-dots' | 'journey' | 'explorer';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activePersona: 'elena' | 'marcus' | 'custom';
  onSelectPersona: (persona: 'elena' | 'marcus') => void;
  onOpenUpload: () => void;
  totalMoments: number;
  totalThreads: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  activePersona,
  onSelectPersona,
  onOpenUpload,
  totalMoments,
  totalThreads,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#090A0F]/90 backdrop-blur-xl transition-all">
      {/* Top Banner with Persona & Concept Switcher */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs sm:px-6 lg:px-8 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 text-white/50">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline font-mono tracking-wider">FRONTEND ARENA • HACKATHON EDITION</span>
          <span className="sm:hidden font-mono">LIFE//THREADS</span>
          <span className="text-white/20">|</span>
          <span className="text-white/60">
            Fictional Life Dataset: <strong className="text-white font-medium capitalize">{activePersona === 'elena' ? 'Elena Vance (Austin → Bushwick)' : activePersona === 'marcus' ? 'Marcus Ray (Mission SF)' : 'Custom Dataset'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Persona Switchers */}
          <div className="flex items-center rounded-lg bg-white/[0.04] p-0.5 border border-white/[0.08]">
            <button
              onClick={() => onSelectPersona('elena')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition ${
                activePersona === 'elena'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Elena Vance
            </button>
            <button
              onClick={() => onSelectPersona('marcus')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition ${
                activePersona === 'marcus'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Marcus Ray
            </button>
          </div>

          {/* Upload Custom JSON */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-white/70 hover:bg-white/[0.08] hover:text-white transition"
            title="Upload or Paste any Life Receipts JSON"
          >
            <Upload className="h-3 w-3 text-amber-400" />
            <span className="hidden md:inline">Custom JSON</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onTabChange('overview')}
            className="flex cursor-pointer items-center gap-2.5 group"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent border border-amber-500/30 text-amber-300 shadow-inner group-hover:border-amber-400 transition">
              <span className="font-mono text-sm font-bold tracking-tighter">✦</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-widest text-white">
                  LIFE<span className="text-amber-400">//</span>THREADS
                </span>
                <span className="hidden lg:inline-flex items-center rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 border border-amber-400/20">
                  {totalMoments} moments • {totalThreads} threads
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-white/40 font-light">
                Hundreds of moments. One life. Follow the threads.
              </p>
            </div>
          </div>
        </div>

        {/* Primary View Navigation */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => onTabChange('overview')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-amber-400" />
            <span>The Life</span>
          </button>

          <button
            onClick={() => onTabChange('chapters')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'chapters'
                ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>The Chapters</span>
          </button>

          <button
            onClick={() => onTabChange('threads')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap relative ${
              activeTab === 'threads'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <GitFork className="h-3.5 w-3.5 text-amber-400" />
            <span className="font-semibold">The Threads</span>
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          </button>

          <button
            onClick={() => onTabChange('connect-dots')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'connect-dots'
                ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-pink-400" />
            <span>Connect Dots</span>
          </button>

          <button
            onClick={() => onTabChange('journey')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'journey'
                ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Digital Journey</span>
          </button>

          <button
            onClick={() => onTabChange('explorer')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap ${
              activeTab === 'explorer'
                ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Search className="h-3.5 w-3.5 text-cyan-400" />
            <span>Receipt Explorer</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
