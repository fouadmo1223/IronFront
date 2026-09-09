import 'server-only';
import { QueryClient, dehydrate, type DehydratedState } from '@tanstack/react-query';
import type { CmsPageData, SiteContent } from './cms';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Plain server-side fetch (no axios / no auth) with a short ISR window. */
async function getJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const body = (await res.json()) as { data?: T };
    return (body?.data ?? null) as T | null;
  } catch {
    return null;
  }
}

export const fetchCmsPage = (slug: string) => getJson<CmsPageData>(`/cms/public/pages/${slug}`);
export const fetchSiteContent = () => getJson<SiteContent>('/cms/public/site');

/**
 * Prefetch the CMS queries a marketing page needs into a fresh QueryClient and
 * return its dehydrated state, so the client components render the real content
 * on the first paint instead of a loading skeleton. Pass `site: true` for pages
 * that also read `useSiteContent()` (home, contact).
 */
export async function dehydrateCms(
  slug: string | null,
  opts: { site?: boolean } = {},
): Promise<DehydratedState> {
  const qc = new QueryClient();
  const jobs: Promise<unknown>[] = [];
  if (slug) {
    jobs.push(
      qc.prefetchQuery({ queryKey: ['cms', 'public', slug], queryFn: () => fetchCmsPage(slug) }),
    );
  }
  if (opts.site) {
    jobs.push(
      qc.prefetchQuery({ queryKey: ['cms', 'public', 'site'], queryFn: () => fetchSiteContent() }),
    );
  }
  await Promise.all(jobs);
  return dehydrate(qc);
}
