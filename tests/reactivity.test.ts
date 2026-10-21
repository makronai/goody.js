import test from 'node:test';
import assert from 'node:assert/strict';
import { signal, computed, effect, batch, untrack, createRoot } from '../src/goodjs/reactivity/signal.ts';

test('Reactivity: signal reading, writing, and updating', () => {
  const count = signal(10);
  assert.equal(count(), 10);
  assert.equal(count.get(), 10);

  count.set(25);
  assert.equal(count(), 25);

  count.update((n) => n + 5);
  assert.equal(count(), 30);
});

test('Reactivity: computed derives value and memoizes properly', () => {
  const count = signal(2);
  let computeCount = 0;

  const double = computed(() => {
    computeCount++;
    return count() * 2;
  });

  assert.equal(double(), 4);
  assert.equal(computeCount, 1);

  assert.equal(double(), 4);
  assert.equal(computeCount, 1);

  count.set(5);
  assert.equal(double(), 10);
  assert.equal(computeCount, 2);
});

test('Reactivity: effect auto-tracks dependencies and executes on change', () => {
  const name = signal('GoodJS');
  const runs: string[] = [];

  const dispose = effect(() => {
    runs.push(name());
  });

  assert.deepEqual(runs, ['GoodJS']);

  name.set('GoodJS v0.1');
  assert.deepEqual(runs, ['GoodJS', 'GoodJS v0.1']);

  dispose();

  name.set('GoodJS v0.2');
  assert.deepEqual(runs, ['GoodJS', 'GoodJS v0.1']);
});

test('Reactivity: effect runs cleanup before next execution and on dispose', () => {
  const trigger = signal(1);
  const cleanups: number[] = [];

  const dispose = effect(() => {
    const val = trigger();
    return () => {
      cleanups.push(val);
    };
  });

  assert.deepEqual(cleanups, []);

  trigger.set(2);
  assert.deepEqual(cleanups, [1]);

  trigger.set(3);
  assert.deepEqual(cleanups, [1, 2]);

  dispose();
  assert.deepEqual(cleanups, [1, 2, 3]);
});

test('Reactivity: batch groups multiple updates into a single effect run', () => {
  const a = signal(1);
  const b = signal(10);
  let effectRuns = 0;

  effect(() => {
    a();
    b();
    effectRuns++;
  });

  assert.equal(effectRuns, 1);

  a.set(2);
  b.set(20);
  assert.equal(effectRuns, 3);

  batch(() => {
    a.set(3);
    b.set(30);
    a.set(4);
  });

  assert.equal(effectRuns, 4);
  assert.equal(a(), 4);
  assert.equal(b(), 30);
});

test('Reactivity: untrack prevents dependency registration', () => {
  const tracked = signal('A');
  const untracked = signal('X');
  const values: string[] = [];

  effect(() => {
    const t = tracked();
    const u = untrack(() => untracked());
    values.push(`${t}:${u}`);
  });

  assert.deepEqual(values, ['A:X']);

  untracked.set('Y');
  assert.deepEqual(values, ['A:X']);

  tracked.set('B');
  assert.deepEqual(values, ['A:X', 'B:Y']);
});

test('Reactivity: createRoot tears down all child effects', () => {
  const count = signal(0);
  let runs = 0;

  let disposeRoot: () => void = () => {};
  createRoot((dispose) => {
    disposeRoot = dispose;
    effect(() => {
      count();
      runs++;
    });
  });

  assert.equal(runs, 1);
  count.set(1);
  assert.equal(runs, 2);

  disposeRoot();
  count.set(2);
  assert.equal(runs, 2);
});
