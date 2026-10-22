export type Accessor<T> = () => T;

export interface Signal<T> {
  (): T;
  get(): T;
  set(newValue: T): void;
  update(updater: (prev: T) => T): void;
}

export interface Computed<T> {
  (): T;
  get(): T;
}

export type CleanupFn = () => void;
export type EffectFn = () => void | CleanupFn;

export interface ReactiveNode {
  execute(): void;
  dependencies: Set<Set<ReactiveNode>>;
  cleanups?: CleanupFn[];
}
