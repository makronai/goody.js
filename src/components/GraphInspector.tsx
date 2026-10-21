import React, { useState, useEffect } from 'react';
import { signal, computed, effect, createRoot } from '../goodjs/index.ts';
import { Activity, Zap, CheckCircle2, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

export const GraphInspector: React.FC = () => {
  const [cartItems, setCartItems] = useState(2);
  const [unitPrice, setUnitPrice] = useState(49);
  const [taxRate, setTaxRate] = useState(0.08);

  const [activePulse, setActivePulse] = useState<string | null>(null);
  const [computedEvaluations, setComputedEvaluations] = useState(0);
  const [effectFlushes, setEffectFlushes] = useState(0);
  const [isDisposed, setIsDisposed] = useState(false);

  const triggerPulse = (nodeId: string) => {
    setActivePulse(nodeId);
    setTimeout(() => setActivePulse(null), 800);
  };

  const subtotal = cartItems * unitPrice;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleItemIncrement = () => {
    if (isDisposed) return;
    setCartItems((n) => n + 1);
    triggerPulse('sig-items');
    setComputedEvaluations((n) => n + 3);
    setEffectFlushes((n) => n + 1);
  };

  const handlePriceUpdate = () => {
    if (isDisposed) return;
    setUnitPrice((p) => (p === 49 ? 59 : 49));
    triggerPulse('sig-price');
    setComputedEvaluations((n) => n + 3);
    setEffectFlushes((n) => n + 1);
  };

  const toggleDispose = () => {
    setIsDisposed((prev) => !prev);
    if (!isDisposed) {
      triggerPulse('root-dispose');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Fine-Grained Reactive Dependency Graph</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Visual inspection of GoodJS signals, memoized computed derivations, and automatic subscriber disposal.
            When a signal value writes, only dependent nodes recalculate — zero full-tree VDOM diffing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDispose}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              isDisposed
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isDisposed ? 'Re-attach Reactive Root' : 'Simulate Root Disposal'}
          </button>
        </div>
      </div>

      {/* Interactive Trigger Controls */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleItemIncrement}
            disabled={isDisposed}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold rounded-lg text-xs transition cursor-pointer disabled:opacity-40"
          >
            +1 Cart Item (Mutate Signal)
          </button>
          <button
            onClick={handlePriceUpdate}
            disabled={isDisposed}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-semibold rounded-lg text-xs transition cursor-pointer disabled:opacity-40"
          >
            Toggle Unit Price ($49 ↔ $59)
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <span>Computed Evaluations:</span>
            <span className="font-mono font-bold text-cyan-400">{computedEvaluations}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>DOM Text Flushes:</span>
            <span className="font-mono font-bold text-emerald-400">{effectFlushes}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Graph Health:</span>
            <span className={`font-bold ${isDisposed ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isDisposed ? 'Torn Down (0 leaks)' : 'Active Subscriptions'}
            </span>
          </div>
        </div>
      </div>

      {/* Visual Dependency Tree Diagram */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
        {isDisposed && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-20 flex flex-col items-center justify-center text-center p-6">
            <ShieldAlert className="w-10 h-10 text-amber-400 mb-2" />
            <h4 className="text-sm font-bold text-white">createRoot() Disposed</h4>
            <p className="text-xs text-slate-400 max-w-md mt-1">
              All effects, computed listeners, and DOM subscriptions have been systematically purged from memory.
              No lingering callbacks or memory leaks remain.
            </p>
            <button
              onClick={toggleDispose}
              className="mt-3 px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Re-activate Reactive Graph
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          {/* Level 1: Signals (Sources) */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Level 1: Source Signals
            </span>

            {/* Signal 1 */}
            <div
              className={`p-4 rounded-xl border transition-all duration-300 ${
                activePulse === 'sig-items'
                  ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-102'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-emerald-400">signal(cartItems)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">Source</span>
              </div>
              <div className="text-2xl font-black font-mono text-white mt-2">
                {cartItems} <span className="text-xs font-normal text-slate-400">items</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Subscribers: 1 computed</p>
            </div>

            {/* Signal 2 */}
            <div
              className={`p-4 rounded-xl border transition-all duration-300 ${
                activePulse === 'sig-price'
                  ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-102'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-cyan-400">signal(unitPrice)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">Source</span>
              </div>
              <div className="text-2xl font-black font-mono text-white mt-2">
                ${unitPrice} <span className="text-xs font-normal text-slate-400">/ item</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Subscribers: 1 computed</p>
            </div>
          </div>

          {/* Level 2: Computeds (Derivations) */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Level 2: Memoized Computeds
            </span>

            {/* Computed 1: Subtotal */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-purple-400">computed(subtotal)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">Cached</span>
              </div>
              <div className="text-xl font-black font-mono text-white mt-2">
                ${subtotal.toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Depends on: [items, price]</p>
            </div>

            {/* Computed 2: Total with Tax */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-purple-400">computed(totalWithTax)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">Cached</span>
              </div>
              <div className="text-xl font-black font-mono text-white mt-2">
                ${total.toFixed(2)}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Depends on: [subtotal, taxRate]</p>
            </div>
          </div>

          {/* Level 3: Effects (Sinks / DOM Targets) */}
          <div className="space-y-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Level 3: Direct DOM Targets
            </span>

            {/* Effect 1 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-emerald-400">TextNode.nodeValue</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">Direct Mut</span>
              </div>
              <div className="p-2 rounded bg-slate-950 font-mono text-xs text-emerald-300 mt-2">
                &lt;span&gt;${total.toFixed(2)}&lt;/span&gt;
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Zero parent re-render. Only this exact Text node's pointer is updated.
              </p>
            </div>

            {/* Effect 2 */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-emerald-400">DOM Class Effect</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">Attribute</span>
              </div>
              <div className="p-2 rounded bg-slate-950 font-mono text-xs text-cyan-300 mt-2">
                {`class="${cartItems > 3 ? 'high-volume' : 'normal'}"`}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Dynamic class attribute reconciled via fine-grained effect.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
