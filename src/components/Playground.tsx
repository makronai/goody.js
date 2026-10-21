import React, { useState, useEffect, useRef } from 'react';
import { signal, computed, batch, render, h, renderToString } from '../goodyjs/index.ts';
import { Play, RotateCcw, Copy, Check, Sparkles, Layers, Eye, Code } from 'lucide-react';

export const Playground: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'counter' | 'todos' | 'ssr'>('counter');
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const unmountRef = useRef<(() => void) | null>(null);

  // Stats for the interactive playground
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [ssrOutputHtml, setSsrOutputHtml] = useState<string>('');

  const logEvent = (msg: string) => {
    setEventLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev.slice(0, 9),
    ]);
  };

  // Mount Demo in Container
  useEffect(() => {
    if (!containerRef.current) return;

    // Unmount previous demo
    if (unmountRef.current) {
      unmountRef.current();
      unmountRef.current = null;
    }
    containerRef.current.innerHTML = '';

    if (activeDemo === 'counter') {
      const count = signal(0);
      const step = signal(1);
      const double = computed(() => count() * 2);

      const CounterVNode = h('div', { class: 'space-y-4 p-4' },
        h('div', { class: 'flex items-center justify-between pb-3 border-b border-slate-700/60' },
          h('span', { class: 'text-sm font-semibold text-slate-300' }, 'Current Count:'),
          h('span', { class: 'text-3xl font-black font-mono text-emerald-400' }, () => count())
        ),
        h('div', { class: 'flex items-center justify-between text-xs text-slate-400' },
          h('span', null, 'Computed 2x Value:'),
          h('span', { class: 'font-mono text-cyan-400 font-bold' }, () => double())
        ),
        h('div', { class: 'grid grid-cols-2 gap-2 pt-2' },
          h('button', {
            class: 'px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-medium rounded-lg text-xs transition cursor-pointer shadow-sm',
            onClick: () => {
              count.update((n) => n + step());
              logEvent(`Signal updated -> count = ${count()}`);
            },
          }, () => `+${step()} Step`),
          h('button', {
            class: 'px-3 py-2 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white font-medium rounded-lg text-xs transition cursor-pointer',
            onClick: () => {
              count.set(0);
              logEvent('Signal reset -> count = 0');
            },
          }, 'Reset to 0')
        ),
        h('div', { class: 'pt-2' },
          h('button', {
            class: 'w-full px-3 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer shadow-md',
            onClick: () => {
              batch(() => {
                count.update((n) => n + 5);
                step.set(step() === 1 ? 5 : 1);
              });
              logEvent(`Batched update -> count = ${count()}, step = ${step()}`);
            },
          }, '⚡ Run Batched Update (count +5 & toggle step)')
        )
      );

      unmountRef.current = render(CounterVNode, containerRef.current);
      logEvent('GoodyJS Counter mounted natively into DOM');
    } else if (activeDemo === 'todos') {
      interface Task {
        id: number;
        title: string;
        completed: boolean;
      }

      const tasks = signal<Task[]>([
        { id: 1, title: 'Verify zero-dependency core', completed: true },
        { id: 2, title: 'Test fine-grained signal subscriptions', completed: true },
        { id: 3, title: 'Benchmark SSR hydration against DOM', completed: false },
        { id: 4, title: 'Deploy GoodyJS standalone service', completed: false },
      ]);
      const filter = signal<'all' | 'active' | 'completed'>('all');

      const filteredTasks = computed(() => {
        const list = tasks();
        const f = filter();
        if (f === 'active') return list.filter((t) => !t.completed);
        if (f === 'completed') return list.filter((t) => t.completed);
        return list;
      });

      const inputVal = signal('');

      const TodoVNode = h('div', { class: 'space-y-4 p-4' },
        // Input form
        h('div', { class: 'flex gap-2' },
          h('input', {
            class: 'flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500',
            placeholder: 'Add new task...',
            value: () => inputVal(),
            onInput: (e: any) => inputVal.set(e.target.value),
            onKeyDown: (e: any) => {
              if (e.key === 'Enter' && inputVal().trim()) {
                tasks.update((list) => [
                  ...list,
                  { id: Date.now(), title: inputVal().trim(), completed: false },
                ]);
                logEvent(`Added task "${inputVal().trim()}"`);
                inputVal.set('');
              }
            },
          }),
          h('button', {
            class: 'px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer',
            onClick: () => {
              if (inputVal().trim()) {
                tasks.update((list) => [
                  ...list,
                  { id: Date.now(), title: inputVal().trim(), completed: false },
                ]);
                logEvent(`Added task "${inputVal().trim()}"`);
                inputVal.set('');
              }
            },
          }, 'Add')
        ),
        // Filter tabs
        h('div', { class: 'flex gap-1.5 text-xs' },
          h('button', {
            class: () => `px-2 py-1 rounded cursor-pointer ${filter() === 'all' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'}`,
            onClick: () => filter.set('all'),
          }, 'All'),
          h('button', {
            class: () => `px-2 py-1 rounded cursor-pointer ${filter() === 'active' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'}`,
            onClick: () => filter.set('active'),
          }, 'Active'),
          h('button', {
            class: () => `px-2 py-1 rounded cursor-pointer ${filter() === 'completed' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'}`,
            onClick: () => filter.set('completed'),
          }, 'Completed')
        ),
        // List
        h('div', { class: 'space-y-1.5 max-h-48 overflow-y-auto' }, () => {
          const items = filteredTasks();
          return items.map((item) =>
            h('div', {
              key: item.id,
              class: 'flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs',
            },
              h('div', {
                class: `flex items-center gap-2 cursor-pointer ${item.completed ? 'line-through text-slate-500' : 'text-slate-200'}`,
                onClick: () => {
                  tasks.update((list) =>
                    list.map((t) => (t.id === item.id ? { ...t, completed: !t.completed } : t))
                  );
                  logEvent(`Toggled task #${item.id}`);
                },
              },
                h('span', { class: `w-4 h-4 rounded border flex items-center justify-center text-[10px] ${item.completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-600'}` }, item.completed ? '✓' : ''),
                item.title
              ),
              h('button', {
                class: 'text-slate-500 hover:text-rose-400 px-1 cursor-pointer',
                onClick: () => {
                  tasks.update((list) => list.filter((t) => t.id !== item.id));
                  logEvent(`Removed task #${item.id}`);
                },
              }, '×')
            )
          );
        })
      );

      unmountRef.current = render(TodoVNode, containerRef.current);
      logEvent('GoodyJS Keyed Todo Store mounted');
    } else if (activeDemo === 'ssr') {
      const serverApp = h('div', { class: 'ssr-container p-4' },
        h('h2', { class: 'text-base font-bold text-emerald-400' }, 'GoodyJS Server-Side Rendered Tree'),
        h('p', { class: 'text-xs text-slate-300 mt-1' }, 'Rendered via renderToString() with hydration markers.'),
        h('div', { class: 'grid grid-cols-2 gap-2 mt-3' },
          h('div', { class: 'p-2 rounded bg-slate-900 border border-slate-800' },
            h('span', { class: 'text-[10px] text-slate-400 uppercase tracking-wider' }, 'Marker Prefix'),
            h('p', { class: 'font-mono text-xs text-cyan-300' }, 'data-good-id="g-*"')
          ),
          h('div', { class: 'p-2 rounded bg-slate-900 border border-slate-800' },
            h('span', { class: 'text-[10px] text-slate-400 uppercase tracking-wider' }, 'Hydration Mode'),
            h('p', { class: 'font-mono text-xs text-emerald-300' }, 'Selective Attachment')
          )
        )
      );

      const generated = renderToString(serverApp);
      setSsrOutputHtml(generated);
      containerRef.current.innerHTML = generated;
      logEvent('GoodyJS SSR HTML generated and injected into DOM');
    }

    return () => {
      if (unmountRef.current) {
        unmountRef.current();
        unmountRef.current = null;
      }
    };
  }, [activeDemo]);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    counter: `import { component, signal, computed, batch, render, h } from 'goodyjs';

export const Counter = component(() => {
  const count = signal(0);
  const step = signal(1);
  const double = computed(() => count() * 2);

  return h('div', { class: 'counter-card' },
    h('h2', null, 'Count: ', () => count()),
    h('p', null, 'Double: ', () => double()),
    h('button', {
      onClick: () => count.update(n => n + step())
    }, 'Increment'),
    h('button', {
      onClick: () => {
        // Atomic batched update in single microtask
        batch(() => {
          count.update(n => n + 5);
          step.set(5);
        });
      }
    }, 'Batched +5')
  );
});

render(h(Counter, null), document.getElementById('root')!);`,

    todos: `import { component, signal, computed, render, h } from 'goodyjs';

export const TodoApp = component(() => {
  const tasks = signal([
    { id: 1, title: 'Zero deps', completed: true },
    { id: 2, title: 'Signals UI', completed: false },
  ]);
  const filter = signal<'all' | 'active'>('all');

  // Fine-grained computed derivation
  const visible = computed(() =>
    filter() === 'active' ? tasks().filter(t => !t.completed) : tasks()
  );

  return h('div', null,
    h('button', { onClick: () => filter.set('active') }, 'Show Active'),
    h('ul', null, () =>
      visible().map(t =>
        h('li', { key: t.id }, t.title)
      )
    )
  );
});`,

    ssr: `import { createServer, renderToString, renderToDocument, h } from 'goodyjs';
import { App } from './App.tsx';

const app = createServer();

app.get('/', (ctx) => {
  // 1. Serialize component to HTML with data-good-id markers
  const bodyHtml = renderToString(h(App, { user: 'Ada' }));

  // 2. Wrap in HTML5 document with inline state payload
  const fullHtml = renderToDocument({
    title: 'GoodyJS Server App',
    bodyHtml,
    initialState: { user: 'Ada', timestamp: Date.now() },
    clientScriptUrl: '/client.js',
  });

  ctx.res.html(fullHtml);
});

await app.listen({ port: 3000 });`,
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h2 className="text-lg font-bold text-white tracking-tight">Live GoodyJS Engine Sandbox</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            This playground runs the compiled <code className="text-emerald-400 font-mono">goodyjs</code> runtime directly in your browser.
            Zero React or Vue internals are used to render or update the sandboxed components below.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveDemo('counter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeDemo === 'counter'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Counter & Batching
          </button>
          <button
            onClick={() => setActiveDemo('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeDemo === 'todos'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Keyed List Store
          </button>
          <button
            onClick={() => setActiveDemo('ssr')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeDemo === 'ssr'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            SSR & Hydration
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Interactive Mounted Canvas */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex-1 flex flex-col">
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-bold text-slate-200">Native GoodyJS Container</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                DOM Isolated
              </span>
            </div>

            {/* DOM Mount Target */}
            <div
              ref={containerRef}
              className="p-3 flex-1 flex flex-col justify-center min-h-[260px] bg-slate-900/40"
            />

            {/* SSR Raw HTML Inspector if in SSR mode */}
            {activeDemo === 'ssr' && (
              <div className="p-3 border-t border-slate-800 bg-slate-950">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Serialized HTML Payload
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {ssrOutputHtml.length} chars
                  </span>
                </div>
                <pre className="p-2.5 rounded bg-slate-900 text-[11px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap break-all border border-slate-800">
                  {ssrOutputHtml}
                </pre>
              </div>
            )}
          </div>

          {/* Real-Time Reactivity Event Log */}
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">Signal Engine Telemetry</span>
              <button
                onClick={() => setEventLog([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="space-y-1 font-mono text-[11px] max-h-32 overflow-y-auto scrollbar-thin">
              {eventLog.length === 0 ? (
                <p className="text-slate-600 italic">Interact with the controls above to observe signal dispatches...</p>
              ) : (
                eventLog.map((log, i) => (
                  <div key={i} className="text-slate-400 flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">›</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Editor & API Breakdown */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl flex-1 flex flex-col">
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  Source: {activeDemo === 'counter' ? 'Counter.ts' : activeDemo === 'todos' ? 'TodoStore.ts' : 'server.ts'}
                </span>
              </div>
              <button
                onClick={() => copyCode(codeSnippets[activeDemo])}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex-1 overflow-x-auto">
              <pre className="font-mono text-xs text-emerald-300/90 leading-relaxed">
                <code>{codeSnippets[activeDemo]}</code>
              </pre>
            </div>

            {/* Architecture Highlights Pill Footer */}
            <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ✓ No React VDOM diffing overhead
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                ✓ Node-level subscription pinpointing
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                ✓ Batched atomic notifications
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
