import React, { useState } from 'react';
import { BookOpen, Check, Copy, Code, Layers, Shield, Zap, Sparkles } from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'manifesto' | 'migration' | 'api' | 'security'>('manifesto');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copySnippet = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">GoodyJS Architecture & Documentation</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A small but complete framework. One cohesive full-stack runtime replacing React + Vue + Express + Vite
            with zero mandatory dependencies and predictable fine-grained reactivity.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveSection('manifesto')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeSection === 'manifesto' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Milestone 1 Manifesto
          </button>
          <button
            onClick={() => setActiveSection('migration')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeSection === 'migration' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Migration Guides
          </button>
          <button
            onClick={() => setActiveSection('api')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeSection === 'api' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            API Reference
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
              activeSection === 'security' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Security & Threat Model
          </button>
        </div>
      </div>

      {/* Content Sections */}
      {activeSection === 'manifesto' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">The GoodyJS Milestone 1 Philosophy</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Established JavaScript ecosystems have grown into heavyweight matrices of fragmented tooling: React for rendering,
              Redux/Zustand for state, Express for APIs, Vite for bundling, React Router for navigation, and specialized SSR plugins.
              A simple CRUD application now pulls thousands of transitive dependencies and weighs over 150 KB just to boot.
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              GoodyJS takes the opposite approach: <strong>make the first stable release a small but complete framework</strong> rather
              than an incomplete attempt to reproduce every feature in five ecosystems simultaneously.
              One GoodyJS application can render a reactive UI, serve API routes, run middleware, build for production, and deploy
              without React, Vue, Express, or Vite.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-200">Zero Mandatory Dependencies</h4>
                <p className="text-[11px] text-slate-400">
                  Built exclusively on Web Standards (<code className="text-emerald-300 font-mono">fetch</code>, <code className="text-emerald-300 font-mono">Request</code>, <code className="text-emerald-300 font-mono">Response</code>) and native Node.js HTTP.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="text-xs font-bold text-slate-200">Fine-Grained Reactivity</h4>
                <p className="text-[11px] text-slate-400">
                  Signals and direct DOM Text/Attribute node binding. State updates update pinpointed DOM elements without virtual DOM diffing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-200">Unified Full-Stack Runtime</h4>
                <p className="text-[11px] text-slate-400">
                  Backend API server, onion middleware, router, and SSR with hydration markers in a single 9.3 KB gzipped distribution.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'migration' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* React -> GoodyJS */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  React 19 ➔ GoodyJS Migration
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">UI & State</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Replace <code className="text-emerald-300 font-mono">useState</code> with <code className="text-emerald-300 font-mono">signal</code>.
                No dependency arrays, no stale closures, and components execute only once during setup!
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                  <span className="text-rose-400 block mb-1 font-sans text-[10px] font-bold">React:</span>
                  const [count, setCount] = useState(0);<br />
                  &lt;button onClick=&#123;() =&gt; setCount(c =&gt; c + 1)&#125;&gt;&#123;count&#125;&lt;/button&gt;
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-emerald-900/60 text-emerald-300">
                  <span className="text-emerald-400 block mb-1 font-sans text-[10px] font-bold">GoodyJS:</span>
                  const count = signal(0);<br />
                  h('button', &#123; onClick: () =&gt; count.update(n =&gt; n + 1) &#125;, () =&gt; count())
                </div>
              </div>
            </div>

            {/* Express -> GoodyJS */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Express ➔ GoodyJS Migration
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">HTTP Server</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Modern async onion model with typed <code className="text-cyan-300 font-mono">MiddlewareContext</code> and native body parsing.
              </p>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                  <span className="text-rose-400 block mb-1 font-sans text-[10px] font-bold">Express:</span>
                  const app = express();<br />
                  app.use(express.json());<br />
                  app.get('/api/users/:id', (req, res) =&gt; res.json(&#123; id: req.params.id &#125;));
                </div>
                <div className="p-2.5 rounded bg-slate-950 border border-cyan-900/60 text-cyan-300">
                  <span className="text-cyan-400 block mb-1 font-sans text-[10px] font-bold">GoodyJS:</span>
                  const app = createServer();<br />
                  app.get('/api/users/:id', (ctx) =&gt; (&#123; id: ctx.req.params.id &#125;));
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'api' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Public API Reference (v0.1.0)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-emerald-400 font-bold block">goodyjs/reactivity</span>
                <p className="text-slate-300">signal&lt;T&gt;(initial: T): Signal&lt;T&gt;</p>
                <p className="text-slate-300">computed&lt;T&gt;(derive: () =&gt; T): Computed&lt;T&gt;</p>
                <p className="text-slate-300">effect(run: () =&gt; void | CleanupFn): CleanupFn</p>
                <p className="text-slate-300">batch&lt;T&gt;(run: () =&gt; T): T</p>
                <p className="text-slate-300">untrack&lt;T&gt;(fn: () =&gt; T): T</p>
                <p className="text-slate-300">createRoot&lt;T&gt;(fn: (dispose) =&gt; T): T</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-cyan-400 font-bold block">goodyjs/ui</span>
                <p className="text-slate-300">component&lt;P&gt;(fn: (props: P) =&gt; VNodeChild)</p>
                <p className="text-slate-300">h(tag, props, ...children): VNode</p>
                <p className="text-slate-300">render(vnode, container): () =&gt; void</p>
                <p className="text-slate-300">hydrate(vnode, container): () =&gt; void</p>
                <p className="text-slate-300">onMount(fn: () =&gt; void): void</p>
                <p className="text-slate-300">onCleanup(fn: () =&gt; void): void</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-purple-400 font-bold block">goodyjs/server</span>
                <p className="text-slate-300">createServer(): GoodServerInstance</p>
                <p className="text-slate-300">app.get(path, handler)</p>
                <p className="text-slate-300">app.post(path, handler)</p>
                <p className="text-slate-300">app.use(middleware)</p>
                <p className="text-slate-300">app.listen(&#123; port, host &#125;): Promise</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-indigo-400 font-bold block">goodyjs/ssr</span>
                <p className="text-slate-300">renderToString(vnode, options?): string</p>
                <p className="text-slate-300">renderToDocument(options): string</p>
                <p className="text-slate-300">escapeHtml(str: unknown): string</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'security' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Security Architecture & Safe Defaults</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              GoodyJS incorporates hardened web application security by default rather than as an afterthought plugin:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-emerald-400">1. Context-Aware HTML Auto-Escaping</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  All text children and attributes in both client rendering and SSR string serialization are escaped against &lt;, &gt;, &amp;, &quot;, and &#39;.
                  The only way to inject unescaped markup is via explicit <code className="text-emerald-300 font-mono">dangerouslySetInnerHTML</code>.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-cyan-400">2. Request Body Safeguards & Size Clamping</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  The native HTTP server enforces a default 1MB max payload stream limit and protects against memory exhaust attacks.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <h4 className="font-bold text-purple-400">3. Built-in Production Security Headers</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  First-class <code className="text-purple-300 font-mono">securityHeaders()</code> middleware injects strict CSP, X-Content-Type-Options: nosniff,
                  X-Frame-Options: SAMEORIGIN, and HSTS.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
