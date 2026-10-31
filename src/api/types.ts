/**
 * Bazaura API v1 types — copied verbatim from docs/FRONTEND.md §4
 * (generated from the backend schema). Do not edit by hand; regenerate
 * when the backend's OpenAPI spec changes.
 */

// ---- Enums ----
export type Gender = "MEN" | "WOMEN" | "UNISEX" | "KIDS";
export type Season = "SUMMER" | "WINTER" | "ALL_SEASON";
export type DeliveryType = "STANDARD" | "EXPRESS";
export type OrderStatus = "PLACED" | "CONFIRMED" | "PACKED" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
export type CustomRequestType = "CUSTOM_ITEM" | "GIFT";
export type CustomRequestStatus = "SUBMITTED" | "IN_REVIEW" | "QUOTED" | "CONFIRMED" | "UNAVAILABLE" | "CANCELLED";
export type ContentType = "BANNER" | "STORY";
export type ContentTargetType = "CATEGORY" | "PRODUCT" | "COLLECTION" | "CUSTOM_REQUEST" | "URL";
export type ProductSort = "newest" | "popular" | "price_asc" | "price_desc" | "rating";

// ---- Envelope ----
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}
export interface ApiErrorBody {
  success: false;
  message: string;
  error: { code: string; details: unknown };
}
export interface Page<T> {
  items: T[];
  meta: PageMeta;
}

// ---- Request bodies (send these) ----
export interface OtpRequest {
  /** e.g. "03001234567" */
  phone: string;
}
export interface OtpVerify {
  /** e.g. "03001234567" */
  phone: string;
  /** e.g. "123456"; minLength 4; maxLength 8 */
  code: string;
  /** Used only when creating a new account */
  fullName?: string | null;
}
export interface RefreshRequest {
  refreshToken: string;
}
export interface UserUpdate {
  fullName?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  city?: string | null;
}
export interface AddressCreate {
  /** e.g. "Home" */
  label?: string | null;
  /** minLength 1; maxLength 128 */
  fullName: string;
  phone: string;
  alternatePhone?: string | null;
  /** minLength 1 */
  addressLine1: string;
  addressLine2?: string | null;
  /** e.g. "Gulberg III"; minLength 1; maxLength 128 */
  area: string;
  /** e.g. "Lahore"; minLength 1; maxLength 64 */
  city: string;
  postalCode?: string | null;
  /** default false */
  isDefault?: boolean;
}
export interface AddressUpdate {
  label?: string | null;
  fullName?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  area?: string | null;
  city?: string | null;
  postalCode?: string | null;
  isDefault?: boolean | null;
}
export interface CartItemIn {
  /** The size/colour variant being bought */
  variantId: string;
  /** min 1; max 20 */
  quantity: number;
}
export interface CartQuoteRequest {
  items: CartItemIn[];
  voucherCode?: string | null;
  /** default "STANDARD" */
  deliveryType?: DeliveryType;
  /** Delivery city; needed to check express eligibility */
  city?: string | null;
}
export interface OrderCreate {
  items: CartItemIn[];
  addressId: string;
  /** default "STANDARD" */
  deliveryType?: DeliveryType;
  voucherCode?: string | null;
  customerNote?: string | null;
}
export interface OrderCancel {
  reason?: string | null;
}
export interface DeliveryAddressIn {
  /** e.g. "Home" */
  label?: string | null;
  /** minLength 1; maxLength 128 */
  fullName: string;
  phone: string;
  alternatePhone?: string | null;
  /** minLength 1 */
  addressLine1: string;
  addressLine2?: string | null;
  /** e.g. "Gulberg III"; minLength 1; maxLength 128 */
  area: string;
  /** e.g. "Lahore"; minLength 1; maxLength 64 */
  city: string;
  postalCode?: string | null;
}
export interface CustomRequestCreate {
  /** default "CUSTOM_ITEM" */
  requestType?: CustomRequestType;
  /** e.g. "Black oversized hoodie, size XL"; minLength 2; maxLength 200 */
  itemName: string;
  /** minLength 5; maxLength 2000 */
  description: string;
  /** default 1; min 1; max 50 */
  quantity?: number;
  /** Expected price in PKR */
  budget?: number | null;
  referenceUrl?: string | null;
  imageUrls?: string[];
  /** default "STANDARD" */
  deliveryType?: DeliveryType;
  addressId?: string | null;
  deliveryAddress?: DeliveryAddressIn | null;
  giftMessage?: string | null;
  /** default false */
  giftWrap?: boolean;
  /** default false */
  hideSender?: boolean;
  deliverOn?: string | null;
}
export interface CustomRequestCancel {
  reason?: string | null;
}
export interface ReviewCreate {
  /** min 1; max 5 */
  rating: number;
  title?: string | null;
  /** minLength 3; maxLength 2000 */
  comment: string;
  sizePurchased?: string | null;
}
export interface PresignedUploadRequest {
  fileName: string;
  contentType: string;
  /** default "uploads" */
  folder?: string;
}

