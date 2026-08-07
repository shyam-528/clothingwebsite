import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './error';

export interface AuthPayload {
  userId: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Verifies the JWT in `Authorization: Bearer <token>` and attaches the
 * decoded payload to `req.user`. Throws 401 if missing/invalid.
 */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError(401, 'Authentication required'));
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
};

/** Requires admin role. Must be used after requireAuth. */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError(403, 'Admin access required'));
  }
  next();
};

/** Optional auth: attaches req.user if token valid, but doesn't 401. */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, env.jwtSecret) as AuthPayload;
  } catch {
    /* ignore */
  }
  next();
};
