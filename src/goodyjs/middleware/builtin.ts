import type { MiddlewareHandler } from './types.ts';
import { defineMiddleware } from './middleware.ts';

export interface SecurityHeadersOptions {
  csp?: string;
  hsts?: boolean;
  frameOptions?: 'DENY' | 'SAMEORIGIN';
}

export function securityHeaders(options: SecurityHeadersOptions = {}): MiddlewareHandler {
  return defineMiddleware(async (ctx, next) => {
    ctx.res.header('X-Content-Type-Options', 'nosniff');
    ctx.res.header('X-Frame-Options', options.frameOptions || 'SAMEORIGIN');
    ctx.res.header('X-XSS-Protection', '1; mode=block');
    ctx.res.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (options.hsts !== false) {
      ctx.res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    if (options.csp) {
      ctx.res.header('Content-Security-Policy', options.csp);
    }

    await next();
  });
}

export interface LoggerOptions {
  logFn?: (msg: string) => void;
}

export function requestLogger(options: LoggerOptions = {}): MiddlewareHandler {
  const log = options.logFn || console.log;

  return defineMiddleware(async (ctx, next) => {
    const start = performance.now();
    try {
      await next();
    } finally {
      const duration = (performance.now() - start).toFixed(2);
      log(`[GoodyJS Server] ${ctx.req.method} ${ctx.req.path} -> ${ctx.res.statusCode} (${duration}ms) [${ctx.req.requestId}]`);
    }
  });
}

export interface CorsOptions {
  origin?: string | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  maxAge?: number;
}

export function cors(options: CorsOptions = {}): MiddlewareHandler {
  const allowedOrigin = options.origin || '*';
  const allowedMethods = (options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']).join(', ');
  const allowedHeaders = (options.allowedHeaders || ['Content-Type', 'Authorization', 'X-Requested-With']).join(', ');

  return defineMiddleware(async (ctx, next) => {
    ctx.res.header('Access-Control-Allow-Origin', typeof allowedOrigin === 'string' ? allowedOrigin : '*');
    ctx.res.header('Access-Control-Allow-Methods', allowedMethods);
    ctx.res.header('Access-Control-Allow-Headers', allowedHeaders);

    if (ctx.req.method === 'OPTIONS') {
      ctx.res.status(204).text('');
      return;
    }

    await next();
  });
}

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export function rateLimiter(options: RateLimitOptions = {}): MiddlewareHandler {
  const windowMs = options.windowMs || 60_000;
  const max = options.max || 100;
  const hits = new Map<string, { count: number; resetAt: number }>();

  return defineMiddleware(async (ctx, next) => {
    const key = (ctx.req.headers['x-forwarded-for'] as string) || 'local';
    const now = Date.now();
    const clientRecord = hits.get(key);

    if (!clientRecord || now > clientRecord.resetAt) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
    } else {
      clientRecord.count++;
      if (clientRecord.count > max) {
        ctx.res.status(429).json({
          error: 'Too Many Requests',
          message: options.message || 'Rate limit exceeded. Please try again later.',
        });
        return;
      }
    }

    await next();
  });
}
