export interface NavItem {
  label: string;
  href: string;
  matchPrefix?: string;
}

const envEnableAnalytics =
  typeof import.meta !== 'undefined' &&
  typeof import.meta.env !== 'undefined' &&
  import.meta.env.PUBLIC_ENABLE_ANALYTICS === 'true';

const CAREER_START_YEAR = 2014;
const currentYear = new Date().getFullYear();
const yearsExperience = currentYear - CAREER_START_YEAR;

export const siteConfig = {
  title: 'Victor Angelo Blancada',
  shortTitle: 'V. A. Blancada',
  careerStartYear: CAREER_START_YEAR,
  currentYear,
  yearsExperience,
  tagline: 'Building at the intersection of code, data, and intelligence.',
  description:
    `Victor Angelo Blancada is an AI, data science, and optimization leader with ${yearsExperience}+ years of experience building analytics capabilities, decision-support systems, and teams across global logistics, telecommunications, consulting, and marketing.`,
  siteUrl: 'https://victorangeloblancada.github.io',
  base: '/',
  author: {
    name: 'Victor Angelo Blancada',
    email: 'naturalproblemsolver@gmail.com',
    legacyEmail: 'naturalproblemsolver@googlemail.com',
    github: 'victorangeloblancada',
    githubUrl: 'https://github.com/victorangeloblancada',
    linkedin: 'geloblancada',
    linkedinUrl: 'https://www.linkedin.com/in/geloblancada/',
    twitter: 'geloblancada',
    abakcusUrl: 'https://abakcus.com/directory/victor-angelo-blancadas-blog/',
  },
  nav: [
    { label: 'Work', href: '/projects/', matchPrefix: '/projects' },
    { label: 'Writing', href: '/blog/', matchPrefix: '/blog' },
    { label: 'Lab', href: '/lab/', matchPrefix: '/lab' },
    { label: 'About', href: '/pages/about.html', matchPrefix: '/pages' },
    { label: 'Contact', href: '/contact/', matchPrefix: '/contact' },
  ] satisfies NavItem[],
  /**
   * Analytics gated behind an explicit configuration flag (`PUBLIC_ENABLE_ANALYTICS=true`).
   * Defaults to `false` so local builds and privacy-conscious deployments emit zero tracking scripts.
   * See README.md ("Analytics Configuration") for enabling GTM & GA4.
   */
  analytics: {
    enabled: envEnableAnalytics,
    gtmId:
      (typeof import.meta !== 'undefined' &&
        import.meta.env?.PUBLIC_GTM_ID) ||
      'GTM-5S5WB7M',
    ga4Id:
      (typeof import.meta !== 'undefined' &&
        import.meta.env?.PUBLIC_GA4_ID) ||
      'G-ERJECQ081H',
  },
  pagination: {
    postsPerPage: 12,
  },
} as const;
