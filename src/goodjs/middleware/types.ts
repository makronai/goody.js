import type { ServerResponse } from 'node:http';

export interface GoodRequest {
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

export interface GoodResponse {
  statusCode: number;
  headers: Record<string, string | string[]>;
  body: any;
  isSent: boolean;
  status(code: number): GoodResponse;
  header(name: string, value: string | string[]): GoodResponse;
  json(data: any): void;
  text(str: string): void;
  html(htmlStr: string): void;
  redirect(url: string, status?: number): void;
}

export interface MiddlewareContext<State = Record<string, any>> {
  req: GoodRequest;
  res: GoodResponse;
  state: State;
  rawRes?: ServerResponse;
  logger: {
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
}

export type NextFunction = () => Promise<void>;

export type MiddlewareHandler<State = Record<string, any>> = (
  ctx: MiddlewareContext<State>,
  next: NextFunction
) => Promise<void> | void;
