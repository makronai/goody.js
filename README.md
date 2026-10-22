# GoodyJS (`goodyjs`)

[![npm version](https://img.shields.io/badge/npm-v0.1.4-emerald.svg)](https://www.npmjs.com/package/goodyjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Tests: 34/34 Passing](https://img.shields.io/badge/Tests-34%2F34%20Passing-brightgreen.svg)](#testing)
[![Dependencies: 0 Runtime](https://img.shields.io/badge/Dependencies-0%20Runtime-blueviolet.svg)](#architecture)
[![Client Bundle: <9KB Gzipped](https://img.shields.io/badge/Client%20Bundle-%3C9KB%20Gzipped-success.svg)](#benchmarks)

**GoodyJS** is an ultra-lightweight, zero-runtime-dependency full-stack JavaScript framework uniting fine-grained reactive UI, a native Node.js HTTP server, composable onion middleware, SSR with client-side hydration, path-parameter routing, and zero-config CLI tooling.

It replaces the typical multi-gigabyte stack of React + Vite + Express + Redux with a single cohesive, high-performance runtime under **9 KB gzipped**.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [1. Frontend Reactive App](#1-frontend-reactive-app)
  - [2. Backend HTTP Service](#2-backend-http-service)
  - [3. Full-Stack SSR with Hydration](#3-full-stack-ssr-with-hydration)
- [CLI Tooling (`goody` / `good`)](#cli-tooling-goody--good)
- [Module Reference](#module-reference)
  - [`goodyjs` / `goodyjs/reactivity`](#goodyjsreactivity)
  - [`goodyjs/ui` & JSX](#goodyjsui)
  - [`goodyjs/server`](#goodyjsserver)
  - [`goodyjs/middleware`](#goodyjsmiddleware)
  - [`goodyjs/router`](#goodyjsrouter)
  - [`goodyjs/ssr`](#goodyjsssr)
- [Benchmarks](#benchmarks)
- [Testing & Quality](#testing--quality)
- [Publishing & NPM Scripts](#publishing--npm-scripts)
- [License](#license)

---

## Features

- ⚡ **Zero External Runtime Dependencies**: Built directly on native Web standards and Node.js built-ins (`node:http`, `node:url`, Web Streams). No Express, no React, no Babel required at runtime.
- 🧠 **Fine-Grained Reactivity**: True push-pull signal graph with automatic dependency tracking, memoized computed derivations, side effects with cleanups, batched updates, and root lifecycle scopes.
- 🌐 **Native High-Performance HTTP Server**: Clean async routing, parameterized URL patterns (`/api/items/:id`), query parsing, robust error recovery, and zero boilerplate.
- 🧅 **Composable Onion Middleware**: Koa-style downstream/upstream execution model with built-in security headers (Strict CSP, HSTS, X-Content-Type-Options), CORS preflight handler, request logger, and in-memory rate limiting.
- 🖥️ **SSR & Streamable Hydration**: Ultra-fast `renderToString()` and full HTML5 document generator with automatic XSS escaping and DOM hydration marker injection.
- 🗺️ **Full-Stack Routing**: Radix-style pattern matching with dynamic params, wildcards, hash/history modes, and async route resolution.
- 🛠️ **CLI Tooling (`good`)**: Zero-config project scaffolding with built-in templates (`frontend`, `backend`, `fullstack`), system health auditing (`good doctor`), route auditing (`good routes`), and dev/build servers.

---

## Architecture

GoodyJS is organized into modular subpath exports for optimal tree-shaking:

```
goodyjs
├── .                 → Full framework re-export
├── ./reactivity      → Signals, Computeds, Effects, Batched updates
├── ./ui              → Virtual DOM (h), Component lifecycle, DOM renderer, Hydration
├── ./jsx-runtime     → JSX transform runtime factory
├── ./server          → Native HTTP server instance and route dispatcher
├── ./router          → Radix route matcher and client/server router
├── ./middleware      → Composable onion pipeline and built-in guards
├── ./ssr             → renderToString, renderToDocument, HTML security escaper
└── ./cli             → GoodCli runner, scaffolding templates, system doctor
```

All subpaths include complete TypeScript type definitions (`.d.ts`), source maps, and ESM module targets compatible with Node `>= 18.0.0` and modern browser bundlers.

---

## Installation

Install via npm:

```bash
npm install goodyjs
```

Or install globally to use the CLI executable:

```bash
npm install -g goodyjs
```

You can also run the CLI without installing via `npx`:

```bash
npx goody --help
# or:
npx good --help
```

---

## Quick Start

### 1. Frontend Reactive App

```typescript
import { signal, computed, component, h, render } from 'goodyjs';

const Counter = component(() => {
  const count = signal(0);
  const double = computed(() => count() * 2);

  return h('div', { class: 'counter-card' },
    h('h1', null, 'GoodyJS Reactive App'),
    h('p', null, () => `Current Count: ${count()}`),
    h('p', null, () => `Double: ${double()}`),
    h('div', { class: 'buttons' },
      h('button', { onClick: () => count.update(n => n + 1) }, '+ Increment'),
      h('button', { onClick: () => count.set(0) }, 'Reset')
    )
  );
});

// Mount directly to DOM
render(h(Counter, null), document.getElementById('root')!);
```

### 2. Backend HTTP Service

```typescript
import { createServer, securityHeaders, cors, requestLogger } from 'goodyjs';

const app = createServer();

// Composable onion middlewares
app.use(securityHeaders());
app.use(cors({ origin: '*' }));
app.use(requestLogger());

// RESTful Route handlers
app.get('/api/health', (ctx) => ({
  status: 'healthy',
  timestamp: Date.now(),
  uptime: process.uptime(),
}));

app.get('/api/users/:id', (ctx) => ({
  id: ctx.req.params.id,
  name: `User ${ctx.req.params.id}`,
  query: ctx.req.query,
}));

app.post('/api/echo', async (ctx) => {
  return { received: ctx.req.body };
});

await app.listen({ port: 3000, host: '0.0.0.0' });
console.log('Server running on http://localhost:3000');
```

### 3. Full-Stack SSR with Hydration

```typescript
import { createServer, renderToDocument, signal, h } from 'goodyjs';

const app = createServer();

const App = () => {
  const count = signal(42);
  return h('main', { id: 'app' },
    h('h1', null, 'GoodyJS Server-Side Rendered'),
    h('p', null, () => `Server Rendered Count: ${count()}`)
  );
};

app.get('/', (ctx) => {
  const html = renderToDocument(h(App, null), {
    title: 'GoodyJS Full-Stack SSR',
    meta: { description: 'Rendered with GoodyJS zero-dependency SSR engine' },
    scripts: ['/client.js'],
  });
  ctx.res.html(html);
});

await app.listen({ port: 3000 });
```

---

## CLI Tooling (`goody` / `good`)

GoodyJS includes native CLI binaries `goody` and `good` available upon installing `goodyjs`:

```bash
# Print available commands
goody help   # or: good help

# Scaffold a new project from templates (frontend | backend | fullstack)
goody create my-app --template fullstack

# Run system health and environment diagnostics
goody doctor

# Audit registered route graph and endpoints
goody routes

# Start zero-config development server
goody dev

# Compile application for production
goody build

# Run production server
goody start

# Verify static constraints and zero-dependency guarantees
goody check
```

---

## Module Reference

### `goodyjs/reactivity`

Fine-grained reactive primitives with automatic dependency tracking:

```typescript
import { signal, computed, effect, batch, untrack, createRoot } from 'goodyjs/reactivity';

// 1. Signals
const count = signal(0);
console.log(count());         // Read value (registers dependency in tracking contexts)
count.set(5);                 // Write value (notifies subscribers)
count.update(n => n + 1);     // Functional update

// 2. Computeds (Memoized derivations)
const isEven = computed(() => count() % 2 === 0);

// 3. Effects (Auto-subscribing side effects with cleanup)
const disposeEffect = effect(() => {
  console.log(`Count changed to: ${count()}`);
  return () => console.log('Cleanup before next run');
});

// 4. Batching (Combines multiple mutations into a single flush)
batch(() => {
  count.set(10);
  count.set(20);
});

// 5. Untrack (Read without creating a dependency)
const val = untrack(() => count());

// 6. Reactive Root (Scoped memory teardown)
createRoot((dispose) => {
  effect(() => count());
  // dispose() cleans up all registered child effects
});
```

### `goodyjs/ui`

Lightweight Virtual DOM with fine-grained signal subscriptions:

```typescript
import { h, component, onMount, onCleanup, render, hydrate } from 'goodyjs/ui';

const Timer = component(() => {
  const seconds = signal(0);

  onMount(() => {
    const timer = setInterval(() => seconds.update(n => n + 1), 1000);
    return () => clearInterval(timer);
  });

  onCleanup(() => {
    console.log('Timer component unmounted');
  });

  return h('div', { class: 'timer-box' },
    h('span', null, () => `Elapsed: ${seconds()}s`)
  );
});

// Mount to browser DOM
const unmount = render(h(Timer, null), document.getElementById('root')!);

// Or hydrate server-rendered markup
hydrate(h(Timer, null), document.getElementById('root')!);
```

### `goodyjs/server`

Native HTTP server wrapper around Node's `node:http`:

```typescript
import { createServer } from 'goodyjs/server';

const server = createServer();

server.get('/items', (ctx) => [1, 2, 3]);
server.post('/items', async (ctx) => {
  const item = ctx.req.body;
  return { created: item };
});

await server.listen({ port: 3000, host: '0.0.0.0' });
```

### `goodyjs/middleware`

Composable onion-style middleware engine:

```typescript
import {
  defineMiddleware,
  composeMiddleware,
  securityHeaders,
  cors,
  requestLogger,
  rateLimiter
} from 'goodyjs/middleware';

// Custom Middleware definition
const authMiddleware = defineMiddleware(async (ctx, next) => {
  const token = ctx.req.headers['authorization'];
  if (!token) {
    ctx.res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  await next(); // Downstream pass
  // Post-processing logic (Upstream pass)
});

// Built-in guards
server.use(securityHeaders());
server.use(cors({ origin: 'https://myapp.com', methods: ['GET', 'POST'] }));
server.use(requestLogger());
server.use(rateLimiter({ maxRequests: 100, windowMs: 60000 }));
server.use(authMiddleware);
```

### `goodyjs/router`

Pattern matching with dynamic parameters and query strings:

```typescript
import { createRouter, matchRoutePattern, parseQuery } from 'goodyjs/router';

const router = createRouter({
  routes: [
    { path: '/', handler: () => 'Home Page' },
    { path: '/posts/:slug', handler: (ctx) => `Post: ${ctx.params.slug}` },
    { path: '/docs/*', handler: (ctx) => `Docs: ${ctx.params['*']}` },
  ],
});

const match = matchRoutePattern('/posts/:slug', '/posts/hello-world');
// match.isMatch === true
// match.params === { slug: 'hello-world' }
```

### `goodyjs/ssr`

Blazing fast string rendering and HTML document builder with automatic sanitization:

```typescript
import { renderToString, renderToDocument, escapeHtml } from 'goodyjs/ssr';

// Render VNode tree to HTML string with hydration markers
const htmlString = renderToString(h('div', { class: 'card' }, 'Hello World'));

// Render complete HTML5 document
const fullDocument = renderToDocument(h('div', null, 'Content'), {
  title: 'My GoodyJS App',
  meta: { 'viewport': 'width=device-width, initial-scale=1' },
  initialState: { user: 'Alice', theme: 'dark' },
});

// Escape untrusted strings against XSS
const safe = escapeHtml('<script>alert("hack")</script>');
```

---

## Benchmarks

Measured on Node.js v22 on AMD64 linux container:

### Bundle Sizes (Minified + Gzipped)
| Package / Subpath | Raw Size | Gzipped Size | Budget Target | Status |
|:---|:---:|:---:|:---:|:---:|
| `goodyjs/reactivity` | 1,701 B | **0.75 KB** | < 5 KB | **PASS** |
| `goodyjs/ui` (+ Reactivity) | 6,304 B | **2.25 KB** | < 8 KB | **PASS** |
| `goodyjs/router` | 2,639 B | **1.24 KB** | < 3 KB | **PASS** |
| **Full Client Bundle** | 24,791 B | **8.92 KB** | < 15 KB | **PASS** |

### Execution Throughput
- **Signal Reads / Writes**: 8,784,763 ops/sec (100k operations in 11.38ms)
- **Computed 4-Node Chain**: 486,070 derivations/sec (10k operations in 20.57ms)
- **Batched Updates**: 5,000 rounds with zero wasted effect executions in 10.43ms
- **Middleware Pipeline (3-layer)**: 102,100 passes/sec (10k requests in 97.94ms)
- **SSR `renderToString`**: 8,704 pages/sec (50k DOM nodes rendered in 114.89ms)

Run benchmarks locally anytime:
```bash
npm run benchmark
```

---

## Testing & Quality

GoodyJS includes an exhaustive test suite covering all modules without external testing libraries, using Node's native `node:test` and `node:assert/strict`:

```bash
npm test
```

```
✔ CLI: prints help when no arguments provided
✔ CLI: doctor passes all health checks
✔ CLI: create scaffolds frontend template files
✔ CLI: templates dictionary contains valid templates
✔ Middleware: executes in onion order
✔ Middleware: throws if next() is called multiple times
✔ Middleware: securityHeaders attaches security headers to response
✔ Middleware: cors answers OPTIONS preflight with 204
✔ Middleware: rateLimiter throttles requests after threshold
✔ Reactivity: signal reading, writing, and updating
✔ Reactivity: computed derives value and memoizes properly
✔ Reactivity: effect auto-tracks dependencies and executes on change
✔ Reactivity: effect runs cleanup before next execution and on dispose
✔ Reactivity: batch groups multiple updates into a single effect run
✔ Reactivity: untrack prevents dependency registration
✔ Reactivity: createRoot tears down all child effects
✔ Router: matchRoutePattern handles exact routes
✔ Router: matchRoutePattern extracts dynamic parameters
✔ Router: matchRoutePattern handles wildcard segments
✔ Router: parseQuery parses search parameters properly
✔ Router: createRouter resolves route and loads initial data
✔ Server: registers GET route and simulates request
✔ Server: extracts path parameters and handles POST with body
✔ Server: returns 404 for unmatched paths
✔ Server: handles query parameters and custom headers
✔ SSR: escapeHtml protects against script and tag injection
✔ SSR: renderToString produces HTML with hydration markers
✔ SSR: correctly evaluates reactive signals into static HTML
✔ SSR: handles void elements properly
✔ SSR: renderToDocument wraps output in valid HTML5 document with state
✔ UI: h() creates valid VNode with props and children
✔ UI: h() flattens nested children and skips booleans/null
✔ UI: Fragment unwraps child nodes
✔ UI: component() produces a callable component with props

34 passed, 0 failed
```

---

## Publishing & NPM Scripts

To compile the library for distribution to npm:

```bash
# 1. Build the library (generates dist/ with ESM, .d.ts, maps, syncs packages)
npm run build:package

# 2. Verify test suite
npm test

# 3. Verify types
npm run lint

# 4. Preview the tarball package contents
npm pack --dry-run

# 5. Publish to npm registry
npm publish --access public
```

---

## License

MIT © [dwmk](https://github.com/dwmk) & GoodyJS Maintainers