// ---- Response data (you receive these) ----
export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
export interface OtpRequestResult {
  expiresInSeconds: number;
  resendAvailableInSeconds: number;
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  /** default "bearer" */
  tokenType: string;
  expiresIn: number;
}
export interface UserOut {
  id: string;
  phone: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  city: string | null;
  role: "customer" | "staff" | "admin";
  createdAt: string;
}
export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  /** default "bearer" */
  tokenType: string;
  expiresIn: number;
  user: UserOut;
  isNewUser: boolean;
}
export interface AddressOut {
  /** e.g. "Home" */
  label: string | null;
  /** minLength 1; maxLength 128 */
  fullName: string;
  phone: string;
  alternatePhone: string | null;
  /** minLength 1 */
  addressLine1: string;
  addressLine2: string | null;
  /** e.g. "Gulberg III"; minLength 1; maxLength 128 */
  area: string;
  /** e.g. "Lahore"; minLength 1; maxLength 64 */
  city: string;
  postalCode: string | null;
  id: string;
  isDefault: boolean;
  isExpressEligible: boolean;
}
export interface UserProfile {
  id: string;
  phone: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  city: string | null;
  role: "customer" | "staff" | "admin";
  createdAt: string;
  addresses: AddressOut[];
}
export interface AddressSnapshot {
  fullName: string;
  phone: string;
  alternatePhone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  area: string;
  city: string;
  postalCode: string | null;
}
export interface SeoMeta {
  title: string;
  description: string;
  canonicalUrl: string;
  image: string | null;
}
export interface CategoryRef {
  id: string;
  name: string;
  slug: string;
}
export interface CategoryOut {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  imageUrl: string | null;
  iconName: string | null;
  isFeatured: boolean;
  displayOrder: number;
}
export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  imageUrl: string | null;
  iconName: string | null;
  isFeatured: boolean;
  displayOrder: number;
  children: CategoryNode[];
}
export interface CategoryDetail {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string | null;
  imageUrl: string | null;
  iconName: string | null;
  isFeatured: boolean;
  displayOrder: number;
  breadcrumbs: CategoryRef[];
  children: CategoryOut[];
  seo: SeoMeta;
}
export interface VariantOut {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  colorHex: string | null;
  price: number;
  stockQuantity: number;
  inStock: boolean;
}
export interface ProductCard {
  id: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  primaryImage: string | null;
  images: string[];
  badge: string | null;
  gender: Gender | null;
  season: Season | null;
  category: CategoryRef | null;
  ratingAvg: number;
  reviewCount: number;
  inStock: boolean;
  isExpressEligible: boolean;
  availableSizes: string[];
  availableColors: string[];
}
export interface ProductDetail {
  id: string;
  slug: string;
  title: string;
  brand: string;
  price: number;
  compareAtPrice: number | null;
  discountPercent: number | null;
  primaryImage: string | null;
  images: string[];
  badge: string | null;
  gender: Gender | null;
  season: Season | null;
  category: CategoryRef | null;
  ratingAvg: number;
  reviewCount: number;
  inStock: boolean;
  isExpressEligible: boolean;
  availableSizes: string[];
  availableColors: string[];
  shortDescription: string | null;
  description: string;
  fabric: string | null;
  fit: string | null;
  careInstructions: string | null;
  sizeChartUrl: string | null;
  attributes: Record<string, unknown>;
  tags: string[];
  variants: VariantOut[];
  breadcrumbs: CategoryRef[];
  seo: SeoMeta;
  updatedAt: string;
}
export interface ReviewOut {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  comment: string;
  sizePurchased: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string;
}
export interface CartLine {
  variantId: string;
  productId: string;
  productSlug: string;
  title: string;
  imageUrl: string | null;
  sku: string;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableQuantity: number;
}
export interface CartIssue {
  code: "VARIANT_NOT_FOUND" | "OUT_OF_STOCK" | "INSUFFICIENT_STOCK" | "VOUCHER_INVALID" | "EXPRESS_UNAVAILABLE";
  message: string;
  variantId: string | null;
}
export interface AppliedVoucher {
  code: string;
  description: string;
  discount: number;
}
export interface DeliveryOption {
  type: DeliveryType;
  label: string;
  estimate: string;
  fee: number;
  available: boolean;
}
export interface CartQuote {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  /** default 0 */
  extraFee: number;
  total: number;
  deliveryType: DeliveryType;
  deliveryEstimate: string;
  deliveryOptions: DeliveryOption[];
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  appliedVoucher: AppliedVoucher | null;
  issues: CartIssue[];
  canCheckout: boolean;
}
export interface OrderItemOut {
  id: string;
  productId: string | null;
  variantId: string | null;
  title: string;
  productSlug: string | null;
  imageUrl: string | null;
  sku: string | null;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}
