import type { ComponentFn, LifecycleHooks, VNodeChild } from './types.ts';

let currentLifecycle: LifecycleHooks | null = null;

export function onMount(fn: () => void): void {
  if (currentLifecycle) {
    currentLifecycle.mounts.push(fn);
  } else {
    fn();
  }
}

export function onCleanup(fn: () => void): void {
  if (currentLifecycle) {
    currentLifecycle.cleanups.push(fn);
  }
}

export function component<P = {}>(fn: (props: P) => VNodeChild): ComponentFn<P> {
  const wrapped: ComponentFn<P> = (props: P) => {
    return fn(props);
  };
  return wrapped;
}

export function runWithLifecycle<T>(
  hooks: LifecycleHooks,
  fn: () => T
): T {
  const prev = currentLifecycle;
  currentLifecycle = hooks;
  try {
    return fn();
  } finally {
    currentLifecycle = prev;
  }
}
