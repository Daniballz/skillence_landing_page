import type { Request, Response, NextFunction } from 'express';
import { env } from '../lib/env';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Route not found' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const message = err instanceof Error ? err.message : 'Unknown error';
  if (!env.IS_PROD) console.error('[error]', err);
  res.status(500).json({
    error: 'Internal server error',
    ...(env.IS_PROD ? {} : { detail: message }),
  });
}
