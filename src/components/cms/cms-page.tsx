'use client';

import type { ReactNode } from 'react';
import { useCmsPage } from '@/lib/cms';
import { CmsSections } from './sections';

/** Renders a published CMS page; shows `fallback` when the page has no content yet. */
export function CmsPage({ slug, fallback }: { slug: string; fallback: ReactNode }) {
  const { data, isLoading } = useCmsPage(slug);

  if (isLoading) {
    return <div className="container py-24 text-sm text-muted-foreground">…</div>;
  }
  if (!data || !data.sections?.length) {
    return <>{fallback}</>;
  }
  return <CmsSections sections={data.sections} />;
}
