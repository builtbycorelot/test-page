import { defineCollection, z } from 'astro:content';

const slugRule = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
  message: 'Slug must be kebab-case',
});

const plans = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    slug: slugRule,
    sqft: z.number().int().positive(),
    beds: z.number().positive(),
    baths: z.number().positive(),
    summary: z.string(),
    heroImage: z.string(),
    gallery: z.array(z.string()).nonempty(),
    tags: z.array(z.string()).optional(),
  }),
});

const land = defineCollection({
  type: 'data',
  schema: z.object({
    slug: slugRule,
    address: z.string(),
    status: z.string(),
    summary: z.string().optional(),
    heroImage: z.string(),
    gallery: z.array(z.string()).nonempty(),
  }),
});

const manufacturers = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: slugRule,
    website: z.string().url(),
    summary: z.string(),
    logo: z.string().optional(),
  }),
});

const products = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    slug: slugRule,
    manufacturer: z.string(),
    summary: z.string(),
    category: z.string(),
    heroImage: z.string().optional(),
  }),
});

export const collections = { plans, land, manufacturers, products };
