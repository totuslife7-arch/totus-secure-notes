/**
 * Monetization entitlements — backed by SecureStore + expo-iap (see MonetizationContext).
 *
 * Tiers:
 * - Free: ads + core features
 * - Pro Monthly (pro_monthly): no ads only
 * - Pro Lifetime (pro_lifetime): all premium features
 */

import { isDevUnlockActive } from '@/services/devUnlock';
import {
  computeEntitlementsFromProductIds,
  loadOwnedProductIds,
  ownsPremiumLifetime,
  primaryActiveProductId,
} from '@/services/iapEntitlements';
import { ADS_CONFIG } from '@/services/productCatalog';

export type Entitlement =
  | 'no_ads'
  | 'premium_templates'
  | 'trip_planner'
  | 'template_studio'
  | 'template_ai';

export type PaywallTier = 'pro';

export interface MonetizationState {
  isPro: boolean;
  isPremiumLifetime: boolean;
  showAds: boolean;
  activeProductId: string | null;
  ownedProductIds: string[];
  entitlements: Entitlement[];
  /** True when hidden developer unlock code is active (testing only). */
  devUnlockActive: boolean;
}

const DEFAULT_STATE: MonetizationState = {
  isPro: false,
  isPremiumLifetime: false,
  showAds: true,
  activeProductId: null,
  ownedProductIds: [],
  entitlements: [],
  devUnlockActive: false,
};

const ALL_ENTITLEMENTS: Entitlement[] = [
  'no_ads',
  'premium_templates',
  'trip_planner',
  'template_studio',
  'template_ai',
];

/** True when built with EAS `store-review` profile (Play / App Store submission). */
export function isStoreReviewMode(): boolean {
  return process.env.EXPO_PUBLIC_STORE_REVIEW_MODE === 'true';
}

function allEntitlementsOverrideActive(devUnlockActive = false): boolean {
  return (
    process.env.EXPO_PUBLIC_TRIP_PLANNER_PRO === 'true' ||
    isStoreReviewMode() ||
    devUnlockActive
  );
}

function overrideProductId(devUnlockActive: boolean): string {
  if (isStoreReviewMode()) return 'store_review';
  if (devUnlockActive) return 'dev_unlock';
  return 'dev_all';
}

function buildFullEntitlementsState(
  activeProductId: string,
  devUnlockActive: boolean,
): MonetizationState {
  return {
    isPro: true,
    isPremiumLifetime: true,
    showAds: false,
    activeProductId,
    ownedProductIds: [activeProductId],
    entitlements: [...ALL_ENTITLEMENTS],
    devUnlockActive,
  };
}

export function buildMonetizationState(
  productIds: string[],
  options?: { devUnlockActive?: boolean },
): MonetizationState {
  const devUnlockActive = options?.devUnlockActive ?? false;

  if (allEntitlementsOverrideActive(devUnlockActive)) {
    return buildFullEntitlementsState(overrideProductId(devUnlockActive), devUnlockActive);
  }

  const entitlements = computeEntitlementsFromProductIds(productIds);
  const isPremiumLifetime = ownsPremiumLifetime(productIds);
  const isPro = entitlements.includes('no_ads');
  const adsEnabled = ADS_CONFIG.enabledInFreeTier !== false;

  return {
    isPro,
    isPremiumLifetime,
    showAds: adsEnabled && !isPro,
    activeProductId: primaryActiveProductId(productIds),
    ownedProductIds: productIds,
    entitlements,
    devUnlockActive: false,
  };
}

export async function getMonetizationState(): Promise<MonetizationState> {
  const devUnlockActive = await isDevUnlockActive();

  if (allEntitlementsOverrideActive(devUnlockActive)) {
    return buildFullEntitlementsState(overrideProductId(devUnlockActive), devUnlockActive);
  }

  const productIds = await loadOwnedProductIds();
  return buildMonetizationState(productIds, { devUnlockActive });
}

export async function restorePurchases(): Promise<MonetizationState> {
  return getMonetizationState();
}

export function shouldShowAds(state: MonetizationState): boolean {
  return state.showAds && !state.entitlements.includes('no_ads');
}

export function hasEntitlement(state: MonetizationState, entitlement: Entitlement): boolean {
  return state.entitlements.includes(entitlement);
}

export function hasTripPlannerPro(state: MonetizationState): boolean {
  if (state.devUnlockActive || isStoreReviewMode()) {
    return true;
  }
  return hasEntitlement(state, 'trip_planner');
}

export function hasTemplateStudio(state: MonetizationState): boolean {
  return hasEntitlement(state, 'template_studio');
}

export function hasTemplateAi(state: MonetizationState): boolean {
  return hasEntitlement(state, 'template_ai');
}

export function canPurchaseTier(_state: MonetizationState, _tier: PaywallTier): boolean {
  return true;
}

export function missingPrerequisiteTier(
  _state: MonetizationState,
  _tier: PaywallTier,
): PaywallTier | null {
  return null;
}

export { isDevUnlockActive } from '@/services/devUnlock';

export { DEFAULT_STATE };
