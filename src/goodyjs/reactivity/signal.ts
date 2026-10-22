import type { Accessor, CleanupFn, Computed, EffectFn, ReactiveNode, Signal } from './types.ts';

let activeObserver: ReactiveNode | null = null;
const observerStack: (ReactiveNode | null)[] = [];

let batchDepth = 0;
const pendingEffects = new Set<ReactiveNode>();

let activeRootCleanups: CleanupFn[] | null = null;

export function untrack<T>(fn: () => T): T {
  observerStack.push(activeObserver);
  activeObserver = null;
  try {
    return fn();
  } finally {
    activeObserver = observerStack.pop() || null;
  }
}

export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<ReactiveNode>();

  const read = (): T => {
    if (activeObserver) {
      subscribers.add(activeObserver);
      activeObserver.dependencies.add(subscribers);
    }
    return value;
  };

  const write = (nextValue: T): void => {
    if (Object.is(value, nextValue)) {
      return;
    }
    value = nextValue;
    notify(subscribers);
  };

  const update = (updater: (prev: T) => T): void => {
    write(updater(value));
  };

  const accessor = (() => read()) as Signal<T>;
  accessor.get = read;
  accessor.set = write;
  accessor.update = update;

  return accessor;
}

export function computed<T>(derive: () => T): Computed<T> {
  let cachedValue: T;
  let isDirty = true;
  const subscribers = new Set<ReactiveNode>();

  const node: ReactiveNode = {
    dependencies: new Set(),
    execute: () => {
      if (!isDirty) {
        isDirty = true;
        notify(subscribers);
      }
    },
  };

  const read = (): T => {
    if (activeObserver) {
      subscribers.add(activeObserver);
      activeObserver.dependencies.add(subscribers);
    }

    if (isDirty) {
      cleanupDependencies(node);
      observerStack.push(activeObserver);
      activeObserver = node;
      try {
        cachedValue = derive();
        isDirty = false;
      } finally {
        activeObserver = observerStack.pop() || null;
      }
    }

    return cachedValue;
  };

  const accessor = (() => read()) as Computed<T>;
  accessor.get = read;
  return accessor;
}

export function effect(run: EffectFn): CleanupFn {
  let cleanupCallback: CleanupFn | void = undefined;
  let isDisposed = false;
  let isRunning = false;

  const node: ReactiveNode = {
    dependencies: new Set(),
    cleanups: [],
    execute: () => {
      if (isDisposed || isRunning) return;

      if (typeof cleanupCallback === 'function') {
        try {
          cleanupCallback();
        } catch (err) {
          console.error('[GoodyJS Reactivity] Error during effect cleanup:', err);
        }
        cleanupCallback = undefined;
      }

      cleanupDependencies(node);

      isRunning = true;
      observerStack.push(activeObserver);
      activeObserver = node;
      try {
        cleanupCallback = run();
      } finally {
        activeObserver = observerStack.pop() || null;
        isRunning = false;
      }
    },
  };

  node.execute();

  const dispose = () => {
    isDisposed = true;
    if (typeof cleanupCallback === 'function') {
      try {
        cleanupCallback();
      } catch (err) {
        console.error('[GoodyJS Reactivity] Error disposing effect:', err);
      }
      cleanupCallback = undefined;
    }
    cleanupDependencies(node);
  };

  if (activeRootCleanups) {
    activeRootCleanups.push(dispose);
  }

  return dispose;
}

export function batch<T>(run: () => T): T {
  batchDepth++;
  try {
    return run();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      flushPendingEffects();
    }
  }
}

export function createRoot<T>(fn: (dispose: () => void) => T): T {
  const previousCleanups = activeRootCleanups;
  const cleanups: CleanupFn[] = [];
  activeRootCleanups = cleanups;

  const dispose = () => {
    for (const cleanup of cleanups) {
      try {
        cleanup();
      } catch (err) {
        console.error('[GoodyJS Reactivity] Error in root disposal:', err);
      }
    }
    cleanups.length = 0;
  };

  try {
    return fn(dispose);
  } finally {
    activeRootCleanups = previousCleanups;
  }
}

function notify(subscribers: Set<ReactiveNode>): void {
  const subs = Array.from(subscribers);
  for (const sub of subs) {
    if (batchDepth > 0) {
      pendingEffects.add(sub);
    } else {
      sub.execute();
    }
  }
}

function flushPendingEffects(): void {
  let iterations = 0;
  const MAX_ITERATIONS = 1000;

  while (pendingEffects.size > 0) {
    iterations++;
    if (iterations > MAX_ITERATIONS) {
      pendingEffects.clear();
      throw new Error(
        '[GoodyJS Reactivity] Circular dependency or runaway reactive loop detected! Maximum batch iterations exceeded (1000).'
      );
    }

    const effects = Array.from(pendingEffects);
    pendingEffects.clear();
    for (const eff of effects) {
      eff.execute();
    }
  }
}

function cleanupDependencies(node: ReactiveNode): void {
  for (const depSet of node.dependencies) {
    depSet.delete(node);
  }
  node.dependencies.clear();
}
