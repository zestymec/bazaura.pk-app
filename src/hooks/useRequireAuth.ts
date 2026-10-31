import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUserStore } from '../store/useUserStore';
import { RootStackParamList } from '../types/navigation';

/**
 * Guests can browse and fill a cart freely; actions that need an account
 * (placing an order, submitting a sourcing request) go through this gate.
 * Returns true when the user is already signed in.
 */
export function useRequireAuth() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  return useCallback(
    (reason?: string) => {
      if (isAuthenticated) return true;
      navigation.navigate('Login', { reason });
      return false;
    },
    [isAuthenticated, navigation],
  );
}
