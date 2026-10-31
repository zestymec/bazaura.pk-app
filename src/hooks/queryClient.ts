import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { ApiError } from '../api/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Catalog data is fine to show from cache for a minute; screens feel instant
      // when navigating back and forth, and refetches happen in the background.
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      // The HTTP client already retries network errors; only retry 5xx here.
      retry: (failureCount, error) =>
        failureCount < 1 && error instanceof ApiError && error.kind === 'server',
      refetchOnWindowFocus: true,
    },
    mutations: { retry: false },
  },
});

// Pause queries while offline and refetch when the connection comes back.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
);

// Treat "app returned to foreground" as window focus so stale data refreshes.
AppState.addEventListener('change', (status) => {
  if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
});
