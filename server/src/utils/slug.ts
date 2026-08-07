import slugify from 'slugify';

export const toSlug = (text: string): string =>
  slugify(text, { lower: true, strict: true, trim: true });
