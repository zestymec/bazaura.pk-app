import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { ProductDetailScreen } from '../screens/product/ProductDetailScreen';
import { CheckoutScreen } from '../screens/checkout/CheckoutScreen';
import { OrderSuccessScreen } from '../screens/checkout/OrderSuccessScreen';
import { WishlistScreen } from '../screens/wishlist/WishlistScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="OrderSuccess"
        component={OrderSuccessScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};
