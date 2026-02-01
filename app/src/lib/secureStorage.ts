import * as Keychain from 'react-native-keychain';

const SERVICE_PREFIX = 'com.subscribermanager.cred.';

export async function storePassword(
  key: string,
  password: string,
): Promise<void> {
  await Keychain.setGenericPassword(key, password, {
    service: SERVICE_PREFIX + key,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function getPassword(key: string): Promise<string | null> {
  const result = await Keychain.getGenericPassword({
    service: SERVICE_PREFIX + key,
    authenticationPrompt: {
      title: 'Kimlik Dogrulama',
    },
  });
  if (result) {
    return result.password;
  }
  return null;
}

export async function getPasswordWithBiometrics(
  key: string,
): Promise<string | null> {
  const result = await Keychain.getGenericPassword({
    service: SERVICE_PREFIX + key,
    accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
    authenticationPrompt: {
      title: 'Sifreyi gormek icin dogrulama gerekli',
    },
  });
  if (result) {
    return result.password;
  }
  return null;
}

export async function deletePassword(key: string): Promise<void> {
  await Keychain.resetGenericPassword({
    service: SERVICE_PREFIX + key,
  });
}
