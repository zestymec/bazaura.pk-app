import { api } from '../api/endpoints';
import { clearTokens, hasSession, saveTokens, setSessionExpiredHandler } from '../api/client';
import type { AuthResult } from '../api/types';
import { qk } from '../api/queryKeys';
import { queryClient } from '../hooks/queryClient';
import { navigationRef } from '../navigation/navigationRef';
import { useAuthStore } from './auth';

/** Stores the session from POST /auth/otp/verify (§7.2). */
export async function completeLogin(result: AuthResult) {
  await saveTokens(result.accessToken, result.refreshToken);
  const auth = useAuthStore.getState();
  auth.setUser(result.user);
  auth.setLoggedIn(true);
  queryClient.invalidateQueries({ queryKey: qk.me });
  queryClient.invalidateQueries({ queryKey: qk.wishlist });
}

/** No logout endpoint exists: clear tokens, auth state and cached server data. Keeps the cart. */
export async function logout() {
  await clearTokens();
  useAuthStore.getState().reset();
  queryClient.clear();
}

/** App start (§7.1). */
export async function bootstrapSession() {
  setSessionExpiredHandler(() => {
    logout();
    if (navigationRef.isReady()) navigationRef.navigate('Login', { reason: 'Your session expired. Please log in again.' });
  });

  queryClient.prefetchQuery({ queryKey: qk.config, queryFn: api.config, staleTime: 10 * 60_000 });

  const loggedIn = await hasSession();
  const auth = useAuthStore.getState();
  if (!loggedIn) {
    if (auth.user) auth.reset();
    return;
  }
  auth.setLoggedIn(true);
  queryClient.prefetchQuery({
    queryKey: qk.me,
    queryFn: async () => {
      const me = await api.me();
      useAuthStore.getState().setUser(me);
      return me;
    },
  });
}
