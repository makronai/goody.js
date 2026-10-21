import test from 'node:test';
import assert from 'node:assert/strict';
import { matchRoutePattern, parseQuery, createRouter } from '../src/goodjs/router/router.ts';
import { component } from '../src/goodjs/ui/component.ts';
import { h } from '../src/goodjs/ui/h.ts';

test('Router: matchRoutePattern handles exact routes', () => {
  const m1 = matchRoutePattern('/', '/');
  assert.equal(m1.match, true);

  const m2 = matchRoutePattern('/about', '/about');
  assert.equal(m2.match, true);

  const m3 = matchRoutePattern('/about', '/contact');
  assert.equal(m3.match, false);
});

test('Router: matchRoutePattern extracts dynamic parameters', () => {
  const m = matchRoutePattern('/users/:id/posts/:slug', '/users/99/posts/goodjs-launch');
  assert.equal(m.match, true);
  assert.equal(m.params.id, '99');
  assert.equal(m.params.slug, 'goodjs-launch');
});

test('Router: matchRoutePattern handles wildcard segments', () => {
  const m = matchRoutePattern('/docs/*', '/docs/api/v1/endpoints');
  assert.equal(m.match, true);
  assert.equal(m.params.wildcard, 'api/v1/endpoints');
});

test('Router: parseQuery parses search parameters properly', () => {
  const q1 = parseQuery('?tab=benchmarks&sort=asc&count=100');
  assert.equal(q1.tab, 'benchmarks');
  assert.equal(q1.sort, 'asc');
  assert.equal(q1.count, '100');

  const q2 = parseQuery('');
  assert.deepEqual(q2, {});
});

test('Router: createRouter resolves route and loads initial data', async () => {
  const HomePage = component(() => h('div', null, 'Home'));
  const UserPage = component<{ data: any }>((props) => h('div', null, `User: ${props.data?.name}`));

  const router = createRouter(
    [
      { path: '/', component: HomePage },
      {
        path: '/users/:id',
        component: UserPage,
        loader: async (ctx) => ({ name: `User_${ctx.params.id}` }),
      },
    ],
    '/users/42?mode=full'
  );

  await router.ready;

  assert.equal(router.currentPath(), '/users/42');
  assert.equal(router.params().id, '42');
  assert.equal(router.query().mode, 'full');

  const routeMatch = router.currentRoute();
  assert.ok(routeMatch);
  assert.equal(routeMatch?.data?.name, 'User_42');

  await router.navigate('/');
  assert.equal(router.currentPath(), '/');
  assert.deepEqual(router.params(), {});

  router.destroy();
});
