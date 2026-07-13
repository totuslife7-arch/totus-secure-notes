import productsConfig from '@/store/products.json';

export type ProductTier = 'pro';
export type ProductType = 'non_consumable' | 'subscription';

export interface CatalogProduct {
  key: string;
  type: ProductType;
  storeProductId: string;
  displayName: string;
  description: string;
  tier: ProductTier;
  grants: string[];
}

const entries: CatalogProduct[] = Object.entries(productsConfig.products).map(([key, p]) => ({
  key,
  type: p.type as ProductType,
  storeProductId: p.androidProductId,
  displayName: p.displayName,
  description: p.description,
  tier: p.tier as ProductTier,
  grants: p.grants ?? [],
}));

export const ALL_CATALOG_PRODUCTS: CatalogProduct[] = entries;

export const LIFETIME_SKUS = entries
  .filter((p) => p.type === 'non_consumable')
  .map((p) => p.storeProductId);

export const SUBSCRIPTION_SKUS = entries
  .filter((p) => p.type === 'subscription')
  .map((p) => p.storeProductId);

export const ALL_STORE_SKUS = entries.map((p) => p.storeProductId);

export function getProductByStoreId(storeId: string): CatalogProduct | undefined {
  return entries.find((p) => p.storeProductId === storeId);
}

export function getProductsForTier(tier: ProductTier): CatalogProduct[] {
  return entries.filter((p) => p.tier === tier);
}

export function grantsForProductIds(productIds: string[]): string[] {
  const grants = new Set<string>();
  for (const id of productIds) {
    const product = getProductByStoreId(id);
    product?.grants.forEach((g) => grants.add(g));
  }
  return [...grants];
}

export function ownsProTier(productIds: string[]): boolean {
  return productIds.some((id) => {
    const product = getProductByStoreId(id);
    return product?.tier === 'pro';
  });
}

export function ownsPremiumLifetime(productIds: string[]): boolean {
  return productIds.includes('pro_lifetime');
}

export const ADS_CONFIG = productsConfig.ads;
