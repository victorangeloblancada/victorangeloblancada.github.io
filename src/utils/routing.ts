import type { CollectionEntry } from 'astro:content';
import { normalizeTagSlug } from './tags';

export type BlogEntry = CollectionEntry<'blog'>;

/**
 * Derive exact Jekyll slug from a collection entry ID (`YYYY-MM-DD-slug`).
 * Honors `slugOverride` and strips trailing hyphens (matching Jekyll behavior on `nanogenmo-2020-`).
 */
export function getPostSlug(entry: BlogEntry): string {
  if (entry.data.slugOverride) {
    return entry.data.slugOverride;
  }
  const baseName = entry.id.replace(/\.(md|mdx)$/i, '');
  const withoutDate = baseName.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  return withoutDate.replace(/-+$/, '');
}

/**
 * Derive date components in UTC/local-date-preserving form from front-matter `date`.
 * Front-matter `YYYY-MM-DD` parsed via `z.coerce.date()` stores midnight UTC.
 */
export function getPostDateParts(date: Date): {
  year: string;
  month: string;
  day: string;
  iso: string;
} {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return { year, month, day, iso: `${year}-${month}-${day}` };
}

/**
 * Canonical historical URL: `/blog/YYYY/MM/DD/slug.html`
 */
export function getPostUrl(entry: BlogEntry): string {
  const { year, month, day } = getPostDateParts(entry.data.date);
  const slug = getPostSlug(entry);
  return `/blog/${year}/${month}/${day}/${slug}.html`;
}

export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(date);
}

export function isPublishedPost(entry: BlogEntry): boolean {
  return entry.data.draft !== true;
}

export function sortPostsDesc(posts: BlogEntry[]): BlogEntry[] {
  return [...posts].sort(
    (a, b) => b.data.date.getTime() - a.data.date.getTime(),
  );
}

export function getRelatedPosts(
  current: BlogEntry,
  allPublished: BlogEntry[],
  limit = 3,
): BlogEntry[] {
  const currentTags = new Set(current.data.tags.map(normalizeTagSlug));
  return allPublished
    .filter((p) => p.id !== current.id)
    .map((p) => {
      const overlap = p.data.tags.reduce(
        (acc, t) => acc + (currentTags.has(normalizeTagSlug(t)) ? 1 : 0),
        0,
      );
      return { post: p, overlap };
    })
    .filter((item) => item.overlap > 0)
    .sort(
      (a, b) =>
        b.overlap - a.overlap ||
        b.post.data.date.getTime() - a.post.data.date.getTime(),
    )
    .slice(0, limit)
    .map((item) => item.post);
}
