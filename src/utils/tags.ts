/**
 * Tag normalization and legacy 107-tag compatibility mapping.
 */

export const TAG_ALIASES: Record<string, string> = {
  gifs: 'gif',
};

/** All 107 raw tag strings present in the legacy Jekyll `_site/blog/tag/` tree. */
export const LEGACY_RAW_TAGS: readonly string[] = [
  'Bayes',
  'Bayesian',
  'agent',
  'agentic ai',
  'ai',
  'art',
  'artificial intelligence',
  'attribution',
  'automation',
  'blog',
  'business',
  'business strategy',
  'case study',
  'change',
  'chatgpt',
  'claude',
  'clustering',
  'coding',
  'cognitive science',
  'color palette',
  'combinations',
  'command line',
  'compression',
  'consulting',
  'copilot',
  'creativity',
  'dash',
  'dashboard',
  'data',
  'data analysis',
  'data science',
  'economics',
  'economy',
  'engineering',
  'ergonomics',
  'featured',
  'fiber network',
  'finance',
  'fine-tuning',
  'gdpr',
  'gemma',
  'gif',
  'gifs',
  'google',
  'gradient descent',
  'hardware',
  'health',
  'html',
  'hyperopt',
  'hyperparameter',
  'image processing',
  'innovation',
  'interface',
  'internet',
  'interpretability',
  'iteration',
  'itertools',
  'kmeans',
  'language',
  'large language model',
  'lean six sigma',
  'llm',
  'logistics',
  'mab',
  'machine learning',
  'makati',
  'marketing',
  'marketing mix modeling',
  'markov chain',
  'math',
  'mathematics',
  'medicine',
  'microsoft',
  'ml',
  'model',
  'multi-armed bandit',
  'nanogenmo',
  'network',
  'nlp',
  'online',
  'openai',
  'opinion',
  'optimization',
  'paintings',
  'percentage',
  'power bi',
  'predictive',
  'privacy',
  'pruning',
  'python',
  'reinforcement learning',
  'rl',
  'security',
  'software development',
  'statistics',
  'technology',
  'tosm',
  'training',
  'tumblr',
  'ui',
  'user experience',
  'ux',
  'victor',
  'video processing',
  'web apps',
  'web development',
  'web frameworks',
];

export function normalizeTagSlug(rawTag: string): string {
  const lowered = rawTag
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return TAG_ALIASES[lowered] ?? lowered;
}

export function formatTagLabel(slug: string): string {
  return slug.replace(/-/g, ' ');
}

export function getLegacyRedirects(): Array<{ legacyRaw: string; canonicalSlug: string }> {
  return LEGACY_RAW_TAGS.map((raw) => ({
    legacyRaw: raw,
    canonicalSlug: normalizeTagSlug(raw),
  })).filter(({ legacyRaw, canonicalSlug }) => legacyRaw !== canonicalSlug);
}
