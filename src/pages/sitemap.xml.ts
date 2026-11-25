import type { APIContext } from 'astro';
import { siteConfig } from '../config/site';

export function GET(context: APIContext) {
  const site = (context.site ?? new URL(siteConfig.siteUrl)).toString().replace(/\/$/, '');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${site}/sitemap-0.xml</loc>
  </sitemap>
</sitemapindex>
`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
