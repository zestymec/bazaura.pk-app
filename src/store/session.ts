import { env } from '../config/env';
import { tokenStorage } from '../api/tokenStorage';
import { setSessionExpiredHandler } from '../api/client';
import { authService } from '../api/services/auth';
import { usersService } from '../api/services/users';
import { ordersService } from '../api/services/orders';
import { requestsService } from '../api/services/requests';
import { wishlistService } from '../api/services/wishlist';
import { mockServer } from '../api/mock/server';
import { queryClient } from '../hooks/queryClient';
import { useUserStore } from './useUserStore';
import { useWishlistStore } from './useWishlistStore';
import { useRequestStore } from './useRequestStore';

/**
 * Pulls the signed-in user's account data into the local stores.
 * Failures are swallowed: the persisted copy keeps the UI usable offline.
 */
export async function syncAccountData() {
  if (!useUserStore.getState().isAuthenticated) return;
  const [me, orders, requests, wishlist] = await Promise.allSettled([
    usersService.me(),
    ordersService.list(),
    requestsService.list(),
    wishlistService.list(),
  ]);
  const user = useUserStore.getState();
  if (me.status === 'fulfilled') user.setUser(me.value);
  if (orders.status === 'fulfilled') user.setOrders(orders.value);
  if (requests.status === 'fulfilled') useRequestStore.getState().setRequests(requests.value);
  if (wishlist.status === 'fulfilled') {
    // Keep anything saved as a guest, then push it up so it isn't lost.
    const local = useWishlistStore.getState().wishlistIds;
    const remote = wishlist.value.productIds;
    const missing = local.filter((id) => !remote.includes(id));
    useWishlistStore.getState().setWishlist([...remote, ...missing]);
    missing.forEach((id) => wishlistService.toggle(id).catch(() => {}));
  }
}

export async function login(phone: string, otpCode: string, fullName?: string) {
  const session = await authService.verifyOtp({ phone, otp_code: otpCode, full_name: fullName });
  await tokenStorage.set({ accessToken: session.access_token, refreshToken: session.refresh_token });
  useUserStore.getState().setSession(session.user);
  await syncAccountData();
}

export async function logout() {
  await tokenStorage.clear();
  if (env.USE_MOCK_API) mockServer.restoreSession(null);
  useUserStore.getState().resetToGuest();
  useRequestStore.getState().setRequests([]);
  useWishlistStore.getState().clearWishlist();
  queryClient.removeQueries({ queryKey: ['account'] });
}

function whenHydrated(store: { persist: { hasHydrated: () => boolean; onFinishHydration: (fn: () => void) => () => void } }) {
  return new Promise<void>((resolve) => {
    if (store.persist.hasHydrated()) return resolve();
    const unsub = store.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
}

/** Called once on app start. */
export async function bootstrapSession() {
  setSessionExpiredHandler(() => {
    logout();
  });

  await whenHydrated(useUserStore);
  const { isAuthenticated, user } = useUserStore.getState();
  const tokens = await tokenStorage.get();

  if (isAuthenticated && !tokens) {
    // Persisted flag without tokens (e.g. storage cleared) → treat as guest.
    useUserStore.getState().resetToGuest();
    return;
  }
  if (env.USE_MOCK_API) {
    await Promise.all([whenHydrated(useRequestStore), whenHydrated(useWishlistStore)]);
    mockServer.restoreSession(isAuthenticated ? user : null, {
      orders: useUserStore.getState().orders,
      requests: useRequestStore.getState().requests,
      wishlistIds: useWishlistStore.getState().wishlistIds,
    });
  }
  syncAccountData();
}
