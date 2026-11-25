import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    header: z.string().optional(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    slugOverride: z.string().optional(),
    category: z.string().default('blog'),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    dropcap: z.boolean().default(false),
    draft: z.boolean().default(false),
    legacyUnlisted: z.boolean().default(false),
    featured: z.boolean().default(false),
    gallery: z.string().optional(),
    layout: z.enum(['post', 'post-alt', 'gallery']).default('post'),
    toc: z.boolean().optional(),
    notshareable: z.boolean().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    period: z.string().optional(),
    role: z.string().optional(),
    organization: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    status: z.enum(['production', 'shipped', 'archived', 'research']).default('shipped'),
    impactMetric: z.string().optional(),
    externalUrl: z.url().optional(),
    githubUrl: z.url().optional(),
    featured: z.boolean().default(false),
    order: z.number().default(99),
    interactiveComponent: z.string().optional(),
  }),
});

const lab = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/lab' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    technologies: z.array(z.string()).default([]),
    status: z.enum(['interactive', 'prototype', 'archived']).default('interactive'),
    componentId: z.string(),
    featured: z.boolean().default(true),
    order: z.number().default(99),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    header: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    layout: z.enum(['post', 'profile', 'default']).default('post'),
    notshareable: z.boolean().optional(),
  }),
});

export const collections = { blog, projects, lab, pages };
