import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'bazaura.auth.tokens';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Tokens are cached in memory so every request doesn't hit disk.
 * TODO(security): move to the iOS Keychain / Android Keystore
 * (e.g. react-native-keychain) before handling card payments in-app.
 */
let cache: AuthTokens | null | undefined;

export const tokenStorage = {
  async get(): Promise<AuthTokens | null> {
    if (cache !== undefined) return cache;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      cache = raw ? (JSON.parse(raw) as AuthTokens) : null;
    } catch {
      cache = null;
    }
    return cache;
  },

  async set(tokens: AuthTokens): Promise<void> {
    cache = tokens;
    await AsyncStorage.setItem(KEY, JSON.stringify(tokens)).catch(() => {});
  },

  async clear(): Promise<void> {
    cache = null;
    await AsyncStorage.removeItem(KEY).catch(() => {});
  },
};
