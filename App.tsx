import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { OfflineBanner } from './src/components/common/OfflineBanner';
import { ToastHost } from './src/components/common/Toast';
import { navigationRef } from './src/navigation/navigationRef';
import { queryClient } from './src/hooks/queryClient';
import { bootstrapSession } from './src/store/session';
import { colors } from './src/theme/colors';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary[500],
    background: colors.surface.background,
    card: colors.neutral.white,
    text: colors.text.primary,
    border: colors.surface.divider,
    notification: colors.primary[500],
  },
};

export default function App() {
  useEffect(() => {
    bootstrapSession();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar barStyle="dark-content" backgroundColor={colors.neutral.white} />
            <NavigationContainer ref={navigationRef} theme={navigationTheme}>
              <RootNavigator />
            </NavigationContainer>
            <OfflineBanner />
            <ToastHost />
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.background,
  },
});
