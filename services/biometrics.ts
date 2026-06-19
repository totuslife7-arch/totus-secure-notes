import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const ENABLED_KEY = 'totus_biometric_enabled';
const PASSWORD_KEY = 'totus_biometric_password';

const secureOptions = {
  requireAuthentication: true,
  authenticationPrompt: 'Unlock Totus Secure Notes',
};

export async function isBiometricHardwareAvailable(): Promise<boolean> {
  const compatible = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return compatible && enrolled && SecureStore.canUseBiometricAuthentication();
}

export async function isBiometricUnlockEnabled(): Promise<boolean> {
  const flag = await SecureStore.getItemAsync(ENABLED_KEY);
  return flag === 'true';
}

export async function enableBiometricUnlock(password: string): Promise<boolean> {
  if (!(await isBiometricHardwareAvailable())) {
    return false;
  }

  await SecureStore.deleteItemAsync(PASSWORD_KEY, secureOptions);
  await SecureStore.setItemAsync(PASSWORD_KEY, password, secureOptions);
  await SecureStore.setItemAsync(ENABLED_KEY, 'true');
  return true;
}

export async function disableBiometricUnlock(): Promise<void> {
  await SecureStore.deleteItemAsync(PASSWORD_KEY, secureOptions);
  await SecureStore.deleteItemAsync(ENABLED_KEY);
}

export async function retrievePasswordWithBiometrics(): Promise<string | null> {
  if (!(await isBiometricUnlockEnabled())) {
    return null;
  }

  try {
    return await SecureStore.getItemAsync(PASSWORD_KEY, secureOptions);
  } catch {
    return null;
  }
}

export async function refreshBiometricPassword(password: string): Promise<void> {
  if (!(await isBiometricUnlockEnabled())) {
    return;
  }

  await SecureStore.deleteItemAsync(PASSWORD_KEY, secureOptions);
  await SecureStore.setItemAsync(PASSWORD_KEY, password, secureOptions);
}
