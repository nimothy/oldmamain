import { getCollection, type CollectionEntry } from 'astro:content';
import { batchFromMade, isBasketId, type LabelText } from './label';

export type Product = CollectionEntry<'products'>;

export async function getProducts(): Promise<Product[]> {
  const all = await getCollection('products');
  return all.sort((a, b) => a.data.order - b.data.order);
}

export function productLabel(p: Product): LabelText {
  return {
    line1: p.data.line1,
    line2: p.data.line2,
    batch: batchFromMade(p.data.made),
    phrase: p.data.phrase,
    basket: isBasketId(p.data.basket) ? p.data.basket : undefined,
    collab: p.data.collab,
  };
}
