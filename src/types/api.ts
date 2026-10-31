/**
 * Request / response payloads for the Bazaura REST API (backend_blueprint.md §3).
 * Shapes here are what the client sends and what it expects inside `data`.
 */
import { Category, Product } from './product';
import { PromoBanner, StoryItem } from './content';
import { DeliveryType, Voucher } from './cart';
import { Order, PaymentMethod, ShippingAddress } from './order';
import { CustomItemRequest } from './request';
import { UserProfile } from './user';

export interface Pagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

/* ── Auth ─────────────────────────────────────────────── */
export interface OtpRequestResponse {
  expires_in_seconds: number;
  resend_available_in_seconds: number;
}

export interface OtpVerifyPayload {
  phone: string;
  otp_code: string;
  full_name?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: UserProfile;
}

/* ── Catalog ──────────────────────────────────────────── */
export type ProductSort = 'popularity' | 'priceAsc' | 'priceDesc' | 'rating' | 'newest';

export interface ProductListParams {
  search?: string;
  category_id?: string;
  express_only?: boolean;
  sort_by?: ProductSort;
  page?: number;
  limit?: number;
}

export interface FlashDealsResponse {
  countdown_seconds_remaining: number;
  items: Product[];
}

export interface HomeContent {
  stories: StoryItem[];
  heroBanners: PromoBanner[];
  categories: Category[];
  flashDeals: Product[];
  expressRail: Product[];
}

/* ── Cart & Orders ────────────────────────────────────── */
export interface CartLinePayload {
  productId: string;
  quantity: number;
  selectedVariants: Record<string, string>;
}

export interface CartValidatePayload {
  items: CartLinePayload[];
  voucherCode?: string;
  deliveryType: DeliveryType;
  city: string;
}

export interface CartValidation {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  itemCount: number;
  appliedVoucher: Voucher | null;
  deliveryType: DeliveryType;
  freeShippingUnlocked: boolean;
  freeShippingThreshold: number;
}

export interface CreateOrderPayload {
  items: (CartLinePayload & { unitPrice: number })[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  deliveryType: DeliveryType;
  shippingAddressId: string;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
}

/* ── Users ────────────────────────────────────────────── */
export type NewAddressPayload = Omit<ShippingAddress, 'id' | 'isLahore'> & { isLahore?: boolean };

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
}

/* ── Sourcing concierge ───────────────────────────────── */
export type CreateRequestPayload = Pick<
  CustomItemRequest,
  | 'itemName'
  | 'category'
  | 'brandOrModel'
  | 'expectedPrice'
  | 'referenceUrl'
  | 'description'
  | 'imageUris'
  | 'urgency'
  | 'contactPhone'
  | 'deliveryAddress'
  | 'city'
>;

export interface AcceptQuoteResponse {
  id: string;
  status: 'CONFIRMED';
  orderId: string;
}

/* ── Wishlist & uploads ───────────────────────────────── */
export interface WishlistResponse {
  productIds: string[];
  products: Product[];
}

export interface PresignedUpload {
  uploadUrl: string;
  finalFileUrl: string;
  expiresInSeconds: number;
}

export type { Order };
