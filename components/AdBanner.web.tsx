import React from 'react';
import { ViewStyle } from 'react-native';

interface AdBannerProps {
  style?: ViewStyle;
}

export async function initializeAds(): Promise<void> {
  // No ads on web vault build
}

export default function AdBanner(_props: AdBannerProps) {
  return null;
}
