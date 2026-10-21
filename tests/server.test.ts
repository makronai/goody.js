import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../src/goodyjs/server/server.ts';

test('Server: registers GET route and simulates request', async () => {
  const app = createServer();

  app.get('/api/health', (ctx) => {
    ctx.res.json({ status: 'ok', framework: 'GoodyJS' });
  });

  const res = await app.simulateRequest('GET', '/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
  assert.equal(res.body.framework, 'GoodyJS');
});

test('Server: extracts path parameters and handles POST with body', async () => {
  const app = createServer();

  app.post('/api/projects/:id', (ctx) => {
    const projectId = ctx.req.params.id;
    const body = ctx.req.body;
    ctx.res.status(201).json({
      created: true,
      id: projectId,
      title: body.title,
    });
  });

  const res = await app.simulateRequest('POST', '/api/projects/p_99', {
    headers: { 'content-type': 'application/json' },
    body: { title: 'First Release' },
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.created, true);
  assert.equal(res.body.id, 'p_99');
  assert.equal(res.body.title, 'First Release');
});

test('Server: returns 404 for unmatched paths', async () => {
  const app = createServer();

  app.get('/api/items', () => []);

  const res = await app.simulateRequest('GET', '/api/unknown');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Not Found');
});

test('Server: handles query parameters and custom headers', async () => {
  const app = createServer();

  app.get('/api/search', (ctx) => {
    ctx.res.header('X-Custom-Engine', 'GoodyJS-Native');
    return {
      query: ctx.req.query.q,
      page: ctx.req.query.page,
    };
  });

  const res = await app.simulateRequest('GET', '/api/search?q=signals&page=2');
  assert.equal(res.status, 200);
  assert.equal(res.headers['x-custom-engine'], 'GoodyJS-Native');
  assert.equal(res.body.query, 'signals');
  assert.equal(res.body.page, '2');
});
