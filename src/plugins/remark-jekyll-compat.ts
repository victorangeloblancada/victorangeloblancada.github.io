import fs from 'node:fs';
import path from 'node:path';

interface MdastNode {
  type: string;
  value?: string;
  url?: string;
  alt?: string | null;
  title?: string | null;
  lang?: string | null;
  meta?: string | null;
  children?: MdastNode[];
  data?: {
    hName?: string;
    hProperties?: Record<string, unknown>;
  };
}

let cachedPostUrlMap: Map<string, string> | null = null;

function buildPostUrlMap(): Map<string, string> {
  if (cachedPostUrlMap) return cachedPostUrlMap;
  const map = new Map<string, string>();
  const blogDir = path.resolve(process.cwd(), 'src/content/blog');
  if (!fs.existsSync(blogDir)) {
    return map;
  }
  for (const file of fs.readdirSync(blogDir)) {
    if (!/\.(md|mdx)$/i.test(file)) continue;
    const stem = file.replace(/\.(md|mdx)$/i, '');
    const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
    const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fm = fmMatch ? fmMatch[1] : '';
    const dateMatch = fm.match(/^date:\s*["']?(\d{4})-(\d{2})-(\d{2})/m);
    const slugOverrideMatch = fm.match(/^slugOverride:\s*["']?([^\r\n"']+)/m);
    const fnDateMatch = stem.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
    const year = dateMatch?.[1] ?? fnDateMatch?.[1] ?? '';
    const month = dateMatch?.[2] ?? fnDateMatch?.[2] ?? '';
    const day = dateMatch?.[3] ?? fnDateMatch?.[3] ?? '';
    const slug =
      slugOverrideMatch?.[1]?.trim() ??
      (fnDateMatch?.[4] ?? stem).replace(/-+$/, '');
    if (year && month && day && slug) {
      map.set(stem, `/blog/${year}/${month}/${day}/${slug}.html`);
    }
  }
  cachedPostUrlMap = map;
  return map;
}

/**
 * Deterministic AsciiMath-to-LaTeX translator tailored to all 79 formulas
 * in `2022-03-20-finance-from-first-principles.md`.
 */
export function asciiMathToTex(input: string): string {
  let s = input.trim().replace(/\u2212/g, '-');

  // Preserve `\text{...}` segments while translating `text(...)`
  const textSlots: string[] = [];
  s = s.replace(/\\text\{([^}]*)\}/g, (_m, inner: string) => {
    const idx = textSlots.push(`\\text{${inner}}`) - 1;
    return `__TEXSLOT_${idx}__`;
  });
  s = s.replace(/\btext\(([^)]*)\)/g, (_m, inner: string) => {
    const idx = textSlots.push(`\\text{${inner}}`) - 1;
    return `__TEXSLOT_${idx}__`;
  });

  // Replace Greek/operator tokens cleanly without gluing adjacent words
  s = s.replace(/sigma_/g, '\\sigma_');
  s = s.replace(/mu_/g, '\\mu_');
  s = s.replace(/sum_/g, '\\sum_');
  s = s.replace(/overline\{/g, '\\overline{');
  s = s.replace(/sqrt\{/g, '\\sqrt{');
  s = s.replace(/\blog\b/g, '\\log');
  s = s.replace(/\blog_/g, '\\log_');
  s = s.replace(/plog/g, 'p\\log');
  // Specific finance post token `amu_x` / `bmu_y`
  s = s.replace(/\bamu_/g, 'a\\mu_').replace(/\bbmu_/g, 'b\\mu_');
  // Convert `targ et` artifact inside subscript
  s = s.replace(/targ et/g, '\\text{target}');

  // Convert `_(...)` and `^(...)` into braced `_{...}` and `^{...}`
  s = convertGroupScripts(s, '_');
  s = convertGroupScripts(s, '^');

  // Convert AsciiMath fractions `A / B` into `\frac{A}{B}`
  s = convertFractions(s);

  // Clean `*` multiplication
  s = s.replace(/\s*\*\s*/g, ' \\cdot ');

  // Restore text slots
  s = s.replace(/__TEXSLOT_(\d+)__/g, (_m, idxStr: string) => {
    return textSlots[Number(idxStr)] ?? '';
  });

  return s.replace(/\s{2,}/g, ' ').trim();
}

function findMatchingParen(s: string, openIdx: number, openCh: string, closeCh: string): number {
  let depth = 0;
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === openCh) depth++;
    else if (s[i] === closeCh) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function convertGroupScripts(s: string, marker: '_' | '^'): string {
  let out = '';
  let i = 0;
  while (i < s.length) {
    if (s[i] === marker && s[i + 1] === '(') {
      const end = findMatchingParen(s, i + 1, '(', ')');
      if (end !== -1) {
        const inner = convertGroupScripts(s.slice(i + 2, end), marker);
        out += `${marker}{${inner}}`;
        i = end + 1;
        continue;
      }
    }
    out += s[i];
    i++;
  }
  return out;
}

function stripOuterParens(expr: string): string {
  const trimmed = expr.trim();
  if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
    if (findMatchingParen(trimmed, 0, '(', ')') === trimmed.length - 1) {
      return trimmed.slice(1, -1).trim();
    }
  }
  return trimmed;
}

function readLeftOperand(s: string, slashIdx: number): { start: number; expr: string } {
  let i = slashIdx - 1;
  while (i >= 0 && s[i] === ' ') i--;
  if (i < 0) return { start: slashIdx, expr: '' };
  if (s[i] === ')' || s[i] === '}') {
    const close = s[i];
    const open = close === ')' ? '(' : '{';
    let depth = 0;
    for (let j = i; j >= 0; j--) {
      if (s[j] === close) depth++;
      else if (s[j] === open) {
        depth--;
        if (depth === 0) {
          // Include preceding function name / command if attached (e.g. \log(...) or \sum_{...}^{...}(...))
          let k = j - 1;
          while (k >= 0 && /[A-Za-z0-9_\\^{}]/.test(s[k])) k--;
          return { start: k + 1, expr: s.slice(k + 1, i + 1) };
        }
      }
    }
  }
  let j = i;
  while (j >= 0 && !/[\s=+\-[\],*]/.test(s[j])) {
    if (s[j] === '(' || s[j] === '{') break;
    j--;
  }
  return { start: j + 1, expr: s.slice(j + 1, i + 1) };
}

function readRightOperand(s: string, slashIdx: number): { end: number; expr: string } {
  let i = slashIdx + 1;
  while (i < s.length && s[i] === ' ') i++;
  if (i >= s.length) return { end: slashIdx + 1, expr: '' };

  let exprEnd = i;
  if (s[i] === '(' || s[i] === '{') {
    const open = s[i];
    const close = open === '(' ? ')' : '}';
    const match = findMatchingParen(s, i, open, close);
    exprEnd = match !== -1 ? match + 1 : s.length;
    // Consume trailing ^... or _... attached to denominator group e.g. (1+r)^n or (1+r)^{np}
    while (exprEnd < s.length && (s[exprEnd] === '^' || s[exprEnd] === '_')) {
      exprEnd++;
      if (s[exprEnd] === '{' || s[exprEnd] === '(') {
        const o = s[exprEnd];
        const c = o === '{' ? '}' : ')';
        const m = findMatchingParen(s, exprEnd, o, c);
        exprEnd = m !== -1 ? m + 1 : exprEnd + 1;
      } else {
        while (exprEnd < s.length && /[A-Za-z0-9]/.test(s[exprEnd])) exprEnd++;
      }
    }
    return { end: exprEnd, expr: s.slice(i, exprEnd) };
  }

  // Handle `\log(...)` or identifier token
  while (exprEnd < s.length && !/[\s=+\-[\],*)]/.test(s[exprEnd])) {
    if (s[exprEnd] === '(') {
      const m = findMatchingParen(s, exprEnd, '(', ')');
      if (m !== -1) {
        exprEnd = m + 1;
        continue;
      }
    }
    if (s[exprEnd] === '{') {
      const m = findMatchingParen(s, exprEnd, '{', '}');
      if (m !== -1) {
        exprEnd = m + 1;
        continue;
      }
    }
    exprEnd++;
  }
  return { end: exprEnd, expr: s.slice(i, exprEnd) };
}

function convertFractions(input: string): string {
  let s = input;
  // Convert innermost fractions first or iteratively left-to-right; handle nested via recursion
  let guard = 0;
  while (s.includes('/') && guard++ < 25) {
    // Pick the deepest / first slash inside inner groups or top level: find first `/` whose operands don't themselves contain `/` or process recursively
    const idx = s.indexOf('/');
    const left = readLeftOperand(s, idx);
    const right = readRightOperand(s, idx);
    if (!left.expr || !right.expr) break;

    let num = stripOuterParens(left.expr);
    let den = stripOuterParens(right.expr);
    if (num.includes('/')) num = convertFractions(num);
    if (den.includes('/')) den = convertFractions(den);

    s = s.slice(0, left.start) + `\\frac{${num}}{${den}}` + s.slice(right.end);
  }
  return s;
}

function walkTree(node: MdastNode, visitor: (n: MdastNode, parent: MdastNode | null, index: number) => void, parent: MdastNode | null = null, index = 0): void {
  visitor(node, parent, index);
  if (Array.isArray(node.children)) {
    for (let i = 0; i < node.children.length; i++) {
      walkTree(node.children[i], visitor, node, i);
    }
  }
}

export default function remarkJekyllCompat() {
  return function transformer(tree: MdastNode, file: { history?: string[]; path?: string }) {
    const postUrlMap = buildPostUrlMap();
    const filePath = (file.history?.[0] ?? file.path ?? '').replace(/\\/g, '/');
    const isFinanceAsciiMathPost = filePath.includes('2022-03-20-finance-from-first-principles');

    // 1. Convert `{% highlight lang %}` ... `{% endhighlight %}` in paragraph/text nodes
    if (Array.isArray(tree.children)) {
      const nextChildren: MdastNode[] = [];
      let i = 0;
      while (i < tree.children.length) {
        const node = tree.children[i];
        // Strip legacy MathJax <script> HTML blocks
        if (
          node.type === 'html' &&
          typeof node.value === 'string' &&
          /cdnjs\.cloudflare\.com\/ajax\/libs\/mathjax/i.test(node.value)
        ) {
          i++;
          continue;
        }

        // Handle single-paragraph `{% highlight <lang> %}...{% endhighlight %}`
        if (node.type === 'paragraph' && node.children?.length) {
          const rawText = node.children.map((c) => c.value ?? '').join('').trim();
          const highlightInlineMatch = rawText.match(
            /^\{%\s*highlight\s+([A-Za-z0-9_-]+)\s*%\}\r?\n?([\s\S]*?)\r?\n?\{%\s*endhighlight\s*%\}$/,
          );
          if (highlightInlineMatch) {
            nextChildren.push({
              type: 'code',
              lang: highlightInlineMatch[1],
              value: highlightInlineMatch[2].trim(),
            });
            i++;
            continue;
          }

          // Handle multi-paragraph `{% highlight <lang> %}` ... `{% endhighlight %}` separated by blank lines
          const openMatch = rawText.match(/^\{%\s*highlight\s+([A-Za-z0-9_-]+)\s*%\}$/);
          if (openMatch) {
            const lang = openMatch[1];
            const collectedLines: string[] = [];
            let endIdx = -1;
            for (let j = i + 1; j < tree.children.length; j++) {
              const cand = tree.children[j];
              const candText =
                cand.type === 'paragraph' && cand.children
                  ? cand.children.map((c) => c.value ?? '').join('')
                  : (cand.value ?? '');
              if (/^\s*\{%\s*endhighlight\s*%\}\s*$/.test(candText)) {
                endIdx = j;
                break;
              }
              collectedLines.push(candText);
            }
            if (endIdx !== -1) {
              nextChildren.push({
                type: 'code',
                lang,
                value: collectedLines.join('\n').trim(),
              });
              i = endIdx + 1;
              continue;
            }
          }
        }

        nextChildren.push(node);
        i++;
      }
      tree.children = nextChildren;
    }

    // 2. Walk remaining AST for links, text {% post_url %}, code blocks, images + {:width=...}, inlineMath AsciiMath
    walkTree(tree, (node, parent, idx) => {
      // Strip inline MathJax script fragments if nested
      if (
        node.type === 'html' &&
        typeof node.value === 'string' &&
        /cdnjs\.cloudflare\.com\/ajax\/libs\/mathjax/i.test(node.value)
      ) {
        node.value = '';
      }

      // Resolve `{% post_url ... %}` inside literal text nodes (`[label]({% post_url slug %})` fails CommonMark due to spaces)
      if (
        node.type === 'text' &&
        typeof node.value === 'string' &&
        node.value.includes('post_url') &&
        parent?.children
      ) {
        const pattern = /\[([^\]]+)\]\(\{%\s*post_url\s+([^\s%]+)\s*%\}\)/g;
        let match: RegExpExecArray | null;
        let lastIdx = 0;
        const replacementNodes: MdastNode[] = [];
        while ((match = pattern.exec(node.value)) !== null) {
          if (match.index > lastIdx) {
            replacementNodes.push({
              type: 'text',
              value: node.value.slice(lastIdx, match.index),
            });
          }
          const resolved = postUrlMap.get(match[2]) ?? '#';
          replacementNodes.push({
            type: 'link',
            url: resolved,
            children: [{ type: 'text', value: match[1] }],
          });
          lastIdx = match.index + match[0].length;
        }
        if (replacementNodes.length > 0) {
          if (lastIdx < node.value.length) {
            replacementNodes.push({
              type: 'text',
              value: node.value.slice(lastIdx),
            });
          }
          parent.children.splice(idx, 1, ...replacementNodes);
          return;
        }
      }

      // Resolve `{% post_url ... %}` inside Markdown links (if angle-bracketed)
      if (node.type === 'link' && typeof node.url === 'string') {
        const postUrlMatch = node.url.match(/^\{%\s*post_url\s+([^\s%]+)\s*%\}$/);
        if (postUrlMatch) {
          const targetSlug = postUrlMatch[1];
          const resolved = postUrlMap.get(targetSlug);
          if (resolved) {
            node.url = resolved;
          }
        }
      }

      // Strip `{% raw %}` / `{% endraw %}` in code blocks (`2026-07-06-gemma-4.md`)
      if (node.type === 'code' && typeof node.value === 'string') {
        node.value = node.value
          .replace(/^\s*\{%\s*raw\s*%\}\r?\n?/gm, '')
          .replace(/\r?\n?\s*\{%\s*endraw\s*%\}\s*$/gm, '');
      }

      // Transform Kramdown `{:width="600px"}` adjacent to an image
      if (
        node.type === 'image' &&
        parent?.children &&
        idx + 1 < parent.children.length
      ) {
        const nextNode = parent.children[idx + 1];
        if (nextNode.type === 'text' && typeof nextNode.value === 'string') {
          const attrMatch = nextNode.value.match(/^\s*\{:([^}]+)\}/);
          if (attrMatch) {
            const widthMatch = attrMatch[1].match(
              /width\s*=\s*["'\u201c\u201d\u2018\u2019]?(\d+)(?:px)?["'\u201c\u201d\u2018\u2019]?/i,
            );
            if (widthMatch && typeof node.url === 'string') {
              const w = widthMatch[1];
              const escAttr = (v: string) =>
                v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
              const altAttr = node.alt ? ` alt="${escAttr(node.alt)}"` : ' alt=""';
              const titleAttr = node.title ? ` title="${escAttr(node.title)}"` : '';
              node.type = 'html';
              node.value = `<img src="${escAttr(node.url)}"${altAttr}${titleAttr} width="${w}" style="max-width: min(100%, ${w}px);" loading="lazy" decoding="async" />`;
              delete node.url;
              delete node.alt;
              delete node.title;
            }
            nextNode.value = nextNode.value.slice(attrMatch[0].length);
          }
        }
      }

      // Convert AsciiMath backtick spans in `2022-03-20-finance-from-first-principles.md`
      if (isFinanceAsciiMathPost && node.type === 'inlineCode' && typeof node.value === 'string') {
        const tex = asciiMathToTex(node.value);
        node.type = 'inlineMath';
        node.value = tex;
        node.data = {
          hName: 'code',
          hProperties: { className: ['language-math', 'math-inline'] },
          hChildren: [{ type: 'text', value: tex }],
        } as MdastNode['data'];
      }
    });
  };
}
