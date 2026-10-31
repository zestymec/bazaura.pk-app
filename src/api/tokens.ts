import * as Keychain from 'react-native-keychain';

/**
 * Access + refresh tokens live in the iOS Keychain / Android Keystore,
 * never in AsyncStorage (FRONTEND.md §3). Cached in memory so each request
 * doesn't round-trip to the keystore.
 */
const SERVICE = 'pk.bazaura.app.session';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

let cache: Tokens | null | undefined;

async function load(): Promise<Tokens | null> {
  if (cache !== undefined) return cache;
  try {
    const creds = await Keychain.getGenericPassword({ service: SERVICE });
    cache = creds ? (JSON.parse(creds.password) as Tokens) : null;
  } catch {
    cache = null;
  }
  return cache;
}

export async function getAccessToken() {
  return (await load())?.accessToken ?? null;
}

export async function getRefreshToken() {
  return (await load())?.refreshToken ?? null;
}

export async function saveTokens(accessToken: string, refreshToken: string) {
  cache = { accessToken, refreshToken };
  try {
    await Keychain.setGenericPassword('bazaura', JSON.stringify(cache), {
      service: SERVICE,
      accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
    });
  } catch {
    // Keystore unavailable (rare) — session still works until the app restarts.
  }
}

export async function clearTokens() {
  cache = null;
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
  } catch {
    // nothing to clear
  }
}

export async function hasSession() {
  return !!(await getRefreshToken());
}