export interface OrderStatusEventOut {
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}
export interface TimelineStep {
  status: OrderStatus;
  label: string;
  isCompleted: boolean;
  isCurrent: boolean;
  completedAt: string | null;
}
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  source: "CATALOG" | "CUSTOM_REQUEST";
  total: number;
  itemCount: number;
  deliveryType: DeliveryType;
  createdAt: string;
}
export interface OrderOut {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  source: "CATALOG" | "CUSTOM_REQUEST";
  total: number;
  itemCount: number;
  deliveryType: DeliveryType;
  createdAt: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  extraFee: number;
  voucherCode: string | null;
  /** default "CASH_ON_DELIVERY" */
  paymentMethod: "CASH_ON_DELIVERY";
  deliveryEstimate: string;
  shippingAddress: AddressSnapshot;
  customerNote: string | null;
  cancelReason: string | null;
  canCancel: boolean;
  items: OrderItemOut[];
  timeline: TimelineStep[];
  statusHistory: OrderStatusEventOut[];
}
export interface QuoteOut {
  itemPrice: number;
  deliveryFee: number;
  extraFee: number;
  total: number;
  notes: string;
  validUntil: string;
}
export interface CustomRequestOut {
  id: string;
  requestNumber: string;
  requestType: CustomRequestType;
  status: CustomRequestStatus;
  itemName: string;
  description: string;
  quantity: number;
  budget: number | null;
  referenceUrl: string | null;
  imageUrls: string[];
  deliveryType: DeliveryType;
  deliveryAddress: AddressSnapshot;
  giftMessage: string | null;
  giftWrap: boolean;
  hideSender: boolean;
  deliverOn: string | null;
  staffNote: string | null;
  quote: QuoteOut | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface ContentBlockOut {
  id: string;
  contentType: ContentType;
  title: string;
  subtitle: string | null;
  tag: string | null;
  imageUrl: string;
  mobileImageUrl: string | null;
  ctaText: string | null;
  targetType: ContentTargetType;
  targetValue: string | null;
  displayOrder: number;
}
export interface HomeFeed {
  banners: ContentBlockOut[];
  stories: ContentBlockOut[];
  featuredCategories: CategoryOut[];
  newArrivals: ProductCard[];
  bestsellers: ProductCard[];
  onSale: ProductCard[];
}
export interface StorefrontConfig {
  /** default "PKR" */
  currency: string;
  /** default ["CASH_ON_DELIVERY"] */
  paymentMethods: string[];
  freeShippingThreshold: number;
  expressDeliveryHours: number;
  expressDeliveryCities: string[];
  deliveryOptions: DeliveryOption[];
  giftWrapFee: number;
}
export interface PresignedUpload {
  uploadUrl: string;
  fileUrl: string;
  expiresInSeconds: number;
}
