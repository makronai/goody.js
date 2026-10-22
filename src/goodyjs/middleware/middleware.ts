import type { MiddlewareContext, MiddlewareHandler } from './types.ts';

export function defineMiddleware<State = Record<string, any>>(
  fn: MiddlewareHandler<State>
): MiddlewareHandler<State> {
  return fn;
}

export function composeMiddleware<State = Record<string, any>>(
  middlewares: MiddlewareHandler<State>[]
): (ctx: MiddlewareContext<State>) => Promise<void> {
  return function executeChain(ctx: MiddlewareContext<State>): Promise<void> {
    let index = -1;

    function dispatch(i: number): Promise<void> {
      if (i <= index) {
        return Promise.reject(new Error('[GoodyJS Middleware] next() called multiple times in a single middleware!'));
      }
      index = i;

      const fn = middlewares[i];
      if (!fn) {
        return Promise.resolve();
      }

      try {
        let nextCalled = false;
        const next = () => {
          nextCalled = true;
          return dispatch(i + 1);
        };

        const result = fn(ctx, next);
        return Promise.resolve(result);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return dispatch(0);
  };
}
