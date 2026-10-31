import { env } from '../config/env';
import { http, qs } from './client';
import type * as T from './types';
import { mockApi } from './mock/server';

/** GET /products query (FRONTEND.md §6). */
export type ProductFilters = {
  category?: string;
  gender?: T.Gender;
  season?: T.Season;
  size?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  q?: string;
  express?: boolean;
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
  sort?: T.ProductSort;
  page?: number;
  limit?: number;
};

/** One typed function per backend endpoint. Screens never call this directly — use src/api/hooks. */
const realApi = {
  // auth
  requestOtp: (body: T.OtpRequest) => http.post<T.OtpRequestResult>('/auth/otp/request', body),
  verifyOtp: (body: T.OtpVerify) => http.post<T.AuthResult>('/auth/otp/verify', body),

  // account
  me: () => http.get<T.UserProfile>('/users/me'),
  updateMe: (body: T.UserUpdate) => http.patch<T.UserProfile>('/users/me', body),
  addresses: () => http.get<T.AddressOut[]>('/users/me/addresses'),
  createAddress: (body: T.AddressCreate) => http.post<T.AddressOut>('/users/me/addresses', body),
  updateAddress: (id: string, body: T.AddressUpdate) => http.patch<T.AddressOut>(`/users/me/addresses/${id}`, body),
  deleteAddress: (id: string) => http.delete<null>(`/users/me/addresses/${id}`),

  // storefront
  config: () => http.get<T.StorefrontConfig>('/storefront/config'),
  home: () => http.get<T.HomeFeed>('/storefront/home'),

  // catalog
  categories: () => http.get<T.CategoryNode[]>('/categories'),
  category: (slug: string) => http.get<T.CategoryDetail>(`/categories/${slug}`),
  products: (f: ProductFilters = {}) => http.get<T.Page<T.ProductCard>>(`/products${qs(f)}`),
  product: (slug: string) => http.get<T.ProductDetail>(`/products/${slug}`),
  relatedProducts: (slug: string) => http.get<T.ProductCard[]>(`/products/${slug}/related`),
  reviews: (slug: string, page = 1) => http.get<T.Page<T.ReviewOut>>(`/products/${slug}/reviews${qs({ page })}`),
  createReview: (slug: string, body: T.ReviewCreate) => http.post<T.ReviewOut>(`/products/${slug}/reviews`, body),

  // cart & orders
  quoteCart: (body: T.CartQuoteRequest) => http.post<T.CartQuote>('/cart/quote', body),
  placeOrder: (body: T.OrderCreate) => http.post<T.OrderOut>('/orders', body),
  orders: (page = 1) => http.get<T.Page<T.OrderSummary>>(`/orders${qs({ page })}`),
  order: (id: string) => http.get<T.OrderOut>(`/orders/${id}`),
  cancelOrder: (id: string, body: T.OrderCancel = {}) => http.post<T.OrderOut>(`/orders/${id}/cancel`, body),

  // custom requests
  createCustomRequest: (body: T.CustomRequestCreate) => http.post<T.CustomRequestOut>('/custom-requests', body),
  customRequests: (page = 1) => http.get<T.CustomRequestOut[]>(`/custom-requests${qs({ page })}`),
  customRequest: (id: string) => http.get<T.CustomRequestOut>(`/custom-requests/${id}`),
  acceptQuote: (id: string) => http.post<T.CustomRequestOut>(`/custom-requests/${id}/accept-quote`),
  cancelCustomRequest: (id: string, body: T.CustomRequestCancel = {}) =>
    http.post<T.CustomRequestOut>(`/custom-requests/${id}/cancel`, body),

  // wishlist & uploads
  wishlist: () => http.get<T.ProductCard[]>('/wishlist'),
  addToWishlist: (productId: string) => http.put<null>(`/wishlist/${productId}`),
  removeFromWishlist: (productId: string) => http.delete<null>(`/wishlist/${productId}`),
  presignUpload: (body: T.PresignedUploadRequest) => http.post<T.PresignedUpload>('/uploads/presigned-url', body),
};

export type Api = typeof realApi;

export const api: Api = env.USE_MOCK_API ? mockApi : realApi;
