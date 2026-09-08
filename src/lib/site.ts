/** Canonical site origin for metadata, sitemap and robots. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:4001'
).replace(/\/$/, '');

/** Locale-prefixed marketing routes (no auth-gated pages). */
export const MARKETING_PATHS = [
  '',
  '/plans',
  '/about',
  '/facilities',
  '/trainers',
  '/contact',
  '/login',
  '/register',
] as const;

export const LOCALES = ['ar', 'en'] as const;
