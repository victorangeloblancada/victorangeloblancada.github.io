import { siteConfig } from '../config/site';

export function GET() {
  const target = '/search/';
  const canonical = new URL(target, siteConfig.siteUrl).toString();
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${target}" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${canonical}" />
    <title>Redirecting to Search</title>
  </head>
  <body>
    <p>Search has moved to <a href="${target}">${target}</a>.</p>
  </body>
</html>
`;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
