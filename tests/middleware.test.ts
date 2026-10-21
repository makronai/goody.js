import test from 'node:test';
import assert from 'node:assert/strict';
import { defineMiddleware, composeMiddleware } from '../src/goodjs/middleware/middleware.ts';
import { securityHeaders, cors, rateLimiter } from '../src/goodjs/middleware/builtin.ts';
import { createServer } from '../src/goodjs/server/server.ts';

test('Middleware: executes in onion order', async () => {
  const steps: string[] = [];

  const mw1 = defineMiddleware(async (ctx, next) => {
    steps.push('mw1-before');
    await next();
    steps.push('mw1-after');
  });

  const mw2 = defineMiddleware(async (ctx, next) => {
    steps.push('mw2-before');
    await next();
    steps.push('mw2-after');
  });

  const app = createServer();
  app.use(mw1);
  app.use(mw2);
  app.get('/test', () => {
    steps.push('handler');
    return { ok: true };
  });

  await app.simulateRequest('GET', '/test');

  assert.deepEqual(steps, [
    'mw1-before',
    'mw2-before',
    'handler',
    'mw2-after',
    'mw1-after',
  ]);
});

test('Middleware: throws if next() is called multiple times', async () => {
  const badMiddleware = defineMiddleware(async (ctx, next) => {
    await next();
    await next();
  });

  const composed = composeMiddleware([badMiddleware]);
  const dummyCtx: any = { req: {}, res: {}, state: {} };

  await assert.rejects(
    async () => {
      await composed(dummyCtx);
    },
    {
      message: /next\(\) called multiple times/,
    }
  );
});

test('Middleware: securityHeaders attaches security headers to response', async () => {
  const app = createServer();
  app.use(securityHeaders({ csp: "default-src 'self'" }));
  app.get('/secure', () => 'secure content');

  const res = await app.simulateRequest('GET', '/secure');
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
  assert.equal(res.headers['content-security-policy'], "default-src 'self'");
});

test('Middleware: cors answers OPTIONS preflight with 204', async () => {
  const app = createServer();
  app.use(cors({ origin: 'https://example.com' }));
  app.get('/api/data', () => ({ ok: true }));

  const res = await app.simulateRequest('OPTIONS', '/api/data');
  assert.equal(res.status, 204);
  assert.equal(res.headers['access-control-allow-origin'], 'https://example.com');
});

test('Middleware: rateLimiter throttles requests after threshold', async () => {
  const app = createServer();
  app.use(rateLimiter({ max: 2, windowMs: 10_000 }));
  app.get('/limited', () => 'ok');

  const r1 = await app.simulateRequest('GET', '/limited');
  assert.equal(r1.status, 200);

  const r2 = await app.simulateRequest('GET', '/limited');
  assert.equal(r2.status, 200);

  const r3 = await app.simulateRequest('GET', '/limited');
  assert.equal(r3.status, 429);
  assert.equal(r3.body.error, 'Too Many Requests');
});
