/**
 * In-app mock backend. Implements the same contract as the FastAPI service so
 * the app is fully usable before the backend ships. Delete this folder (and
 * set env.USE_MOCK_API = false) once the real API is live.
 */
import { env } from '../../config/env';
import { ApiError } from '../errors';
import { PRODUCTS } from '../../data/products';
import { CATEGORIES } from '../../data/categories';
import { PROMO_BANNERS, STORY_ITEMS } from '../../data/banners';
import { Product } from '../../types/product';
import { Order, ShippingAddress } from '../../types/order';
import { CustomItemRequest } from '../../types/request';
import { UserProfile } from '../../types/user';
import {
  AcceptQuoteResponse,
  AuthSession,
  CartValidatePayload,
  CartValidation,
  CreateOrderPayload,
  CreateRequestPayload,
  FlashDealsResponse,
  HomeContent,
  NewAddressPayload,
  OtpRequestResponse,
  OtpVerifyPayload,
  Paginated,
  PresignedUpload,
  ProductListParams,
  UpdateProfilePayload,
  WishlistResponse,
} from '../../types/api';
import { AVAILABLE_VOUCHERS, FREE_SHIPPING_THRESHOLD, calculateTotals, unitPriceFor } from '../../utils/pricing';
import { generateId } from '../../utils/formatters';

const delay = <T>(value: T, ms = env.MOCK_LATENCY_MS): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const timeLabel = (d = new Date()) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const dateTimeLabel = (d = new Date()) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });

/* ── Seed data ───────────────────────────────────────── */

const productById = (id: string) => PRODUCTS.find((p) => p.id === id);

const DEMO_ADDRESSES: ShippingAddress[] = [
  {
    id: 'addr_1',
    fullName: 'Muhammad Ali',
    phone: '03001234567',
    addressLine1: 'House #42, Street 14, Sector Y, Phase 3',
    area: 'DHA Phase 3',
    city: 'Lahore',
    postalCode: '54792',
    isLahore: true,
    isDefault: true,
  },
  {
    id: 'addr_2',
    fullName: 'Muhammad Ali (Office)',
    phone: '03001234567',
    addressLine1: 'Office 402, 4th Floor, Pace Tower, Gulberg III',
    area: 'Gulberg III',
    city: 'Lahore',
    postalCode: '54660',
    isLahore: true,
    isDefault: false,
  },
];

const db = {
  user: null as UserProfile | null,
  wishlist: new Set<string>(['prod_1', 'prod_8']),
  orders: [] as Order[],
  requests: [] as CustomItemRequest[],
};

