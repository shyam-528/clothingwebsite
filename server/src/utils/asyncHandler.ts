import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express handler so thrown errors reach `next()` (and the
 * error middleware). We re-declare a slightly looser signature than the
 * upstream `express-async-handler` package to allow handlers that return
 * a value (Express doesn't care — void is fine too).
 */
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<unknown>;

export const asyncHandler = (fn: AsyncHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;