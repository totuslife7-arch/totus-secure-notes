import * as SecureStore from 'expo-secure-store';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import PaywallSheet from '@/components/PaywallSheet';
import { useAppTheme } from '@/context/ThemeContext';
import { useMonetization } from '@/context/MonetizationContext';

const DISMISS_KEY = 'totus_pro_banner_dismissed';

type Props = {
  context?: 'notes' | 'templates' | 'trips' | 'home';
};

export default function ProUpgradeBanner({ context = 'home' }: Props) {
  const { theme } = useAppTheme();
  const { state } = useMonetization();
  const [dismissed, setDismissed] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);

  const refreshDismiss = useCallback(async () => {
    try {
      const value = await SecureStore.getItemAsync(DISMISS_KEY);
      setDismissed(value === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    refreshDismiss().catch(() => undefined);
  }, [refreshDismiss]);

  const handleDismiss = async () => {
    setDismissed(true);
    try {
      await SecureStore.setItemAsync(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  };

  const showBanner = !state.isPremiumLifetime && !state.devUnlockActive && !dismissed;

  const contextCopy =
    context === 'templates'
      ? 'Unlock Template Studio, on-device AI, and premium templates.'
      : context === 'trips'
        ? 'Unlock driving routes, in-app maps, and Trip Planner Pro.'
        : context === 'notes'
          ? 'Unlock Note Assist and on-device AI summaries.'
          : 'Pro Lifetime unlocks on-device AI, Template Studio, and Trip Pro.';

  return (
    <>
      {showBanner ? (
        <View style={[styles.banner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>
              {state.isPro ? 'Upgrade to Pro Lifetime' : 'Upgrade to Pro'}
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>{contextCopy}</Text>
          </View>
          <Pressable
            style={[styles.upgradeBtn, { backgroundColor: theme.primary }]}
            onPress={() => setPaywallVisible(true)}>
            <Text style={{ color: theme.primaryText, fontWeight: '600', fontSize: 13 }}>Upgrade</Text>
          </Pressable>
          <Pressable onPress={handleDismiss} hitSlop={8} style={styles.dismiss}>
            <Text style={{ color: theme.textMuted, fontSize: 18 }}>×</Text>
          </Pressable>
        </View>
      ) : null}
      <PaywallSheet
        visible={paywallVisible}
        premiumUpsell
        onClose={() => setPaywallVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  upgradeBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dismiss: {
    paddingLeft: 4,
  },
});
