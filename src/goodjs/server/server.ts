import { composeMiddleware } from '../middleware/middleware.ts';
import type { GoodRequest, GoodResponse, MiddlewareContext, MiddlewareHandler } from '../middleware/types.ts';
import { matchRoutePattern, parseQuery } from '../router/router.ts';
import type { GoodServerInstance, ListenOptions, RouteHandler, ServerRoute } from './types.ts';

export function createServer(): GoodServerInstance {
  const middlewares: MiddlewareHandler[] = [];
  const routes: ServerRoute[] = [];

  function addRoute(method: string, pattern: string, handler: RouteHandler) {
    routes.push({ method: method.toUpperCase(), pattern, handler });
  }

  const instance: GoodServerInstance = {
    use(mw: MiddlewareHandler) {
      middlewares.push(mw);
      return instance;
    },
    get(path: string, handler: RouteHandler) {
      addRoute('GET', path, handler);
      return instance;
    },
    post(path: string, handler: RouteHandler) {
      addRoute('POST', path, handler);
      return instance;
    },
    put(path: string, handler: RouteHandler) {
      addRoute('PUT', path, handler);
      return instance;
    },
    patch(path: string, handler: RouteHandler) {
      addRoute('PATCH', path, handler);
      return instance;
    },
    delete(path: string, handler: RouteHandler) {
      addRoute('DELETE', path, handler);
      return instance;
    },
    all(path: string, handler: RouteHandler) {
      addRoute('*', path, handler);
      return instance;
    },

    async handle(rawReq: any, rawRes: any): Promise<void> {
      const urlString = rawReq.url || '/';
      const [pathname, search] = urlString.split('?');
      const query = parseQuery(search || '');

      const cookieHeader = rawReq.headers?.cookie || '';
      const cookies: Record<string, string> = {};
      if (cookieHeader) {
        for (const pair of cookieHeader.split(';')) {
          const [k, v] = pair.trim().split('=');
          if (k) cookies[k] = decodeURIComponent(v || '');
        }
      }

      const rawBody = await readRequestBody(rawReq);
      let parsedBody = rawBody;
      const contentType = rawReq.headers?.['content-type'] || '';
      if (typeof rawBody === 'string' && contentType.includes('application/json')) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          parsedBody = rawBody;
        }
      }

      const req: GoodRequest = {
        method: (rawReq.method || 'GET').toUpperCase(),
        url: urlString,
        path: pathname || '/',
        headers: rawReq.headers || {},
        query,
        params: {},
        body: parsedBody,
        rawBody,
        cookies,
        requestId: 'req_' + Math.random().toString(36).substring(2, 9),
      };

      let statusCode = 200;
      const resHeaders: Record<string, string | string[]> = {};
      let responseBody: any = null;
      let isSent = false;

      const res: GoodResponse = {
        statusCode: 200,
        headers: resHeaders,
        body: null,
        isSent: false,
        status(code: number) {
          statusCode = code;
          res.statusCode = code;
          return res;
        },
        header(name: string, value: string | string[]) {
          resHeaders[name.toLowerCase()] = value;
          return res;
        },
        json(data: any) {
          if (isSent) return;
          isSent = true;
          res.isSent = true;
          resHeaders['content-type'] = 'application/json; charset=utf-8';
          responseBody = JSON.stringify(data);
          res.body = responseBody;
          finalizeResponse(rawRes, statusCode, resHeaders, responseBody);
        },
        text(str: string) {
          if (isSent) return;
          isSent = true;
          res.isSent = true;
          if (!resHeaders['content-type']) {
            resHeaders['content-type'] = 'text/plain; charset=utf-8';
          }
          responseBody = str;
          res.body = responseBody;
          finalizeResponse(rawRes, statusCode, resHeaders, responseBody);
        },
        html(htmlStr: string) {
          if (isSent) return;
          isSent = true;
          res.isSent = true;
          resHeaders['content-type'] = 'text/html; charset=utf-8';
          responseBody = htmlStr;
          res.body = responseBody;
          finalizeResponse(rawRes, statusCode, resHeaders, responseBody);
        },
        redirect(url: string, status = 302) {
          if (isSent) return;
          isSent = true;
          res.isSent = true;
          statusCode = status;
          res.statusCode = status;
          resHeaders['location'] = url;
          finalizeResponse(rawRes, statusCode, resHeaders, '');
        },
      };

      const ctx: MiddlewareContext = {
        req,
        res,
        state: {},
        rawRes,
        logger: {
          info: console.log,
          warn: console.warn,
          error: console.error,
        },
      };

      let matchedRoute: ServerRoute | null = null;
      for (const route of routes) {
        if (route.method === '*' || route.method === req.method) {
          const { match, params } = matchRoutePattern(route.pattern, req.path);
          if (match) {
            matchedRoute = route;
            req.params = params;
            break;
          }
        }
      }

      const fullChain = [...middlewares];
      if (matchedRoute) {
        const handler = matchedRoute.handler;
        fullChain.push(async (c, next) => {
          const result = await handler(c);
          if (!c.res.isSent && result !== undefined) {
            if (typeof result === 'object' && result !== null) {
              c.res.json(result);
            } else {
              c.res.text(String(result));
            }
          }
          await next();
        });
      } else {
        fullChain.push(async (c) => {
          if (!c.res.isSent) {
            c.res.status(404).json({
              error: 'Not Found',
              message: `Cannot ${c.req.method} ${c.req.path}`,
            });
          }
        });
      }

      try {
        const runPipeline = composeMiddleware(fullChain);
        await runPipeline(ctx);
        if (!isSent && !res.isSent) {
          res.status(statusCode).text(responseBody || '');
        }
      } catch (err: any) {
        console.error('[GoodJS Server] Unhandled Request Error:', err);
        if (!isSent) {
          res.status(500).json({
            error: 'Internal Server Error',
            message: err?.message || 'An unexpected error occurred',
          });
        }
      }
    },

    async simulateRequest(
      method: string,
      url: string,
      options: { headers?: Record<string, string>; body?: any } = {}
    ) {
      let finalStatus = 200;
      let finalHeaders: Record<string, any> = {};
      let finalBody: any = null;

      const mockRawReq = {
        method,
        url,
        headers: options.headers || {},
        _mockBody: options.body,
      };

      const mockRawRes = {
        writeHead(status: number, headers: Record<string, any>) {
          finalStatus = status;
          finalHeaders = { ...headers };
        },
        end(data: any) {
          finalBody = data;
        },
      };

      await instance.handle(mockRawReq, mockRawRes);

      let parsedBody = finalBody;
      if (typeof finalBody === 'string' && finalHeaders['content-type']?.includes('application/json')) {
        try {
          parsedBody = JSON.parse(finalBody);
        } catch {
          parsedBody = finalBody;
        }
      }

      return {
        status: finalStatus,
        headers: finalHeaders,
        body: parsedBody,
      };
    },

    async listen(options: ListenOptions = {}) {
      const port = options.port || 3000;
      const host = options.host || '0.0.0.0';

      const http = await import('node:http');
      const server = http.createServer((rawReq, rawRes) => {
        instance.handle(rawReq, rawRes);
      });

      return new Promise((resolve, reject) => {
        server.listen(port, host, () => {
          resolve({
            port,
            server,
            close: () => {
              return new Promise<void>((resClose) => {
                server.close(() => resClose());
              });
            },
          });
        });
        server.on('error', reject);
      });
    },
  };

  return instance;
}

function finalizeResponse(
  rawRes: any,
  status: number,
  headers: Record<string, string | string[]>,
  body: any
): void {
  if (!rawRes) return;
  if (typeof rawRes.writeHead === 'function') {
    rawRes.writeHead(status, headers);
  }
  if (typeof rawRes.end === 'function') {
    rawRes.end(body);
  }
}

async function readRequestBody(rawReq: any): Promise<string> {
  if (rawReq._mockBody !== undefined) {
    return typeof rawReq._mockBody === 'string'
      ? rawReq._mockBody
      : JSON.stringify(rawReq._mockBody);
  }

  if (typeof rawReq.on !== 'function') {
    return '';
  }

  return new Promise((resolve, reject) => {
    let data = '';
    const MAX_SIZE = 1024 * 1024;

    rawReq.on('data', (chunk: any) => {
      data += chunk;
      if (data.length > MAX_SIZE) {
        reject(new Error('[GoodJS Server] Payload Too Large (max 1MB)'));
      }
    });

    rawReq.on('end', () => resolve(data));
    rawReq.on('error', reject);
  });
}
