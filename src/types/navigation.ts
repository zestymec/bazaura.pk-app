import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ProductCard } from '../api/types';
import type { ProductFilters } from '../api/endpoints';

export type ShopParams = { filters?: Omit<ProductFilters, 'page' | 'limit'>; title?: string; focusSearch?: boolean };

export type MainTabParamList = {
  HomeTab: undefined;
  ShopTab: ShopParams | undefined;
  WishlistTab: undefined;
  BagTab: undefined;
  AccountTab: undefined;
};

/** Where to go after a guest logs in (login gate, §7.2). */
export type AfterLogin = { [K in keyof RootStackParamList]: { name: K; params?: RootStackParamList[K] } }[keyof RootStackParamList];

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  ProductList: ShopParams;
  ProductDetail: { slug: string; preview?: ProductCard };
  WriteReview: { slug: string; title: string; sizes: string[] };
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  Orders: undefined;
  OrderDetail: { orderId: string };
  Addresses: { selectMode?: boolean } | undefined;
  AddressForm: { addressId?: string } | undefined;
  EditProfile: undefined;
  RequestForm: { type?: 'CUSTOM_ITEM' | 'GIFT'; itemName?: string } | undefined;
  Requests: undefined;
  RequestDetail: { requestId: string };
  Login: { reason?: string; then?: AfterLogin } | undefined;
};
