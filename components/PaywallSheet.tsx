import React, { Component, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/context/ThemeContext';
import { useMonetization } from '@/context/MonetizationContext';
import { hasEntitlement, type PaywallTier } from '@/services/monetization';
import type { CatalogProduct } from '@/services/productCatalog';

interface PaywallSheetProps {
  visible: boolean;
  tier?: PaywallTier;
  /** When true, emphasize Pro Lifetime (Template Studio / Trip Pro upsell). */
  premiumUpsell?: boolean;
  onClose: () => void;
  onPurchased?: () => void;
}

interface PaywallErrorBoundaryProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

interface PaywallErrorBoundaryState {
  hasError: boolean;
}

class PaywallErrorBoundary extends Component<PaywallErrorBoundaryProps, PaywallErrorBoundaryState> {
  state: PaywallErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PaywallErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('[PaywallSheet] render error', error.message);
  }

  componentDidUpdate(prevProps: PaywallErrorBoundaryProps) {
    if (!this.props.visible && prevProps.visible) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <PaywallFallback onClose={this.props.onClose} />;
    }
    return this.props.children;
  }
}

function PaywallFallback({ onClose }: { onClose: () => void }) {
  const { theme } = useAppTheme();

  return (
    <View style={[styles.fallback, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Could not load paywall</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        Try again, or use Restore purchases in Settings. For testing, enter the developer unlock code
        in Settings → About (tap version 7 times).
      </Text>
      <Pressable onPress={onClose} style={[styles.fallbackButton, { backgroundColor: theme.primary }]}>
        <Text style={{ color: theme.primaryText, fontWeight: '600' }}>Close</Text>
      </Pressable>
    </View>
  );
}

function PaywallSheetContent({
  tier: _tier = 'pro',
  premiumUpsell = false,
  onClose,
  onPurchased,
}: Omit<PaywallSheetProps, 'visible'>) {
  const { theme } = useAppTheme();
  const {
    state,
    connected,
    iapReady,
    getStoreProductsForTier,
    getDisplayPrice,
    purchaseProduct,
    restore,
    isPurchasing,
  } = useMonetization();
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  const catalogProducts = useMemo(
    () => getStoreProductsForTier('pro'),
    [getStoreProductsForTier],
  );

  const hasNoAds = hasEntitlement(state, 'no_ads');
  const hasLifetime = state.isPremiumLifetime;

  const title = premiumUpsell ? 'Upgrade to Pro Lifetime' : 'Totus Secure Notes Pro';
  const subtitle = premiumUpsell
    ? 'Pro Monthly removes ads only. Pro Lifetime unlocks Trip Planner Pro, Template Studio, Template AI, and all premium tools.'
    : 'Choose monthly (no ads) or lifetime (full premium — one payment).';

  const handlePurchase = async (product: CatalogProduct) => {
    try {
      setSelectedSku(product.storeProductId);
      await purchaseProduct(product.storeProductId);
      onPurchased?.();
      onClose();
    } catch (e) {
      Alert.alert('Purchase failed', e instanceof Error ? e.message : 'Try again later.');
    } finally {
      setSelectedSku(null);
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert('Restored', 'Your purchases have been refreshed.');
      onPurchased?.();
    } catch {
      Alert.alert('Restore failed', 'Could not restore purchases.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={{ color: theme.primary, fontSize: 16, fontWeight: '600' }}>Close</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>

        <Text style={[styles.benefit, { color: theme.text }]}>• Pro Monthly — no banner ads</Text>
        <Text style={[styles.benefit, { color: theme.text }]}>
          • Pro Lifetime — no ads + Trip Planner Pro + Template Studio + Template AI + premium templates
        </Text>

        {iapReady && !connected ? (
          <Text style={[styles.storeHint, { color: theme.textMuted }]}>
            Connecting to the app store… You can still review plans below.
          </Text>
        ) : null}

        {hasLifetime ? (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Pro Lifetime active</Text>
          </View>
        ) : catalogProducts.length === 0 ? (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Plans unavailable</Text>
            <Text style={{ color: theme.textMuted, marginTop: 4 }}>
              Product catalog could not be loaded. Try Restore purchases or restart the app.
            </Text>
          </View>
        ) : (
          catalogProducts.map((product) => {
            const price = getDisplayPrice(product.storeProductId);
            const loading = isPurchasing && selectedSku === product.storeProductId;
            const isLifetime = product.storeProductId === 'pro_lifetime';
            const ownedMonthlyOnly = hasNoAds && !hasLifetime && !isLifetime;

            if (ownedMonthlyOnly && product.storeProductId === 'pro_monthly') {
              return null;
            }

            return (
              <Pressable
                key={product.key}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isLifetime ? theme.primary : theme.border,
                    borderWidth: isLifetime ? 2 : 1,
                  },
                ]}
                onPress={() => handlePurchase(product)}
                disabled={isPurchasing}>
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.productName, { color: theme.text }]}>
                      {product.displayName}
                      {isLifetime ? ' (Recommended)' : ''}
                    </Text>
                    <Text style={[styles.productDesc, { color: theme.textMuted }]}>
                      {product.description}
                    </Text>
                  </View>
                  {loading ? (
                    <ActivityIndicator color={theme.primary} />
                  ) : (
                    <Text style={[styles.price, { color: theme.primary }]}>{price ?? 'View price'}</Text>
                  )}
                </View>
              </Pressable>
            );
          })
        )}

        <Pressable onPress={handleRestore} style={styles.restoreBtn}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>Restore purchases</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function PaywallSheet({
  visible,
  tier = 'pro',
  premiumUpsell = false,
  onClose,
  onPurchased,
}: PaywallSheetProps) {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS === 'android'}>
      <PaywallErrorBoundary onClose={onClose} visible={visible}>
        <PaywallSheetContent
          tier={tier}
          premiumUpsell={premiumUpsell}
          onClose={onClose}
          onPurchased={onPurchased}
        />
      </PaywallErrorBoundary>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 8,
  },
  title: { fontSize: 22, fontWeight: '700', flex: 1, marginRight: 12 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24, gap: 12 },
  subtitle: { fontSize: 15, marginBottom: 8 },
  benefit: { fontSize: 15, lineHeight: 22 },
  storeHint: { fontSize: 13, marginBottom: 4 },
  card: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  productName: { fontSize: 17, fontWeight: '600' },
  productDesc: { fontSize: 13, marginTop: 4 },
  price: { fontSize: 16, fontWeight: '700' },
  restoreBtn: { alignItems: 'center', paddingVertical: 20 },
  fallback: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  fallbackButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
});
