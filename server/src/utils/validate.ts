import { ZodSchema } from 'zod';
import { AppError } from '../middleware/error';

/** Validates `req.body` against a Zod schema, throws 400 on failure. */
export const validate = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new AppError(400, message || 'Invalid input');
  }
  return result.data;
};
