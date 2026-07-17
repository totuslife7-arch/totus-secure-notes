import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform } from 'react-native';
import { ErrorCode, useIAP, type Product, type Purchase } from 'expo-iap';

import {
  addOwnedProductId,
  syncOwnedProductIdsFromStore,
} from '@/services/iapEntitlements';
import {
  buildMonetizationState,
  getMonetizationState,
  type MonetizationState,
  type PaywallTier,
} from '@/services/monetization';
import { isDevUnlockActive } from '@/services/devUnlock';
import {
  ALL_STORE_SKUS,
  getProductByStoreId,
  getProductsForTier,
  LIFETIME_SKUS,
  SUBSCRIPTION_SKUS,
  type CatalogProduct,
} from '@/services/productCatalog';

interface MonetizationContextValue {
  state: MonetizationState;
  connected: boolean;
  iapReady: boolean;
  products: Product[];
  isPurchasing: boolean;
  refresh: () => Promise<void>;
  purchaseProduct: (storeProductId: string) => Promise<void>;
  restore: () => Promise<MonetizationState>;
  getStoreProductsForTier: (tier: PaywallTier) => CatalogProduct[];
  getDisplayPrice: (storeProductId: string) => string | null;
}

const MonetizationContext = createContext<MonetizationContextValue | null>(null);

function purchaseProductId(purchase: Purchase): string | null {
  return purchase.productId ?? purchase.id ?? null;
}

export function MonetizationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MonetizationState>(() => buildMonetizationState([]));
  const [isPurchasing, setIsPurchasing] = useState(false);
  const iapSupported = Platform.OS === 'ios' || Platform.OS === 'android';

  const syncFromOwned = useCallback(async (productIds: string[]) => {
    const devUnlockActive = await isDevUnlockActive();
    setState(buildMonetizationState(productIds, { devUnlockActive }));
  }, []);

  const applyPurchase = useCallback(
    async (purchase: Purchase) => {
      const productId = purchaseProductId(purchase);
      if (!productId) return;
      const owned = await addOwnedProductId(productId);
      await syncFromOwned(owned);
    },
    [syncFromOwned],
  );

  const {
    connected,
    products,
    availablePurchases,
    fetchProducts,
    requestPurchase,
    finishTransaction,
    restorePurchases: iapRestore,
    getAvailablePurchases,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      try {
        await applyPurchase(purchase);
        await finishTransaction({ purchase, isConsumable: false });
      } finally {
        setIsPurchasing(false);
      }
    },
    onPurchaseError: (error) => {
      setIsPurchasing(false);
      if (error.code !== ErrorCode.UserCancelled) {
        console.warn('[IAP] purchase error', error.message);
      }
    },
  });

  const refresh = useCallback(async () => {
    const cached = await getMonetizationState();
    setState(cached);

    if (!iapSupported || !connected) return;

    try {
      await fetchProducts({ skus: LIFETIME_SKUS, type: 'in-app' });
      await fetchProducts({ skus: SUBSCRIPTION_SKUS, type: 'subs' });
      await getAvailablePurchases();
    } catch (e) {
      console.warn('[IAP] refresh fetch failed', e);
    }
  }, [connected, fetchProducts, getAvailablePurchases, iapSupported]);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  useEffect(() => {
    if (!connected || availablePurchases.length === 0) return;
    const ids = availablePurchases
      .map((p) => purchaseProductId(p))
      .filter((id): id is string => id != null);
    syncOwnedProductIdsFromStore(ids).then(syncFromOwned).catch(() => undefined);
  }, [availablePurchases, connected, syncFromOwned]);

  const restore = useCallback(async () => {
    if (iapSupported && connected) {
      try {
        await iapRestore();
        await getAvailablePurchases();
      } catch (e) {
        console.warn('[IAP] restore failed', e);
      }
    }
    const cached = await getMonetizationState();
    setState(cached);
    return cached;
  }, [connected, getAvailablePurchases, iapRestore, iapSupported]);

  const purchaseProduct = useCallback(
    async (storeProductId: string) => {
      if (!iapSupported) {
        throw new Error('In-app purchases require an iOS or Android build.');
      }
      if (!connected) {
        throw new Error('Store connection not ready. Try again in a moment.');
      }

      const catalog = getProductByStoreId(storeProductId);
      const purchaseType = catalog?.type === 'subscription' ? 'subs' : 'in-app';

      setIsPurchasing(true);
      await requestPurchase({
        type: purchaseType,
        request: {
          apple: { sku: storeProductId },
          google: { skus: [storeProductId] },
        },
      });
    },
    [connected, iapSupported, requestPurchase],
  );

  const getStoreProductsForTier = useCallback((tier: PaywallTier) => {
    return getProductsForTier(tier);
  }, []);

  const getDisplayPrice = useCallback(
    (storeProductId: string) => {
      const match = products.find((p) => p.id === storeProductId);
      return match?.displayPrice ?? null;
    },
    [products],
  );

  const value = useMemo(
    (): MonetizationContextValue => ({
      state,
      connected: iapSupported ? connected : false,
      iapReady: iapSupported,
      products,
      isPurchasing,
      refresh,
      purchaseProduct,
      restore,
      getStoreProductsForTier,
      getDisplayPrice,
    }),
    [
      state,
      iapSupported,
      connected,
      products,
      isPurchasing,
      refresh,
      purchaseProduct,
      restore,
      getStoreProductsForTier,
      getDisplayPrice,
    ],
  );

  return (
    <MonetizationContext.Provider value={value}>{children}</MonetizationContext.Provider>
  );
}

export function useMonetization(): MonetizationContextValue {
  const ctx = useContext(MonetizationContext);
  if (!ctx) {
    throw new Error('useMonetization must be used within MonetizationProvider');
  }
  return ctx;
}

/** Sync restored purchase IDs from expo-iap available purchases into SecureStore. */
export async function syncRestoredPurchaseIds(purchaseIds: string[]): Promise<void> {
  await syncOwnedProductIdsFromStore(purchaseIds.filter(Boolean));
}

export { ALL_STORE_SKUS };
