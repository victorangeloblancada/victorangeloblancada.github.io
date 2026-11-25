import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkJekyllCompat from './src/plugins/remark-jekyll-compat.ts';

/** Permalink paths (/blog/YYYY/MM/DD/slug) of posts flagged draft: true. */
function draftPostPaths() {
  const dir = path.resolve('src/content/blog');
  const out = new Set();
  for (const file of fs.readdirSync(dir)) {
    if (!/\.mdx?$/i.test(file)) continue;
    const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
    const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
    if (!/^draft:\s*true\s*$/im.test(fm)) continue;
    const d = fm.match(/^date:\s*["']?(\d{4})-(\d{2})-(\d{2})/m);
    const slug = file.replace(/\.mdx?$/i, '').replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/-+$/, '');
    if (d) out.add('/blog/' + d[1] + '/' + d[2] + '/' + d[3] + '/' + slug);
  }
  return out;
}
const DRAFT_PATHS = draftPostPaths();

function moveSubdirIndexToHtml(parentDir) {
  if (!fs.existsSync(parentDir)) return;
  for (const entry of fs.readdirSync(parentDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const subDir = path.join(parentDir, entry.name);
    const indexHtml = path.join(subDir, 'index.html');
    const targetHtml = path.join(parentDir, `${entry.name}.html`);
    if (fs.existsSync(indexHtml)) {
      fs.renameSync(indexHtml, targetHtml);
      try {
        fs.rmdirSync(subDir);
      } catch {
        // Leave directory if non-empty
      }
    }
  }
}

function preserveLegacyHtmlIntegration() {
  return {
    name: 'preserve-legacy-html',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const outDir = fileURLToPath(dir);

        // 1. Move /blog/YYYY/MM/DD/<slug>/index.html -> /blog/YYYY/MM/DD/<slug>.html
        const blogDir = path.join(outDir, 'blog');
        if (fs.existsSync(blogDir)) {
          for (const year of fs.readdirSync(blogDir, { withFileTypes: true })) {
            if (!year.isDirectory() || !/^\d{4}$/.test(year.name)) continue;
            const yearDir = path.join(blogDir, year.name);
            for (const month of fs.readdirSync(yearDir, { withFileTypes: true })) {
              if (!month.isDirectory() || !/^\d{2}$/.test(month.name)) continue;
              const monthDir = path.join(yearDir, month.name);
              for (const day of fs.readdirSync(monthDir, { withFileTypes: true })) {
                if (!day.isDirectory() || !/^\d{2}$/.test(day.name)) continue;
                moveSubdirIndexToHtml(path.join(monthDir, day.name));
              }
            }
          }
        }

        // 2. Move /pages/<slug>/index.html -> /pages/<slug>.html
        moveSubdirIndexToHtml(path.join(outDir, 'pages'));

        // 3. Copy /blog/archive/index.html -> /blog.html
        const archiveHtml = path.join(outDir, 'blog', 'archive', 'index.html');
        const legacyBlogHtml = path.join(outDir, 'blog.html');
        if (fs.existsSync(archiveHtml)) {
          fs.copyFileSync(archiveHtml, legacyBlogHtml);
        }
      },
    },
  };
}

const labDarkShikiTheme = {
  name: 'lab-dark',
  type: 'dark',
  colors: {
    'editor.background': '#1B3040',
    'editor.foreground': '#E6E0D4',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: { foreground: '#81969A', fontStyle: 'italic' },
    },
    {
      scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.control'],
      settings: { foreground: '#C792B8' },
    },
    {
      scope: ['string', 'string.quoted', 'constant.other.symbol'],
      settings: { foreground: '#A9B98C' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#80B9D0' },
    },
    {
      scope: ['constant.numeric', 'constant.language', 'constant.character'],
      settings: { foreground: '#D8B56D' },
    },
    {
      scope: ['variable', 'identifier', 'entity.name.type', 'support.class'],
      settings: { foreground: '#E6E0D4' },
    },
    {
      scope: ['keyword.operator', 'punctuation.accessor', 'punctuation.separator'],
      settings: { foreground: '#D58A6A' },
    },
  ],
};

export default defineConfig({
  site: 'https://victorangeloblancada.github.io',
  base: '/',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  markdown: {
    remarkPlugins: [
      remarkJekyllCompat,
      [remarkMath, { singleDollarTextMath: false }],
    ],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: {
        light: 'github-light-default',
        dark: labDarkShikiTheme,
      },
      wrap: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        if (
          page.endsWith('/404.html') ||
          page.endsWith('/404') ||
          page.endsWith('/404/') ||
          page.includes('/search.html')
        ) {
          return false;
        }
        const pagePath = new URL(page).pathname.replace(/\/$/, '').replace(/\.html$/, '');
        if (DRAFT_PATHS.has(pagePath)) return false;
        const tagMatch = page.match(/\/blog\/tag\/([^/]+)\/?$/);
        if (tagMatch) {
          const seg = decodeURIComponent(tagMatch[1]);
          if (seg !== seg.toLowerCase() || /\s/.test(seg) || seg === 'gifs') {
            return false;
          }
        }
        return true;
      },
      serialize(item) {
        if (/\/blog\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/.test(item.url)) {
          return { ...item, url: item.url.replace(/\/$/, '.html') };
        }
        if (/\/pages\/[^/]+\/$/.test(item.url)) {
          return { ...item, url: item.url.replace(/\/$/, '.html') };
        }
        if (/\/blog\/archive\/$/.test(item.url)) {
          return { ...item, url: item.url.replace(/\/blog\/archive\/$/, '/blog.html') };
        }
        return item;
      },
    }),
    preserveLegacyHtmlIntegration(),
  ],
});
