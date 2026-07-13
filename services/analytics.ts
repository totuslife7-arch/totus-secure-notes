import { Platform } from 'react-native';

let analyticsModule: typeof import('@react-native-firebase/analytics').default | null = null;
let crashlyticsModule: typeof import('@react-native-firebase/crashlytics').default | null = null;

async function loadAnalytics() {
  if (Platform.OS === 'web' || analyticsModule) return analyticsModule;
  try {
    analyticsModule = (await import('@react-native-firebase/analytics')).default;
  } catch (e) {
    console.warn('[Analytics] module unavailable', e);
  }
  return analyticsModule;
}

async function loadCrashlytics() {
  if (Platform.OS === 'web' || crashlyticsModule) return crashlyticsModule;
  try {
    crashlyticsModule = (await import('@react-native-firebase/crashlytics')).default;
  } catch (e) {
    console.warn('[Crashlytics] module unavailable', e);
  }
  return crashlyticsModule;
}

/** Screen views only — never log note titles, vault content, or PHI. */
export async function logScreenView(screenName: string): Promise<void> {
  const analytics = await loadAnalytics();
  if (!analytics) return;
  try {
    await analytics().logScreenView({ screen_name: screenName, screen_class: screenName });
  } catch (e) {
    console.warn('[Analytics] logScreenView failed', e);
  }
}

export async function logEvent(name: string, params?: Record<string, string | number>): Promise<void> {
  const analytics = await loadAnalytics();
  if (!analytics) return;
  try {
    await analytics().logEvent(name, params);
  } catch (e) {
    console.warn('[Analytics] logEvent failed', e);
  }
}

export async function initializeFirebaseTelemetry(): Promise<void> {
  if (Platform.OS === 'web') return;
  await loadAnalytics();
  const crashlytics = await loadCrashlytics();
  if (crashlytics) {
    try {
      await crashlytics().setCrashlyticsCollectionEnabled(true);
    } catch (e) {
      console.warn('[Crashlytics] init failed', e);
    }
  }
}

export async function recordNonFatalError(error: unknown, context?: string): Promise<void> {
  const crashlytics = await loadCrashlytics();
  if (!crashlytics) return;
  try {
    if (context) {
      await crashlytics().log(context);
    }
    if (error instanceof Error) {
      await crashlytics().recordError(error);
    } else {
      await crashlytics().recordError(new Error(String(error)));
    }
  } catch (e) {
    console.warn('[Crashlytics] recordNonFatalError failed', e);
  }
}
