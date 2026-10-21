import { signal, computed } from '../reactivity/signal.ts';
import { component } from '../ui/component.ts';
import { h } from '../ui/h.ts';
import type { RouteContext, RouteMatch, RouteRecord, RouterInstance } from './types.ts';

export function parseQuery(queryString: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!queryString) return result;

  const clean = queryString.startsWith('?') ? queryString.slice(1) : queryString;
  const pairs = clean.split('&');
  for (const pair of pairs) {
    if (!pair) continue;
    const [key, value] = pair.split('=');
    result[decodeURIComponent(key)] = decodeURIComponent(value || '');
  }
  return result;
}

export function matchRoutePattern(
  pattern: string,
  pathname: string
): { match: boolean; params: Record<string, string> } {
  const params: Record<string, string> = {};

  if (pattern === '*' || pattern === '/*') {
    return { match: true, params };
  }

  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = pathname.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length && !pattern.endsWith('*')) {
    return { match: false, params };
  }

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
    } else if (patternPart === '*') {
      params['wildcard'] = pathParts.slice(i).join('/');
      return { match: true, params };
    } else if (patternPart !== pathPart) {
      return { match: false, params };
    }
  }

  return { match: true, params };
}

export function createRouter(
  routes: RouteRecord[],
  initialPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/'
): RouterInstance {
  const [initialPathname, initialSearch] = initialPath.split('?');
  const initialQuery = parseQuery(initialSearch || '');
  let initialParams: Record<string, string> = {};

  for (const route of routes) {
    const { match, params } = matchRoutePattern(route.path, initialPathname || '/');
    if (match) {
      initialParams = params;
      break;
    }
  }

  const pathSignal = signal(initialPathname || '/');
  const querySignal = signal(initialQuery);
  const paramsSignal = signal<Record<string, string>>(initialParams);
  const loaderDataSignal = signal<any>(null);
  const activeRouteSignal = signal<RouteMatch | null>(null);

  async function resolveRoute(fullPath: string) {
    const [pathname, search] = fullPath.split('?');
    const query = parseQuery(search || '');

    for (const route of routes) {
      const { match, params } = matchRoutePattern(route.path, pathname || '/');
      if (match) {
        let loadedData: any = null;
        if (route.loader) {
          const ctx: RouteContext = {
            path: pathname,
            params,
            query,
          };
          loadedData = await route.loader(ctx);
        }

        pathSignal.set(pathname || '/');
        querySignal.set(query);
        paramsSignal.set(params);
        loaderDataSignal.set(loadedData);

        const matchRecord: RouteMatch = {
          route,
          params,
          query,
          data: loadedData,
        };
        activeRouteSignal.set(matchRecord);
        return;
      }
    }

    pathSignal.set(pathname || '/');
    querySignal.set(query);
    paramsSignal.set({});
    loaderDataSignal.set(null);
    activeRouteSignal.set(null);
  }

  const readyPromise = resolveRoute(initialPath);

  let popstateHandler: (() => void) | null = null;
  if (typeof window !== 'undefined') {
    popstateHandler = () => {
      resolveRoute(window.location.pathname + window.location.search);
    };
    window.addEventListener('popstate', popstateHandler);
  }

  const navigate = async (to: string, options?: { replace?: boolean }) => {
    if (typeof window !== 'undefined') {
      if (options?.replace) {
        window.history.replaceState({}, '', to);
      } else {
        window.history.pushState({}, '', to);
      }
    }
    await resolveRoute(to);
  };

  const RouterView = component(() => {
    return () => {
      const match = activeRouteSignal();
      if (!match) {
        return h('div', { class: 'goodyjs-not-found' }, '404 - Page Not Found');
      }

      const Component = match.route.component;
      return h(Component, {
        params: match.params,
        query: match.query,
        data: match.data,
      });
    };
  });

  return {
    currentPath: pathSignal,
    currentRoute: activeRouteSignal,
    params: paramsSignal,
    query: querySignal,
    navigate,
    ready: readyPromise,
    RouterView,
    destroy: () => {
      if (typeof window !== 'undefined' && popstateHandler) {
        window.removeEventListener('popstate', popstateHandler);
      }
    },
  };
}
