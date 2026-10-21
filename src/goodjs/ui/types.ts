import type { Accessor } from '../reactivity/types.ts';

export type ChildValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | VNode
  | Accessor<any>
  | ChildValue[];

export interface VNodeProps {
  [key: string]: any;
  key?: string | number;
  children?: ChildValue[];
  ref?: (el: HTMLElement | SVGElement) => void;
}

export type ComponentFn<P = any> = (props: P) => VNodeChild;

export interface VNode {
  tag: string | ComponentFn | symbol;
  props: VNodeProps;
  children: ChildValue[];
  key?: string | number;
  _isVNode: true;
}

export type VNodeChild = VNode | string | number | boolean | null | undefined | Accessor<any> | VNodeChild[];

export interface LifecycleHooks {
  mounts: (() => void)[];
  cleanups: (() => void)[];
}

export interface RenderResult {
  node: Node;
  unmount: () => void;
}
