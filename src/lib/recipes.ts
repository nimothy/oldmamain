import { getCollection } from 'astro:content';

/** Published recipes only: drafts are left out of pages, links and the nav. */
export function getRecipes() {
  return getCollection('recipes', (r) => !r.data.draft);
}
