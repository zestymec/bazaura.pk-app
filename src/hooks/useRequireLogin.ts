import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth';
import type { AfterLogin, RootStackParamList } from '../types/navigation';

/**
 * Login gate (§7.2). Returns true when signed in; otherwise opens Login,
 * which continues to `then` after a successful login.
 */
export function useRequireLogin() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return useCallback(
    (reason: string, then?: AfterLogin) => {
      if (isLoggedIn) return true;
      navigation.navigate('Login', { reason, then });
      return false;
    },
    [isLoggedIn, navigation],
  );
}