function seedAccount(phone: string, fullName?: string): UserProfile {
  const coffee = productById('prod_4');
  db.orders = coffee
    ? [
        {
          id: 'ord_1001',
          orderNumber: 'BZ-94821',
          items: [{ id: 'prod_4_standard', product: coffee, quantity: 2, unitPrice: coffee.price, addedAt: Date.now() - 86400000 }],
          subtotal: coffee.price * 2,
          discount: 500,
          deliveryFee: 0,
          total: coffee.price * 2 - 500,
          deliveryType: 'LAHORE_EXPRESS_2HR',
          estimatedDeliveryText: 'Delivered in 1 hr 18 mins (Lahore Express)',
          shippingAddress: DEMO_ADDRESSES[0],
          paymentMethod: 'CASH_ON_DELIVERY',
          paymentStatus: 'COD',
          status: 'DELIVERED',
          createdAt: '2026-08-25T11:20:00.000Z',
          timeline: [
            { status: 'PLACED', title: 'Order Placed', description: 'Order received', timestamp: '11:20 AM', isCompleted: true },
            { status: 'CONFIRMED', title: 'Confirmed & Packed', description: 'Packed at Gulberg Hub', timestamp: '11:32 AM', isCompleted: true },
            { status: 'OUT_FOR_DELIVERY_2HR', title: 'Express Rider Dispatched', description: 'Rider on bike en route', timestamp: '11:45 AM', isCompleted: true },
            { status: 'DELIVERED', title: 'Delivered to Doorstep', description: 'Received at doorstep', timestamp: '12:38 PM', isCompleted: true },
          ],
        },
      ]
    : [];

  db.requests = [
    {
      id: 'req_101',
      itemName: 'Sony PlayStation 5 DualSense Edge Wireless Controller',
      category: 'Electronics & Smart Tech',
      brandOrModel: 'Sony CFI-ZCP1',
      expectedPrice: 58000,
      referenceUrl: 'https://direct.playstation.com/dualsense-edge',
      description: 'Need the official pro controller with swappable thumbstick caps. Need delivery in Gulberg III Lahore.',
      imageUris: ['https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80'],
      urgency: 'LAHORE_2HR_EXPRESS',
      contactPhone: phone,
      deliveryAddress: 'House 42, Main Boulevard, Gulberg III',
      city: 'Lahore',
      status: 'PRICE_QUOTED',
      createdAt: '2026-08-26T14:30:00.000Z',
      updatedAt: '2026-08-26T15:10:00.000Z',
      quote: {
        quotedPrice: 59500,
        estimatedDeliveryHours: 2,
        deliveryType: 'LAHORE_EXPRESS_2HR',
        notes: 'Original sealed US import located at our Gulberg fulfillment center. Ready for 120-minute dispatch.',
        validUntil: '2026-12-28T23:59:59.000Z',
      },
      statusTimeline: [
        { status: 'SUBMITTED', label: 'Request Submitted', timestamp: '26 Aug, 02:30 pm', description: 'Your item request was received by our Bazaura Sourcing Desk.' },
        { status: 'SOURCING_IN_PROGRESS', label: 'Sourcing In Progress', timestamp: '26 Aug, 02:45 pm', description: 'Our Lahore procurement team verified inventory with authorized distributors.' },
        { status: 'PRICE_QUOTED', label: 'Price Quoted & Verified', timestamp: '26 Aug, 03:10 pm', description: 'Quote prepared: Rs. 59,500 with 2-Hour Express Lahore Delivery.' },
      ],
    },
  ];

  return {
    id: 'usr_bazaura_01',
    fullName: fullName?.trim() || 'Muhammad Ali',
    email: '',
    phone,
    selectedCity: 'Lahore',
    isLahoreExpressEligible: true,
    memberSince: new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
    defaultAddressId: 'addr_1',
    addresses: DEMO_ADDRESSES.map((a) => ({ ...a, phone })),
  };
}

function requireUser(): UserProfile {
  if (!db.user) throw new ApiError('unauthorized', 'Please log in to continue.', 401);
  return db.user;
}

/* ── Catalog helpers ─────────────────────────────────── */

