/**
 * @license MIT
 * GoodyJS NPM Package
 */

import React from 'react';
import { Package, ShieldCheck, Terminal, Cpu, Layers } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-emerald-500/20 selection:text-emerald-300">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <Package className="w-3.5 h-3.5" />
          <span>NPM Package: goodyjs v0.1.4</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          GoodyJS (<span className="text-emerald-400">goodyjs</span>)
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-8 leading-relaxed">
          An ultra-lightweight, zero-runtime-dependency full-stack JavaScript framework uniting fine-grained reactive UI, a native Node.js HTTP server, composable onion middleware, SSR with client-side hydration, path-parameter routing, and zero-config CLI tooling.
        </p>

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8 text-left font-mono text-sm shadow-xl">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Install Package</span>
            <span>npm</span>
          </div>
          <div className="text-emerald-300 select-all font-semibold">
            npm install goodyjs
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl text-left">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-xs text-slate-400">Tests</div>
            <div className="font-semibold text-slate-200 text-sm">34/34 Passed</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <Cpu className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-xs text-slate-400">Runtime Deps</div>
            <div className="font-semibold text-slate-200 text-sm">0 External</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <Layers className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-xs text-slate-400">Client Bundle</div>
            <div className="font-semibold text-slate-200 text-sm">&lt;9 KB Gzip</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <Terminal className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="text-xs text-slate-400">CLI Tooling</div>
            <div className="font-semibold text-slate-200 text-sm">goody / good</div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 text-center">
        <p>GoodyJS • Zero-Dependency NPM Package • MIT License</p>
      </footer>
    </div>
  );
}
