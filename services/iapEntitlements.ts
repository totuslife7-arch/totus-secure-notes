import * as SecureStore from 'expo-secure-store';



import { grantsForProductIds } from '@/services/productCatalog';

import type { Entitlement } from '@/services/monetization';



const OWNED_PRODUCTS_KEY = 'totus_iap_owned_products_v1';

const PRO_LIFETIME_SKU = 'pro_lifetime';



export async function loadOwnedProductIds(): Promise<string[]> {

  try {

    const raw = await SecureStore.getItemAsync(OWNED_PRODUCTS_KEY);

    if (!raw) return [];

    const parsed = JSON.parse(raw) as string[];

    return Array.isArray(parsed) ? parsed : [];

  } catch {

    return [];

  }

}



export async function saveOwnedProductIds(productIds: string[]): Promise<void> {

  const unique = [...new Set(productIds)];

  await SecureStore.setItemAsync(OWNED_PRODUCTS_KEY, JSON.stringify(unique));

}



export async function addOwnedProductId(productId: string): Promise<string[]> {

  const current = await loadOwnedProductIds();

  if (!current.includes(productId)) {

    current.push(productId);

  }

  await saveOwnedProductIds(current);

  return current;

}



export async function mergeOwnedProductIds(productIds: string[]): Promise<string[]> {

  const current = await loadOwnedProductIds();

  const merged = [...new Set([...current, ...productIds])];

  await saveOwnedProductIds(merged);

  return merged;

}



export function ownsPremiumLifetime(productIds: string[]): boolean {

  return productIds.includes(PRO_LIFETIME_SKU);

}



export function computeEntitlementsFromProductIds(productIds: string[]): Entitlement[] {

  if (ownsPremiumLifetime(productIds)) {

    return [

      'no_ads',

      'premium_templates',

      'trip_planner',

      'template_studio',

      'template_ai',

    ];

  }



  const rawGrants = grantsForProductIds(productIds);

  return rawGrants.filter((g): g is Entitlement =>

    ['no_ads', 'premium_templates', 'trip_planner', 'template_studio', 'template_ai'].includes(g),

  );

}



export function primaryActiveProductId(productIds: string[]): string | null {

  if (productIds.length === 0) return null;

  if (productIds.includes(PRO_LIFETIME_SKU)) return PRO_LIFETIME_SKU;

  if (productIds.includes('pro_monthly')) return 'pro_monthly';

  return productIds[productIds.length - 1] ?? null;

}


