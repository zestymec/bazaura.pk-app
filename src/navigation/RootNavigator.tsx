import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ProductListScreen } from '../screens/shop/ProductListScreen';
import { ProductDetailScreen } from '../screens/product/ProductDetailScreen';
import { WriteReviewScreen } from '../screens/product/WriteReviewScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { OrderSuccessScreen } from '../screens/checkout/OrderSuccessScreen';
import { OrdersScreen } from '../screens/orders/OrdersScreen';
import { OrderDetailScreen } from '../screens/orders/OrderDetailScreen';
import { AddressesScreen } from '../screens/account/AddressesScreen';
import { AddressFormScreen } from '../screens/account/AddressFormScreen';
import { EditProfileScreen } from '../screens/account/EditProfileScreen';
import { RequestFormScreen } from '../screens/requests/RequestFormScreen';
import { RequestsScreen } from '../screens/requests/RequestsScreen';
import { RequestDetailScreen } from '../screens/requests/RequestDetailScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import type { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
      contentStyle: { backgroundColor: colors.surface.background },
    }}
  >
    <Stack.Screen name="MainTabs" component={TabNavigator} />
    <Stack.Screen name="ProductList" component={ProductListScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="WriteReview" component={WriteReviewScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    <Stack.Screen name="Checkout" component={CheckoutScreen} />
    <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} options={{ animation: 'fade', gestureEnabled: false }} />
    <Stack.Screen name="Orders" component={OrdersScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    <Stack.Screen name="Addresses" component={AddressesScreen} />
    <Stack.Screen name="AddressForm" component={AddressFormScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="RequestForm" component={RequestFormScreen} />
    <Stack.Screen name="Requests" component={RequestsScreen} />
    <Stack.Screen name="RequestDetail" component={RequestDetailScreen} />
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ presentation: 'modal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: colors.neutral.white } }}
    />
  </Stack.Navigator>
);
