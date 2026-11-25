import { getCollection, render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { APIContext } from 'astro';
import { siteConfig } from '../config/site';
import { getPostUrl, isPublishedPost, sortPostsDesc } from '../utils/routing';

/**
 * Atom feed at the legacy `/feed.xml` URL.
 *
 * The Jekyll site (jekyll-feed) published an Atom 1.0 feed with full post content
 * and entry ids of the form `<site>/blog/YYYY/MM/DD/<slug>` (no `.html`). Both are
 * preserved so that existing subscribers do not see duplicated or truncated entries.
 */
const FEED_LIMIT = 20;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET(context: APIContext) {
  const site = (context.site ?? new URL(siteConfig.siteUrl)).toString().replace(/\/$/, '');
  const posts = sortPostsDesc((await getCollection('blog')).filter(isPublishedPost)).slice(0, FEED_LIMIT);
  const container = await AstroContainer.create();

  const entries: string[] = [];
  for (const post of posts) {
    const { Content } = await render(post);
    const html = (await container.renderToString(Content)).replace(/]]>/g, ']]]]><![CDATA[>');
    const url = `${site}${getPostUrl(post)}`;
    const date = post.data.date.toISOString();
    const updated = (post.data.updatedDate ?? post.data.date).toISOString();
    const categories = Array.from(new Set(post.data.tags))
      .map((t) => `<category term="${esc(t)}" />`)
      .join('');
    entries.push(
      `<entry>` +
        `<title type="html">${esc(post.data.title)}</title>` +
        `<link href="${url}" rel="alternate" type="text/html" title="${esc(post.data.title)}" />` +
        `<published>${date}</published><updated>${updated}</updated>` +
        `<id>${url.replace(/\.html$/, '')}</id>` +
        `<content type="html" xml:base="${url}"><![CDATA[${html}]]></content>` +
        `<author><name>${esc(siteConfig.author.name)}</name></author>` +
        categories +
        (post.data.description ? `<summary type="html">${esc(post.data.description)}</summary>` : '') +
        `</entry>`,
    );
  }

  const xml =
    `<?xml version="1.0" encoding="utf-8"?>` +
    `<feed xmlns="http://www.w3.org/2005/Atom">` +
    `<link href="${site}/feed.xml" rel="self" type="application/atom+xml" />` +
    `<link href="${site}/" rel="alternate" type="text/html" />` +
    `<updated>${posts[0]?.data.date.toISOString() ?? new Date().toISOString()}</updated>` +
    `<id>${site}/feed.xml</id>` +
    `<title type="html">${esc(siteConfig.title)}</title>` +
    `<subtitle>${esc(siteConfig.description)}</subtitle>` +
    entries.join('') +
    `</feed>\n`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
