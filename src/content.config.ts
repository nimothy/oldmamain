import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { BASKETS } from './lib/label';

/** Everything on the larder shelf: one entry per product, in display order. */
const products = defineCollection({
  loader: file('src/data/products.json'),
  schema: z.object({
    order: z.number(),
    /** Short name for the label maker's START FROM buttons. */
    kind: z.string(),
    title: z.string(),
    note: z.string(),
    line1: z.string(),
    line2: z.string().default(''),
    phrase: z.string(),
    /** Engraved basket on the label: one of the design system's baskets. */
    basket: z.enum(BASKETS.map((b) => b.id) as [string, ...string[]]),
    /** Month the latest batch was made, as YYYY-MM. Omit for products not made yet. */
    made: z
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(),
  }),
});

/** One Markdown file per recipe. The body is the method, as an ordered list. */
const recipes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/recipes' }),
  schema: z.object({
    title: z.string(),
    product: reference('products'),
    intro: z.string(),
    makes: z.string(),
    takes: z.string(),
    ingredients: z.array(z.string()).min(1),
    tip: z.string(),
    /** Drafts are not built or linked anywhere. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { products, recipes };
