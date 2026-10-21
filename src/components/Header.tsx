import React from 'react';
import { Zap, Shield, CheckCircle2, Cpu, ExternalLink } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'playground', label: 'Live Sandbox', icon: Zap },
    { id: 'benchmarks', label: 'Benchmark Lab', icon: Cpu },
    { id: 'server', label: 'Full-Stack Server', icon: Shield },
    { id: 'cli', label: 'CLI & Scaffolder', icon: ExternalLink },
    { id: 'graph', label: 'Reactive Graph', icon: CheckCircle2 },
    { id: 'docs', label: 'Architecture & Docs', icon: CheckCircle2 },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-xl tracking-tight">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">GoodJS</span>
                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  v0.1.0 Milestone
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                  Zero External Dependencies
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                Lightweight Full-Stack JS Framework: Reactive UI • Native Server • Composable Middleware • SSR
              </p>
            </div>
          </div>

          {/* Key Metrics Badges */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="text-slate-400">UI Bundle:</span>
              <span className="text-emerald-400 font-bold font-mono">2.43 KB</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="text-slate-400">Reactivity:</span>
              <span className="text-cyan-400 font-bold font-mono">8.5M ops/s</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className="text-slate-400">Unit Tests:</span>
              <span className="text-emerald-400 font-bold font-mono">34/34 Passed</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 sm:pb-0 scrollbar-none" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
