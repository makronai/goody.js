import type { ServerResponse } from 'node:http';

export interface GoodyRequest {
  method: string;
  url: string;
  path: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string>;
  params: Record<string, string>;
  body: any;
  rawBody?: string;
  cookies: Record<string, string>;
  requestId: string;
}
export type GoodRequest = GoodyRequest;

export interface GoodyResponse {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: any;
  isSent: boolean;
  status(code: number): GoodyResponse;
  header(name: string, value: string | string[]): GoodyResponse;
  json(data: any): void;
  text(str: string): void;
  html(htmlStr: string): void;
  redirect(url: string, status?: number): void;
}
export type GoodResponse = GoodyResponse;

export interface MiddlewareContext<State = Record<string, any>> {
  req: GoodyRequest;
  res: GoodyResponse;
  state: State;
  rawRes?: ServerResponse;
  logger: {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
}
export type GoodyMiddlewareContext<State = Record<string, any>> = MiddlewareContext<State>;

export type NextFunction = () => Promise<void>;

export type MiddlewareHandler<State = Record<string, any>> = (
  ctx: MiddlewareContext<State>,
  next: NextFunction
) => Promise<void> | void;
