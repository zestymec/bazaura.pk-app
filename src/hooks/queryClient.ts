import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState } from 'react-native';
import { ApiError } from '../api/client';
import { netInfo } from '../utils/netinfo';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      // FRONTEND.md §8: retry network/5xx reads twice, never retry 4xx.
      retry: (count, err) => (!(err instanceof ApiError) || err.status >= 500 || err.status === 0 ? count < 2 : false),
    },
    // Never auto-retry orders, cancels etc.
    mutations: { retry: false },
  },
});

// Pause queries offline; refetch when the connection returns.
onlineManager.setEventListener((setOnline) =>
  netInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
);

// Refetch stale data when the app comes back to the foreground (§9).
AppState.addEventListener('change', (status) => focusManager.setFocused(status === 'active'));
