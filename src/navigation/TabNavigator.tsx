import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from '../components/navigation/TabBar';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import { WishlistScreen } from '../screens/wishlist/WishlistScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { AccountScreen } from '../screens/account/AccountScreen';
import type { MainTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => (
  <Tab.Navigator tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, lazy: true }}>
    <Tab.Screen name="HomeTab" component={HomeScreen} />
    <Tab.Screen name="ShopTab" component={ShopScreen} />
    <Tab.Screen name="WishlistTab" component={WishlistScreen} />
    <Tab.Screen name="BagTab" component={CartScreen} />
    <Tab.Screen name="AccountTab" component={AccountScreen} />
  </Tab.Navigator>
);
