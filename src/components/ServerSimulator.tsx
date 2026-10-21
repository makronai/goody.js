import React, { useState } from 'react';
import { createServer, securityHeaders, cors, rateLimiter, requestLogger, defineMiddleware } from '../goodyjs/index.ts';
import { Server, Shield, Send, CheckCircle2, AlertTriangle, ArrowRight, Clock, Key } from 'lucide-react';

export const ServerSimulator: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'health' | 'tasks' | 'create_task' | 'protected'>('health');
  const [enableSecurityHeaders, setEnableSecurityHeaders] = useState(true);
  const [enableRateLimit, setEnableRateLimit] = useState(false);
  const [enableAuth, setEnableAuth] = useState(true);
  const [authHeader, setAuthHeader] = useState('Bearer goodyjs-token-123');
  const [requestBody, setRequestBody] = useState('{\n  "title": "Ship GoodyJS 0.1.0",\n  "priority": "high"\n}');

  const [isLoading, setIsLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<{
    status: number;
    headers: Record<string, any>;
    body: any;
    durationMs: number;
    middlewareTrace: string[];
  } | null>(null);

  const [serverLog, setServerLog] = useState<string[]>([]);

  const dispatchSimulatedRequest = async () => {
    setIsLoading(true);

    // Initialize GoodyJS Server without Express
    const app = createServer();
    const trace: string[] = [];

    // Middleware 1: Tracer
    app.use(defineMiddleware(async (ctx, next) => {
      trace.push('1. [Tracer] Request initiated -> ' + ctx.req.method + ' ' + ctx.req.path);
      const start = performance.now();
      await next();
      const dur = (performance.now() - start).toFixed(2);
      trace.push(`1. [Tracer] Response finalized (${dur}ms)`);
    }));

    // Middleware 2: Security Headers
    if (enableSecurityHeaders) {
      trace.push('2. [Security] Attached X-Content-Type-Options, Frame-Options, CSP');
      app.use(securityHeaders({ csp: "default-src 'self'" }));
    }

    // Middleware 3: CORS
    app.use(cors());

    // Middleware 4: Rate Limiter
    if (enableRateLimit) {
      trace.push('3. [RateLimit] Evaluated IP window (max 3 req/window)');
      app.use(rateLimiter({ max: 3, windowMs: 10_000 }));
    }

    // Middleware 5: Auth Guard for protected routes
    app.use(defineMiddleware(async (ctx, next) => {
      if (ctx.req.path.startsWith('/api/protected')) {
        const auth = ctx.req.headers['authorization'];
        if (!auth || !auth.includes('goodyjs-token')) {
          trace.push('4. [Auth] ❌ Unauthorized request blocked');
          ctx.res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or invalid Bearer token. Use Authorization: Bearer goodyjs-token-123',
          });
          return;
        }
        trace.push('4. [Auth] ✔ Valid Bearer token authenticated');
      }
      await next();
    }));

    // Register Endpoints
    app.get('/api/health', (ctx) => {
      trace.push('5. [Route] Handled GET /api/health');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        framework: 'GoodyJS Server (Native Node HTTP Primitives)',
        dependencies: 0,
        uptimeSeconds: 42.18,
      };
    });

    app.get('/api/tasks', (ctx) => {
      trace.push('5. [Route] Handled GET /api/tasks');
      return [
        { id: 'task-1', title: 'Verify Fine-Grained Signals', status: 'completed' },
        { id: 'task-2', title: 'Zero-Config SSR Hydration Markers', status: 'completed' },
        { id: 'task-3', title: 'Publish goodyjs v0.1.0 to npm', status: 'in-progress' },
      ];
    });

    app.post('/api/tasks', (ctx) => {
      trace.push('5. [Route] Handled POST /api/tasks');
      const body = ctx.req.body || {};
      ctx.res.status(201).json({
        created: true,
        id: 'task_' + Math.random().toString(36).substring(2, 7),
        title: body.title || 'Untitled Task',
        priority: body.priority || 'normal',
        createdAt: new Date().toISOString(),
      });
    });

    app.get('/api/protected/profile', (ctx) => {
      trace.push('5. [Route] Handled GET /api/protected/profile');
      return {
        userId: 'usr_8829',
        username: 'goodyjs_architect',
        role: 'system_admin',
        capabilities: ['deploy', 'publish', 'audit'],
      };
    });

    const start = performance.now();
    let method = 'GET';
    let path = '/api/health';
    let bodyPayload: any = undefined;

    if (selectedEndpoint === 'health') {
      method = 'GET';
      path = '/api/health';
    } else if (selectedEndpoint === 'tasks') {
      method = 'GET';
      path = '/api/tasks';
    } else if (selectedEndpoint === 'create_task') {
      method = 'POST';
      path = '/api/tasks';
      try {
        bodyPayload = JSON.parse(requestBody);
      } catch {
        bodyPayload = { raw: requestBody };
      }
    } else if (selectedEndpoint === 'protected') {
      method = 'GET';
      path = '/api/protected/profile';
    }

    const headers: Record<string, string> = {};
    if (enableAuth && authHeader) {
      headers['authorization'] = authHeader;
    }
    if (method === 'POST') {
      headers['content-type'] = 'application/json';
    }

    const res = await app.simulateRequest(method, path, {
      headers,
      body: bodyPayload,
    });
    const dur = performance.now() - start;

    setResponseResult({
      status: res.status,
      headers: res.headers,
      body: res.body,
      durationMs: Number(dur.toFixed(2)),
      middlewareTrace: trace,
    });

    setServerLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${method} ${path} -> ${res.status} (${dur.toFixed(2)}ms)`,
      ...prev.slice(0, 9),
    ]);

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Independent GoodyJS Backend Server</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            A standalone HTTP runtime using standard Node.js <code className="text-cyan-400 font-mono">http</code> without Express.
            Composable onion middleware, typed request contexts, auto body parsing, and route parameter extraction.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-lg">
            createServer()
          </span>
          <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg">
            No Express
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Configurator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              1. Select Endpoint & Method
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setSelectedEndpoint('health')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  selectedEndpoint === 'health'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-emerald-400 block">GET</span>
                /api/health
              </button>

              <button
                onClick={() => setSelectedEndpoint('tasks')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  selectedEndpoint === 'tasks'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-emerald-400 block">GET</span>
                /api/tasks
              </button>

              <button
                onClick={() => setSelectedEndpoint('create_task')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  selectedEndpoint === 'create_task'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-cyan-400 block">POST</span>
                /api/tasks
              </button>

              <button
                onClick={() => setSelectedEndpoint('protected')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  selectedEndpoint === 'protected'
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-[10px] font-mono font-bold text-purple-400 block">GET</span>
                /api/protected/profile
              </button>
            </div>

            {/* Middleware Toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                2. Active Middleware Stack
              </h4>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-300">securityHeaders() (CSP, Nosniff, HSTS)</span>
                  <input
                    type="checkbox"
                    checked={enableSecurityHeaders}
                    onChange={(e) => setEnableSecurityHeaders(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-300">rateLimiter() (Simulate 429 throttle)</span>
                  <input
                    type="checkbox"
                    checked={enableRateLimit}
                    onChange={(e) => setEnableRateLimit(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 cursor-pointer">
                  <span className="text-slate-300">Bearer Auth Verification</span>
                  <input
                    type="checkbox"
                    checked={enableAuth}
                    onChange={(e) => setEnableAuth(e.target.checked)}
                    className="accent-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* POST Body Editor if POST selected */}
            {selectedEndpoint === 'create_task' && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  POST JSON Payload
                </span>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-xs text-emerald-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            {/* Auth token editor if protected endpoint selected */}
            {selectedEndpoint === 'protected' && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Authorization Header
                </span>
                <input
                  type="text"
                  value={authHeader}
                  onChange={(e) => setAuthHeader(e.target.value)}
                  placeholder="Bearer token..."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg font-mono text-xs text-purple-300 focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            {/* Dispatch Button */}
            <button
              onClick={dispatchSimulatedRequest}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {isLoading ? 'Executing Middleware...' : 'Dispatch HTTP Request'}
            </button>
          </div>
        </div>

        {/* Right: Response Inspector & Middleware Onion Trace */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">HTTP Response Inspector</span>
                {responseResult && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                      responseResult.status < 300
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : responseResult.status === 401
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {responseResult.status} {responseResult.status === 200 ? 'OK' : responseResult.status === 201 ? 'Created' : responseResult.status === 401 ? 'Unauthorized' : 'Error'}
                  </span>
                )}
              </div>
              {responseResult && (
                <span className="text-[11px] font-mono text-cyan-400">
                  {responseResult.durationMs}ms latency
                </span>
              )}
            </div>

            <div className="p-4 bg-slate-950 min-h-[220px]">
              {responseResult ? (
                <div className="space-y-3 font-mono text-xs">
                  {/* Headers */}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                      Response Headers
                    </span>
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-0.5">
                      {Object.entries(responseResult.headers).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-slate-400 font-semibold">{k}:</span>
                          <span className="text-cyan-300">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Body */}
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
                      Response Body (JSON)
                    </span>
                    <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto">
                      {JSON.stringify(responseResult.body, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Server className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs">Select an endpoint on the left and click "Dispatch HTTP Request".</p>
                </div>
              )}
            </div>

            {/* Onion Execution Trace */}
            {responseResult && (
              <div className="p-3 bg-slate-900/90 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Middleware Pipeline Execution Trace
                </span>
                <div className="space-y-1 font-mono text-[11px] text-slate-300">
                  {responseResult.middlewareTrace.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-slate-400">
                      <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
