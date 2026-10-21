import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToString, escapeHtml, renderToDocument } from '../src/goodyjs/ssr/ssr.ts';
import { h } from '../src/goodyjs/ui/h.ts';
import { signal } from '../src/goodyjs/reactivity/signal.ts';
import { component } from '../src/goodyjs/ui/component.ts';

test('SSR: escapeHtml protects against script and tag injection', () => {
  const unsafe = '<script>alert("xss")</script>&"\'';
  const safe = escapeHtml(unsafe);
  assert.equal(safe, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&amp;&quot;&#39;');
});

test('SSR: renderToString produces HTML with hydration markers', () => {
  const vnode = h('div', { class: 'card', id: 'app' },
    h('h1', null, 'Welcome to GoodyJS'),
    h('p', null, 'Zero dependencies.')
  );

  const html = renderToString(vnode);
  assert.ok(html.includes('<div data-good-id="g-1" class="card" id="app">'));
  assert.ok(html.includes('<h1 data-good-id="g-2">Welcome to GoodyJS</h1>'));
  assert.ok(html.includes('<p data-good-id="g-3">Zero dependencies.</p>'));
});

test('SSR: correctly evaluates reactive signals into static HTML', () => {
  const counter = signal(42);
  const vnode = h('span', { class: 'count' }, () => `Current: ${counter()}`);

  const html = renderToString(vnode);
  assert.ok(html.includes('Current: 42'));
});

test('SSR: handles void elements properly', () => {
  const vnode = h('form', null,
    h('input', { type: 'text', name: 'email', value: 'ada@example.com' }),
    h('br', null)
  );

  const html = renderToString(vnode);
  assert.ok(html.includes('<input data-good-id="g-2" type="text" name="email" value="ada@example.com" />'));
  assert.ok(html.includes('<br data-good-id="g-3" />'));
});

test('SSR: renderToDocument wraps output in valid HTML5 document with state', () => {
  const doc = renderToDocument({
    title: 'GoodyJS Showcase',
    meta: [{ name: 'description', content: 'Ultra-lightweight framework' }],
    bodyHtml: '<h1 data-good-id="g-1">Hello SSR</h1>',
    initialState: { user: 'developer' },
    clientScriptUrl: '/client/main.js',
  });

  assert.ok(doc.startsWith('<!doctype html>'));
  assert.ok(doc.includes('<title>GoodyJS Showcase</title>'));
  assert.ok(doc.includes('<meta name="description" content="Ultra-lightweight framework" />'));
  assert.ok(doc.includes('<div id="root"><h1 data-good-id="g-1">Hello SSR</h1></div>'));
  assert.ok(doc.includes('id="__GOODJS_STATE__"'));
  assert.ok(doc.includes('src="/client/main.js"'));
});
