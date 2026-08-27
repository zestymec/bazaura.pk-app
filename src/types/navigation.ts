import { Product } from './product';
import { CustomItemRequest } from './request';
import { Order } from './order';

export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: { categorySlug?: string; searchQuery?: string } | undefined;
  RequestItemTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList; params?: any } | undefined;
  ProductDetail: { product: Product };
  CategoryProducts: { categoryId: string; categoryName: string };
  Checkout: undefined;
  OrderSuccess: { order: Order };
  OrderDetail: { orderId: string };
  RequestDetail: { request: CustomItemRequest };
  Wishlist: undefined;
  AddressManagement: undefined;
  SupportHelp: undefined;
};
