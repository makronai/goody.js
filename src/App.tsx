/**
 * @license MIT
 * GoodJS Official Showcase & Developer Workbench
 */

import React, { useState } from 'react';
import { Header } from './components/Header.tsx';
import { Playground } from './components/Playground.tsx';
import { BenchmarkLab } from './components/BenchmarkLab.tsx';
import { ServerSimulator } from './components/ServerSimulator.tsx';
import { CliTerminal } from './components/CliTerminal.tsx';
import { GraphInspector } from './components/GraphInspector.tsx';
import { ArchitectureDocs } from './components/ArchitectureDocs.tsx';
import { ShieldCheck, Heart, Terminal, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('playground');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Header */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'playground' && <Playground />}
        {activeTab === 'benchmarks' && <BenchmarkLab />}
        {activeTab === 'server' && <ServerSimulator />}
        {activeTab === 'cli' && <CliTerminal />}
        {activeTab === 'graph' && <GraphInspector />}
        {activeTab === 'docs' && <ArchitectureDocs />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>GoodJS v0.1.0 Stable Milestone • Zero-Dependency Full-Stack Core</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 34/34 Node:Test Unit Tests Passed
            </span>
            <span className="text-slate-600">|</span>
            <span>MIT License</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-slate-400">node &gt;= 18.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
