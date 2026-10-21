export {
  signal,
  computed,
  effect,
  batch,
  untrack,
  createRoot,
} from './reactivity/signal.ts';
export type {
  Signal,
  Computed,
  Accessor,
  CleanupFn,
  EffectFn,
  ReactiveNode,
} from './reactivity/types.ts';

export {
  component,
  onMount,
  onCleanup,
} from './ui/component.ts';
export {
  h,
  jsx,
  jsxs,
  Fragment,
  isVNode,
} from './ui/h.ts';
export {
  render,
  hydrate,
} from './ui/dom.ts';
export type {
  VNode,
  VNodeProps,
  VNodeChild,
  ComponentFn,
  RenderResult,
  LifecycleHooks,
} from './ui/types.ts';

export {
  createRouter,
  matchRoutePattern,
  parseQuery,
} from './router/router.ts';
export type {
  RouterInstance,
  RouteRecord,
  RouteContext,
  RouteMatch,
} from './router/types.ts';

export {
  createServer,
} from './server/server.ts';
export type {
  GoodServerInstance,
  RouteHandler,
  ServerRoute,
  ListenOptions,
} from './server/types.ts';

export {
  defineMiddleware,
  composeMiddleware,
} from './middleware/middleware.ts';
export {
  securityHeaders,
  requestLogger,
  cors,
  rateLimiter,
} from './middleware/builtin.ts';
export type {
  GoodRequest,
  GoodResponse,
  MiddlewareContext,
  MiddlewareHandler,
  NextFunction,
} from './middleware/types.ts';

export {
  renderToString,
  renderToDocument,
  escapeHtml,
} from './ssr/ssr.ts';
export type {
  RenderToStringOptions,
  DocumentOptions,
} from './ssr/ssr.ts';

export {
  GoodCli,
} from './cli/cli.ts';
export {
  TEMPLATES,
} from './cli/templates.ts';
