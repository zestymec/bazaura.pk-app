/**
 * Safe access to @react-native-community/netinfo.
 *
 * The library throws at import time when its native module is missing
 * (e.g. new JS running on an old binary that was built before the package
 * was added). That would take the whole app down, so we load it lazily and
 * fall back to "always online" instead.
 */
type NetState = { isConnected: boolean | null; isInternetReachable: boolean | null };
type Listener = (state: NetState) => void;

let NetInfo: {
  addEventListener: (listener: Listener) => () => void;
  refresh: () => Promise<NetState>;
} | null = null;

try {
  NetInfo = require('@react-native-community/netinfo').default;
} catch (e) {
  if (__DEV__) {
    console.warn('[netinfo] Native module unavailable — rebuild the app (npm run ios / npm run android).');
  }
}

const ONLINE: NetState = { isConnected: true, isInternetReachable: true };

export const netInfo = {
  available: NetInfo !== null,

  addEventListener(listener: Listener): () => void {
    if (!NetInfo) return () => {};
    try {
      return NetInfo.addEventListener(listener);
    } catch {
      return () => {};
    }
  },

  async refresh(): Promise<NetState> {
    if (!NetInfo) return ONLINE;
    try {
      return await NetInfo.refresh();
    } catch {
      return ONLINE;
    }
  },
};
