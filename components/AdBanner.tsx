import React, { useEffect, useState } from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import mobileAds, { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { useMonetization } from '@/context/MonetizationContext';
import { ADS_CONFIG } from '@/services/productCatalog';
import { shouldShowAds } from '@/services/monetization';

let adsInitialized = false;

export async function initializeAds(): Promise<void> {
  if (adsInitialized || Platform.OS === 'web') return;
  try {
    await mobileAds().initialize();
    adsInitialized = true;
  } catch (e) {
    console.warn('[Ads] init failed', e);
  }
}

function bannerUnitId(): string {
  if (__DEV__) {
    return TestIds.BANNER;
  }
  return Platform.OS === 'ios'
    ? ADS_CONFIG.bannerUnitIdIos
    : ADS_CONFIG.bannerUnitIdAndroid;
}

interface AdBannerProps {
  style?: ViewStyle;
}

export default function AdBanner({ style }: AdBannerProps) {
  const { state } = useMonetization();
  const [ready, setReady] = useState(adsInitialized);

  useEffect(() => {
    initializeAds().then(() => setReady(true));
  }, []);

  if (Platform.OS === 'web' || !ready || !shouldShowAds(state)) {
    return null;
  }

  return (
    <View style={style}>
      <BannerAd unitId={bannerUnitId()} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}
