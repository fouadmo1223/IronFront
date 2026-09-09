import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from './api';

export interface CmsSection {
  key: string;
  type: string;
  enabled: boolean;
  order: number;
  data: Record<string, unknown>;
}

export interface CmsPageData {
  slug: string;
  titleAr: string;
  titleEn: string;
  sections: CmsSection[];
}

export interface SiteContent {
  brand?: Record<string, string>;
  contact?: Record<string, string>;
  social?: Record<string, string>;
  /** Opening hours — new shape `{ schedule: ScheduleBlock[] }`, or legacy keys. */
  hours?: Record<string, unknown>;
  /** Image overrides for marketing surfaces (see lib/images.ts `gymImages`). */
  media?: Record<string, unknown>;
  /** Per-locale message overrides, deep-merged over the i18n catalog at runtime. */
  copy?: { en?: Record<string, unknown>; ar?: Record<string, unknown> };
  navItems?: Array<Record<string, string>>;
  footer?: Record<string, unknown>;
}

export type Weekday = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
export const WEEK_ORDER: Weekday[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

export interface ScheduleBlock {
  audience: 'men' | 'women';
  days: Weekday[];
  open: string;
  close: string;
}

/** Resolve `site.hours` (new `{ schedule }` shape or legacy keys) into blocks. */
export function resolveSchedule(hours: Record<string, unknown> | undefined): ScheduleBlock[] {
  const raw = (hours ?? {}) as Record<string, unknown>;
  const list = raw.schedule;
  if (Array.isArray(list)) {
    return list
      .map((b): ScheduleBlock => {
        const r = (b ?? {}) as Record<string, unknown>;
        return {
          audience: r.audience === 'women' ? 'women' : 'men',
          days: WEEK_ORDER.filter((d) => Array.isArray(r.days) && (r.days as string[]).includes(d)),
          open: String(r.open ?? ''),
          close: String(r.close ?? ''),
        };
      })
      .filter((b) => b.open || b.close);
  }
  const legacy: Array<[string, ScheduleBlock['audience'], Weekday[]]> = [
    ['menWeekday', 'men', ['sun', 'mon', 'tue', 'wed', 'thu']],
    ['menWeekend', 'men', ['fri', 'sat']],
    ['womenWeekday', 'women', ['sun', 'mon', 'tue', 'wed', 'thu']],
    ['womenWeekend', 'women', ['fri', 'sat']],
  ];
  return legacy
    .filter(([k]) => raw[k])
    .map(([k, audience, days]) => {
      const [open, close] = String(raw[k]).split(/\s*[—–-]\s*/);
      return { audience, days, open: open ?? '', close: close ?? '' };
    });
}

/** "Sat–Mon، Wed" — compress consecutive days, localised via `dayName`. */
export function formatDayRange(days: Weekday[], dayName: (d: Weekday) => string): string {
  const idx = days
    .map((d) => WEEK_ORDER.indexOf(d))
    .filter((n) => n >= 0)
    .sort((a, b) => a - b);
  if (idx.length === 0) return '';
  const runs: Array<[number, number]> = [];
  for (const i of idx) {
    const last = runs[runs.length - 1];
    if (last && i === last[1] + 1) last[1] = i;
    else runs.push([i, i]);
  }
  return runs
    .map(([a, b]) =>
      a === b
        ? dayName(WEEK_ORDER[a])
        : `${dayName(WEEK_ORDER[a])}–${dayName(WEEK_ORDER[b])}`,
    )
    .join('، ');
}

export function useCmsPage(slug: string) {
  return useQuery({
    queryKey: ['cms', 'public', slug],
    queryFn: () => unwrap<CmsPageData>(api.get(`/cms/public/pages/${slug}`)),
    retry: 0,
  });
}

/**
 * Content for one section of a CMS page, by section `type`. Returns `{}` while
 * loading or when the section is absent/disabled — callers fall back to i18n
 * with `pick(data.foo, fallback)`.
 */
export function useSectionData(slug: string, type: string): Record<string, unknown> {
  const { data } = useCmsPage(slug);
  const section = data?.sections?.find((s) => s.type === type && s.enabled !== false);
  return (section?.data as Record<string, unknown>) ?? {};
}

/**
 * Whether a section type should render. A section is hidden only when it exists
 * in the CMS page and is explicitly disabled; sections not configured in the CMS
 * (and the whole page while loading) default to visible.
 */
export function useSectionEnabled(slug: string, type: string): boolean {
  const { data } = useCmsPage(slug);
  const matches = data?.sections?.filter((s) => s.type === type) ?? [];
  // Not configured (or still loading) → visible. Otherwise visible if any
  // section of this type is enabled — mirrors useSectionData, which resolves to
  // the first enabled section of the type.
  return matches.length === 0 || matches.some((s) => s.enabled !== false);
}

/** First non-empty string among the candidates. */
export function pick(...vals: Array<unknown>): string {
  for (const v of vals) if (typeof v === 'string' && v.trim()) return v;
  return '';
}

export const FALLBACK_SITE: SiteContent = {
  brand: { nameEn: 'IRON GYM', nameAr: 'آيرون جيم', accentColor: '#f2591f' },
  contact: {
    phones: ['+20 2 1234 5678', '+20 100 123 4567'],
    whatsapp: '+20 100 000 0000',
    email: 'hello@irongym.app',
    addressEn: 'Tahrir St., Downtown, Cairo',
    addressAr: 'شارع التحرير، وسط البلد، القاهرة',
  } as unknown as Record<string, string>,
  social: {
    instagram: 'https://instagram.com/irongym',
    facebook: 'https://facebook.com/irongym',
  },
  hours: {
    menWeekday: '05:00 — 24:00',
    menWeekend: '07:00 — 22:00',
    womenWeekday: '09:00 — 21:00',
    womenWeekend: '10:00 — 18:00',
  },
};

export function useSiteContent() {
  return useQuery({
    queryKey: ['cms', 'public', 'site'],
    queryFn: async () => {
      try {
        const s = await unwrap<SiteContent>(api.get('/cms/public/site'));
        return s && (s.contact || s.social) ? s : FALLBACK_SITE;
      } catch {
        return FALLBACK_SITE;
      }
    },
    placeholderData: FALLBACK_SITE,
  });
}
