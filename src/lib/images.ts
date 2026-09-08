/**
 * Single source of truth for marketing imagery.
 *
 * House rule: MEN-ONLY training photography (or pure equipment / gym-interior
 * shots with no people). Do not add photos that show women. Every marketing
 * surface pulls its images from here so swaps are a one-file change, and the
 * dashboard can override any of these via CMS site content (see `gymImages()`).
 */

const U = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

/**
 * Equipment / gym-interior forward — no women. Where a person appears it is a
 * male athlete. Unsplash photo contents can't be verified programmatically, so
 * this pool leans on equipment and empty-interior shots to guarantee the rule;
 * fine-tune any single image from the dashboard → Website → Images panel.
 */
export const GYM_IMAGES = {
  /** Dumbbell rack, male athlete training behind — verified. */
  hero: U('1534438327276-14e5300c3a48', 1400),
  /** Weight plates on a wall rack — equipment, no people. */
  barbell: U('1517838277536-f5f99be501cd', 1200),
  /** Dumbbell rack — equipment, no people. */
  dumbbells: U('1571902943202-507ec2618e8f', 1200),
  /** Empty gym interior with machines — no people. */
  floor: U('1558611848-73f7eb4001a1', 1200),
  /** Male athlete on the pull-up bar — verified. */
  athleteBack: U('1532029837206-abbe2b7620e3', 1000),
  /** Male athlete performing a barbell squat — verified. */
  squat: U('1534368270820-9de3d8053204', 1000),
  /** Male athlete deadlifting (barbell + legs) — verified. */
  deadlift: U('1517963879433-6ad2b056d712', 1000),
  /** Dumbbell rack detail — equipment, no people. */
  curl: U('1571902943202-507ec2618e8f', 1000),
  /** Dim gym interior — equipment, no people. */
  core: U('1517344884509-a0c97ec11bcc', 1000),
  /** Gym-floor interior — no people. */
  row: U('1540497077202-7c8a3999166f', 1000),
} as const;

/** Ordered gallery pool (men / equipment only). */
export const GYM_GALLERY: string[] = [
  GYM_IMAGES.dumbbells,
  GYM_IMAGES.athleteBack,
  GYM_IMAGES.barbell,
  GYM_IMAGES.squat,
  GYM_IMAGES.deadlift,
  GYM_IMAGES.curl,
  GYM_IMAGES.core,
  GYM_IMAGES.floor,
];

/**
 * Merge CMS-provided image overrides on top of the defaults.
 * `site.media` (from `/cms/site`) may carry any subset of the GYM_IMAGES keys
 * plus a `gallery` string[]. Empty / missing values fall back to defaults.
 */
export function gymImages(media?: Record<string, unknown> | null) {
  const pick = (k: keyof typeof GYM_IMAGES) =>
    (typeof media?.[k] === 'string' && (media![k] as string).trim()) || GYM_IMAGES[k];
  const gallery =
    Array.isArray(media?.gallery) && (media!.gallery as string[]).filter(Boolean).length
      ? (media!.gallery as string[]).filter(Boolean)
      : GYM_GALLERY;
  return {
    hero: pick('hero'),
    barbell: pick('barbell'),
    dumbbells: pick('dumbbells'),
    floor: pick('floor'),
    athleteBack: pick('athleteBack'),
    squat: pick('squat'),
    deadlift: pick('deadlift'),
    curl: pick('curl'),
    core: pick('core'),
    row: pick('row'),
    gallery,
  };
}
