import { Request, Response, NextFunction } from 'express';

/**
 * Standard error shape returned to clients.
 * AppError lets controllers throw with an HTTP status and a safe message.
 */
export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export const notFound = (req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message });
  }

  // Mongoose validation
  if ((err as any).name === 'ValidationError') {
    const messages = Object.values((err as any).errors).map((e: any) => e.message);
    return res.status(400).json({ message: 'Validation failed', errors: messages });
  }

  // Duplicate key (unique constraint)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `Duplicate ${field}` });
  }

  // CastError (bad ObjectId)
  if ((err as any).name === 'CastError') {
    return res.status(400).json({ message: `Invalid ${(err as any).path}` });
  }

  console.error('[error]', err);
  res.status(500).json({ message: 'Internal server error' });
};
