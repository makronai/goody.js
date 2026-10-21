import type { Accessor } from '../reactivity/types.ts';
import type { ComponentFn, VNodeChild } from '../ui/types.ts';

export interface RouteRecord {
  path: string;
  component: ComponentFn<any>;
  loader?: (ctx: RouteContext) => Promise<any> | any;
  meta?: Record<string, any>;
}

export interface RouteContext {
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  data?: any;
}

export interface RouterInstance {
  currentPath: Accessor<string>;
  currentRoute: Accessor<RouteMatch | null>;
  params: Accessor<Record<string, string>>;
  query: Accessor<Record<string, string>>;
  navigate: (to: string, options?: { replace?: boolean }) => Promise<void>;
  ready: Promise<void>;
  RouterView: ComponentFn<{}>;
  destroy: () => void;
}

export interface RouteMatch {
  route: RouteRecord;
  params: Record<string, string>;
  query: Record<string, string>;
  data: any;
}
