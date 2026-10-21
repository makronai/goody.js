import type { Server } from 'node:http';
import type { GoodRequest, GoodResponse, MiddlewareContext, MiddlewareHandler } from '../middleware/types.ts';

export type RouteHandler = (
  ctx: MiddlewareContext
) => Promise<any> | any;

export interface ServerRoute {
  method: string;
  pattern: string;
  handler: RouteHandler;
}

export interface ListenOptions {
  port?: number;
  host?: string;
}

export interface GoodServerInstance {
  use(middleware: MiddlewareHandler): GoodServerInstance;
  get(path: string, handler: RouteHandler): GoodServerInstance;
  post(path: string, handler: RouteHandler): GoodServerInstance;
  put(path: string, handler: RouteHandler): GoodServerInstance;
  patch(path: string, handler: RouteHandler): GoodServerInstance;
  delete(path: string, handler: RouteHandler): GoodServerInstance;
  all(path: string, handler: RouteHandler): GoodServerInstance;
  handle(rawReq: any, rawRes: any): Promise<void>;
  simulateRequest(
    method: string,
    url: string,
    options?: { headers?: Record<string, string>; body?: any }
  ): Promise<{ status: number; headers: Record<string, any>; body: any }>;
  listen(options?: ListenOptions): Promise<{ port: number; close: () => Promise<void>; server?: Server }>;
}
