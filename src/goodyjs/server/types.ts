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

export interface GoodyServerInstance {
  use(middleware: MiddlewareHandler): GoodyServerInstance;
  get(path: string, handler: RouteHandler): GoodyServerInstance;
  post(path: string, handler: RouteHandler): GoodyServerInstance;
  put(path: string, handler: RouteHandler): GoodyServerInstance;
  patch(path: string, handler: RouteHandler): GoodyServerInstance;
  delete(path: string, handler: RouteHandler): GoodyServerInstance;
  all(path: string, handler: RouteHandler): GoodyServerInstance;
  handle(rawReq: any, rawRes: any): Promise<void>;
  simulateRequest(
    method: string,
    url: string,
    options?: { headers?: Record<string, string>; body?: any }
  ): Promise<{ status: number; headers: Record<string, any>; body: any }>;
  listen(options?: ListenOptions): Promise<{ port: number; close: () => Promise<void>; server?: Server }>;
}

export type GoodServerInstance = GoodyServerInstance;