function filterProducts(params: ProductListParams): Product[] {
  const q = params.search?.toLowerCase().trim();
  const cat = params.category_id ? CATEGORIES.find((c) => c.id === params.category_id || c.slug === params.category_id) : undefined;
  let list = PRODUCTS.filter((p) => {
    if (params.express_only && !p.isLahoreExpress2Hour) return false;
    if (cat) {
      const key = cat.slug.toLowerCase();
      if (!p.category.toLowerCase().includes(key) && p.category !== cat.name) return false;
    }
    if (q) {
      return (
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });
  switch (params.sort_by) {
    case 'priceAsc':
      list = [...list].sort((a, b) => a.price - b.price);
      break;
    case 'priceDesc':
      list = [...list].sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      list = [...list].sort((a, b) => b.rating - a.rating);
      break;
  }
  return list;
}

/* ── Mock API surface (mirrors src/api/services) ─────── */

export const mockServer = {
  auth: {
    requestOtp: (phone: string) =>
      delay<OtpRequestResponse>({ expires_in_seconds: 120, resend_available_in_seconds: 30 }),

    verifyOtp: async (payload: OtpVerifyPayload): Promise<AuthSession> => {
      // Any 4–6 digit code works in mock mode.
      if (!/^\d{4,6}$/.test(payload.otp_code)) {
        throw new ApiError('validation', 'Invalid OTP code. Please try again.', 422);
      }
      db.user = seedAccount(payload.phone, payload.full_name);
      return delay({
        access_token: `mock_access_${Date.now()}`,
        refresh_token: `mock_refresh_${Date.now()}`,
        token_type: 'bearer' as const,
        expires_in: 86400,
        user: db.user,
      });
    },
  },

  users: {
    me: async () => delay(requireUser()),
    update: async (data: UpdateProfilePayload) => {
      db.user = { ...requireUser(), ...data };
      return delay(db.user);
    },
    setCity: async (city: string) => {
      const user = requireUser();
      user.selectedCity = city;
      user.isLahoreExpressEligible = city.toLowerCase() === 'lahore';
      return delay({ selectedCity: city, isLahoreExpressEligible: user.isLahoreExpressEligible });
    },
    addAddress: async (data: NewAddressPayload) => {
      const user = requireUser();
      const address: ShippingAddress = { ...data, id: generateId('addr'), isLahore: data.city.trim().toLowerCase() === 'lahore' };
      user.addresses = [...user.addresses, address];
      return delay(address);
    },
    deleteAddress: async (id: string) => {
      const user = requireUser();
      user.addresses = user.addresses.filter((a) => a.id !== id);
      return delay(undefined);
    },
  },

  products: {
    list: async (params: ProductListParams): Promise<Paginated<Product>> => {
      const all = filterProducts(params);
      const page = params.page ?? 1;
      const limit = params.limit ?? 20;
      return delay({
        items: all.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, total_items: all.length, total_pages: Math.max(1, Math.ceil(all.length / limit)) },
      });
    },
    detail: async (id: string) => {
      const p = productById(id);
      if (!p) throw new ApiError('not_found', 'This product is no longer available.', 404);
      return delay(p);
    },
    flashDeals: async (): Promise<FlashDealsResponse> => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return delay({
        countdown_seconds_remaining: Math.floor((midnight.getTime() - now.getTime()) / 1000),
        items: PRODUCTS.filter((p) => (p.discountPercent ?? 0) >= 10),
      });
    },
  },

  content: {
    home: async (): Promise<HomeContent> =>
      delay({
        stories: STORY_ITEMS,
        heroBanners: PROMO_BANNERS,
        categories: CATEGORIES,
        flashDeals: PRODUCTS.filter((p) => (p.discountPercent ?? 0) >= 10),
        expressRail: PRODUCTS.filter((p) => p.isLahoreExpress2Hour),
      }),
  },

  cart: {
    validate: async (payload: CartValidatePayload): Promise<CartValidation> => {
      const lines = payload.items.map((l) => {
        const product = productById(l.productId);
        if (!product) throw new ApiError('validation', 'An item in your cart is no longer available.', 422);
        if (!product.inStock) throw new ApiError('validation', `${product.title} is out of stock.`, 422);
        return { unitPrice: unitPriceFor(product, l.selectedVariants), quantity: l.quantity };
      });
      const code = payload.voucherCode?.trim().toUpperCase();
      const voucher = code ? AVAILABLE_VOUCHERS.find((v) => v.code === code) ?? null : null;
      if (code && !voucher) throw new ApiError('validation', 'Invalid voucher code.', 422);
      const totals = calculateTotals(lines, payload.deliveryType, voucher);
      if (voucher?.minOrderAmount && totals.subtotal < voucher.minOrderAmount) {
        throw new ApiError('validation', `Voucher requires a minimum order of Rs. ${voucher.minOrderAmount.toLocaleString('en-PK')}.`, 422);
      }
      return delay({
        ...totals,
        appliedVoucher: voucher,
        deliveryType: payload.deliveryType,
        freeShippingUnlocked: totals.subtotal >= FREE_SHIPPING_THRESHOLD,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
      });
    },
  },

  orders: {
    list: async () => {
      requireUser();
      return delay(db.orders);
    },
    detail: async (id: string) => {
      requireUser();
      const o = db.orders.find((x) => x.id === id);
      if (!o) throw new ApiError('not_found', 'Order not found.', 404);
      return delay(o);
    },
    create: async (payload: CreateOrderPayload): Promise<Order> => {
      const user = requireUser();
      const address = user.addresses.find((a) => a.id === payload.shippingAddressId);
      if (!address) throw new ApiError('validation', 'Please choose a delivery address.', 422);
      const now = new Date();
      const isExpress = address.isLahore && payload.deliveryType === 'LAHORE_EXPRESS_2HR';
      const orderNumber = `BZ-${Math.floor(10000 + Math.random() * 90000)}`;
      const order: Order = {
        id: generateId('ord'),
        orderNumber,
        items: payload.items.map((l) => {
          const product = productById(l.productId)!;
          return { id: `${l.productId}_${Date.now()}`, product, quantity: l.quantity, selectedVariants: l.selectedVariants, unitPrice: l.unitPrice, addedAt: now.getTime() };
        }),
        subtotal: payload.subtotal,
        discount: payload.discount,
        deliveryFee: payload.deliveryFee,
        total: payload.total,
        deliveryType: payload.deliveryType,
        estimatedDeliveryText: isExpress
          ? 'Guaranteed within 120 minutes (Lahore Express)'
          : 'Estimated delivery in 2-3 business days',
        shippingAddress: address,
        paymentMethod: payload.paymentMethod,
        paymentStatus: payload.paymentMethod === 'CASH_ON_DELIVERY' ? 'COD' : 'PENDING',
        status: 'PLACED',
        createdAt: now.toISOString(),
        timeline: [
          { status: 'PLACED', title: 'Order Placed Successfully', description: `Order ${orderNumber} received. Preparing for fulfillment.`, timestamp: timeLabel(now), isCompleted: true },
          { status: 'PREPARING', title: 'Packing at Nearest Fulfillment Hub', description: isExpress ? 'Picking items at Lahore Central Hub.' : 'Handing over to our courier partner.', timestamp: 'In progress', isCompleted: false },
          { status: 'OUT_FOR_DELIVERY_2HR', title: isExpress ? '⚡ 2-Hour Express Rider Dispatch' : 'Courier Out for Delivery', description: isExpress ? 'Rider assigned for rapid delivery in under 120 mins.' : 'Courier en route to your city address.', timestamp: isExpress ? 'Estimated in 35 mins' : 'Estimated 2-3 Days', isCompleted: false },
          { status: 'DELIVERED', title: 'Delivered to Doorstep', description: 'Delivered by Bazaura', timestamp: 'Pending', isCompleted: false },
        ],
      };
      db.orders = [order, ...db.orders];
      return delay(order, 700);
    },
  },

  requests: {
    list: async () => {
      requireUser();
      return delay(db.requests);
    },
    create: async (payload: CreateRequestPayload): Promise<CustomItemRequest> => {
      requireUser();
      const now = new Date();
      const req: CustomItemRequest = {
        ...payload,
        id: generateId('req'),
        status: 'SUBMITTED',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        statusTimeline: [
          { status: 'SUBMITTED', label: 'Request Submitted', timestamp: dateTimeLabel(now), description: 'Your custom request has been routed to our Bazaura Concierge team.' },
        ],
      };
      db.requests = [req, ...db.requests];
      return delay(req, 600);
    },
    acceptQuote: async (id: string): Promise<AcceptQuoteResponse> => {
      requireUser();
      db.requests = db.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'CONFIRMED',
              updatedAt: new Date().toISOString(),
              statusTimeline: [
                ...r.statusTimeline,
                { status: 'CONFIRMED', label: 'Quote Accepted & Confirmed', timestamp: dateTimeLabel(), description: 'Sourcing confirmed! Item is being packed for express courier dispatch.' },
              ],
            }
          : r,
      );
      return delay({ id, status: 'CONFIRMED' as const, orderId: generateId('ord') });
    },
    cancel: async (id: string) => {
      requireUser();
      db.requests = db.requests.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'UNAVAILABLE',
              statusTimeline: [...r.statusTimeline, { status: 'UNAVAILABLE', label: 'Request Cancelled', timestamp: dateTimeLabel(), description: 'Request was cancelled by you.' }],
            }
          : r,
      );
      return delay(undefined);
    },
  },

  wishlist: {
    list: async (): Promise<WishlistResponse> => {
      requireUser();
      const productIds = [...db.wishlist];
      return delay({ productIds, products: productIds.map(productById).filter(Boolean) as Product[] });
    },
    toggle: async (productId: string) => {
      requireUser();
      if (db.wishlist.has(productId)) db.wishlist.delete(productId);
      else db.wishlist.add(productId);
      return delay({ productId, isInWishlist: db.wishlist.has(productId) }, 150);
    },
  },

  uploads: {
    presignedUrl: async (fileName: string): Promise<PresignedUpload> =>
      delay({ uploadUrl: '', finalFileUrl: `mock://uploads/${fileName}`, expiresInSeconds: 300 }),
  },

  /** Lets the auth store restore a session after an app restart in mock mode. */
  restoreSession(
    user: UserProfile | null,
    cached?: { orders: Order[]; requests: CustomItemRequest[]; wishlistIds: string[] },
  ) {
    if (user && !db.user) {
      seedAccount(user.phone, user.fullName);
      db.user = user;
      // The mock "database" lives in memory; rehydrate it from what the app
      // persisted so orders placed before a restart don't vanish.
      if (cached?.orders.length) db.orders = cached.orders;
      if (cached?.requests.length) db.requests = cached.requests;
      if (cached) db.wishlist = new Set(cached.wishlistIds);
    }
    if (!user) db.user = null;
  },
};
