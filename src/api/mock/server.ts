/**
 * Demo backend. Implements the same contract and business rules as the
 * FastAPI service (FRONTEND.md §6–§8) so every screen works before the real
 * server is reachable. Money is calculated HERE (standing in for the server),
 * never in screens. Set env.USE_MOCK_API = false to bypass it entirely.
 *
 * Demo-only behaviour: OTP is always 123456 (as on the dev backend), and a
 * custom request is auto-quoted ~20 s after submission so the accept flow
 * can be tried without a staff dashboard.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../../config/env';
import { ApiError } from '../client';
import { getAccessToken } from '../tokens';
import type * as T from '../types';
import type { Api, ProductFilters } from '../endpoints';
import {
  ALL_CATEGORIES,
  CREATED_DAYS_AGO,
  FEATURED_SLUGS,
  MOCK_CATEGORIES,
  MOCK_CONFIG,
  MOCK_CONTENT,
  MOCK_PRODUCTS,
  MOCK_VOUCHERS,
} from './data';

/* ── Persistence ───────────────────────────────────────── */

interface Account {
  profile: Omit<T.UserProfile, 'addresses'>;
  addresses: T.AddressOut[];
  orders: T.OrderOut[];
  requests: T.CustomRequestOut[];
  wishlist: string[];
}

interface Db {
  accounts: Record<string, Account>; // keyed by token
  stock: Record<string, number>; // variantId → quantity override
  reviews: Record<string, T.ReviewOut[]>; // slug → user-written reviews
  seq: number;
}

const DB_KEY = 'bazaura.mockdb.v2';
let db: Db | null = null;

async function loadDb(): Promise<Db> {
  if (db) return db;
  try {
    const raw = await AsyncStorage.getItem(DB_KEY);
    db = raw ? (JSON.parse(raw) as Db) : null;
  } catch {
    db = null;
  }
  db ??= { accounts: {}, stock: {}, reviews: {}, seq: 1 };
  return db;
}

function saveDb() {
  if (db) AsyncStorage.setItem(DB_KEY, JSON.stringify(db)).catch(() => {});
}

/* ── Helpers ───────────────────────────────────────────── */

const wait = <V>(value: V, ms = env.MOCK_LATENCY_MS) => new Promise<V>((r) => setTimeout(() => r(value), ms));
const fail = (code: string, message: string, status: number, details: unknown = null): never => {
  throw new ApiError(code, message, status, details);
};
const nowIso = () => new Date().toISOString();
const rand4 = () => Math.random().toString(36).slice(2, 6).toUpperCase();
const ymd = () => {
  const d = new Date();
  return `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
};

function normalisePhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (/^03\d{9}$/.test(digits)) return `+92${digits.slice(1)}`;
  if (/^923\d{9}$/.test(digits)) return `+${digits}`;
  if (/^3\d{9}$/.test(digits)) return `+92${digits}`;
  return null;
}

async function account(): Promise<Account> {
  const token = await getAccessToken();
  const d = await loadDb();
  const acc = token ? d.accounts[token] : undefined;
  if (!acc) fail('AUTH_REQUIRED', 'Please log in to continue.', 401);
  return acc!;
}

function stockOf(v: T.VariantOut) {
  return db?.stock[v.id] ?? v.stockQuantity;
}

function liveProduct(p: T.ProductDetail): T.ProductDetail {
  const variants = p.variants.map((v) => {
    const q = stockOf(v);
    return { ...v, stockQuantity: q, inStock: q > 0 };
  });
  const userReviews = db?.reviews[p.slug] ?? [];
  const reviewCount = p.reviewCount + userReviews.length;
  const ratingAvg = userReviews.length
    ? Math.round(((p.ratingAvg * p.reviewCount + userReviews.reduce((a, r) => a + r.rating, 0)) / reviewCount) * 10) / 10
    : p.ratingAvg;
  return { ...p, variants, inStock: variants.some((v) => v.inStock), reviewCount, ratingAvg };
}

function toCard(p: T.ProductDetail): T.ProductCard {
  const live = liveProduct(p);
  const inStockVariants = live.variants.filter((v) => v.inStock);
  return {
    id: live.id,
    slug: live.slug,
    title: live.title,
    brand: live.brand,
    price: live.price,
    compareAtPrice: live.compareAtPrice,
    discountPercent: live.discountPercent,
    primaryImage: live.primaryImage,
    images: live.images,
    badge: live.badge,
    gender: live.gender,
    season: live.season,
    category: live.category,
    ratingAvg: live.ratingAvg,
    reviewCount: live.reviewCount,
    inStock: live.inStock,
    isExpressEligible: live.isExpressEligible,
    availableSizes: [...new Set(inStockVariants.map((v) => v.size!).filter(Boolean))],
    availableColors: [...new Set(inStockVariants.map((v) => v.color!).filter(Boolean))],
  };
}

const findProduct = (slugOrId: string) => MOCK_PRODUCTS.find((p) => p.slug === slugOrId || p.id === slugOrId);
const findVariant = (variantId: string) => {
  for (const p of MOCK_PRODUCTS) {
    const v = p.variants.find((x) => x.id === variantId);
    if (v) return { product: p, variant: v };
  }
  return null;
};

function paginate<V>(items: V[], page = 1, limit = 20): T.Page<V> {
  const l = Math.min(Math.max(limit, 1), 100);
  return {
    items: items.slice((page - 1) * l, page * l),
    meta: { page, limit: l, totalItems: items.length, totalPages: Math.max(1, Math.ceil(items.length / l)) },
  };
}

function categorySlugs(slug: string): string[] {
  const node = ALL_CATEGORIES.find((c) => c.slug === slug);
  if (!node) return [];
  return [node.slug, ...node.children.map((c) => c.slug)];
}

const isExpressCity = (city?: string | null) =>
  !!city && MOCK_CONFIG.expressDeliveryCities.some((c) => c.toLowerCase() === city.trim().toLowerCase());

/* ── Cart quote (server-side pricing) ──────────────────── */

function quote(body: T.CartQuoteRequest): T.CartQuote {
  const issues: T.CartIssue[] = [];
  const lines: T.CartLine[] = [];
  let allExpress = true;

  for (const item of body.items) {
    const found = findVariant(item.variantId);
    if (!found) {
      issues.push({ code: 'VARIANT_NOT_FOUND', message: 'An item in your bag is no longer available.', variantId: item.variantId });
      continue;
    }
    const { product, variant } = found;
    const available = stockOf(variant);
    if (available <= 0) {
      issues.push({ code: 'OUT_OF_STOCK', message: `${product.title} (${variant.size}) is sold out.`, variantId: variant.id });
    } else if (available < item.quantity) {
      issues.push({ code: 'INSUFFICIENT_STOCK', message: `Only ${available} left of ${product.title} (${variant.size}).`, variantId: variant.id });
    }
    if (!product.isExpressEligible) allExpress = false;
    lines.push({
      variantId: variant.id,
      productId: product.id,
      productSlug: product.slug,
      title: product.title,
      imageUrl: product.images[[...new Set(product.variants.map((v) => v.color))].indexOf(variant.color)] ?? product.primaryImage,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      unitPrice: variant.price,
      quantity: item.quantity,
      lineTotal: variant.price * item.quantity,
      availableQuantity: available,
    });
  }

  const subtotal = lines.reduce((a, l) => a + l.lineTotal, 0);
  const itemCount = lines.reduce((a, l) => a + l.quantity, 0);

  let appliedVoucher: T.AppliedVoucher | null = null;
  if (body.voucherCode) {
    const v = MOCK_VOUCHERS.find((x) => x.code === body.voucherCode!.trim().toUpperCase());
    if (!v) {
      issues.push({ code: 'VOUCHER_INVALID', message: 'This voucher code is not valid.', variantId: null });
    } else if (subtotal < v.minSubtotal) {
      issues.push({ code: 'VOUCHER_INVALID', message: `${v.code} needs a subtotal of at least Rs. ${v.minSubtotal.toLocaleString('en-PK')}.`, variantId: null });
    } else {
      appliedVoucher = { code: v.code, description: v.description, discount: Math.min(Math.round((subtotal * v.percent) / 100), v.maxDiscount) };
    }
  }

  const expressAvailable = isExpressCity(body.city) && allExpress && lines.length > 0;
  let deliveryType: T.DeliveryType = body.deliveryType ?? 'STANDARD';
  if (deliveryType === 'EXPRESS' && !expressAvailable) {
    issues.push({
      code: 'EXPRESS_UNAVAILABLE',
      message: isExpressCity(body.city)
        ? 'Some items in your bag aren’t available for express delivery.'
        : `Express delivery is only available in ${MOCK_CONFIG.expressDeliveryCities.join(', ')}.`,
      variantId: null,
    });
    deliveryType = 'STANDARD';
  }

  const free = subtotal >= MOCK_CONFIG.freeShippingThreshold;
  const deliveryOptions = MOCK_CONFIG.deliveryOptions.map((o) => ({
    ...o,
    fee: o.type === 'STANDARD' && free ? 0 : o.fee,
    available: o.type === 'EXPRESS' ? expressAvailable : true,
  }));
  const chosen = deliveryOptions.find((o) => o.type === deliveryType)!;
  const discount = appliedVoucher?.discount ?? 0;
  const deliveryFee = lines.length ? chosen.fee : 0;
  const blocking = issues.some((i) => i.code !== 'VOUCHER_INVALID' && i.code !== 'EXPRESS_UNAVAILABLE');

  return {
    lines,
    itemCount,
    subtotal,
    discount,
    deliveryFee,
    extraFee: 0,
    total: Math.max(0, subtotal - discount + deliveryFee),
    deliveryType,
    deliveryEstimate: chosen.estimate,
    deliveryOptions,
    freeShippingThreshold: MOCK_CONFIG.freeShippingThreshold,
    amountToFreeShipping: Math.max(0, MOCK_CONFIG.freeShippingThreshold - subtotal),
    appliedVoucher,
    issues,
    canCheckout: lines.length > 0 && !blocking,
  };
}

/* ── Orders ────────────────────────────────────────────── */

const STEPS: { status: T.OrderStatus; label: string }[] = [
  { status: 'PLACED', label: 'Order placed' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PACKED', label: 'Packed' },
  { status: 'SHIPPED', label: 'On the way' },
  { status: 'DELIVERED', label: 'Delivered' },
];

function timeline(order: T.OrderOut): T.TimelineStep[] {
  const reached = order.statusHistory.map((h) => h.status);
  const currentIdx = STEPS.findIndex((s) => s.status === order.status);
  return STEPS.map((s, i) => {
    const event = order.statusHistory.find((h) => h.status === s.status);
    return {
      status: s.status,
      label: s.label,
      isCompleted: reached.includes(s.status) || (currentIdx >= 0 && i < currentIdx),
      isCurrent: s.status === order.status,
      completedAt: event?.createdAt ?? null,
    };
  });
}

const summary = (o: T.OrderOut): T.OrderSummary => ({
  id: o.id,
  orderNumber: o.orderNumber,
  status: o.status,
  source: o.source,
  total: o.total,
  itemCount: o.itemCount,
  deliveryType: o.deliveryType,
  createdAt: o.createdAt,
});

const snapshot = (a: T.AddressOut | T.DeliveryAddressIn): T.AddressSnapshot => ({
  fullName: a.fullName,
  phone: a.phone,
  alternatePhone: a.alternatePhone ?? null,
  addressLine1: a.addressLine1,
  addressLine2: a.addressLine2 ?? null,
  area: a.area,
  city: a.city,
  postalCode: a.postalCode ?? null,
});

/** Demo: once confirmed, orders move along one step per minute so tracking can be seen. */
function advanceOrders(acc: Account) {
  let changed = false;
  for (const o of acc.orders) {
    if (o.status === 'CANCELLED' || o.status === 'DELIVERED' || o.source === 'CUSTOM_REQUEST') continue;
    const minutes = (Date.now() - new Date(o.createdAt).getTime()) / 60000;
    const target = Math.min(STEPS.length - 1, Math.floor(minutes));
    const idx = STEPS.findIndex((s) => s.status === o.status);
    if (target > idx) {
      for (let i = idx + 1; i <= target; i++) {
        o.statusHistory.push({ status: STEPS[i].status, note: null, createdAt: nowIso() });
      }
      o.status = STEPS[target].status;
      o.canCancel = o.status === 'PLACED' || o.status === 'CONFIRMED';
      o.timeline = timeline(o);
      changed = true;
    }
  }
  return changed;
}

/** Demo: auto-quote custom requests ~20 s after submission. */
function advanceRequests(acc: Account) {
  let changed = false;
  for (const r of acc.requests) {
    const age = (Date.now() - new Date(r.createdAt).getTime()) / 1000;
    if (r.status === 'SUBMITTED' && age > 10) {
      r.status = 'IN_REVIEW';
      r.updatedAt = nowIso();
      changed = true;
    }
    if (r.status === 'IN_REVIEW' && age > 20) {
      const itemPrice = r.budget ? Math.round(r.budget * 1.05) : 3500 * r.quantity;
      const deliveryFee = r.deliveryType === 'EXPRESS' ? 400 : 200;
      const extraFee = r.giftWrap ? MOCK_CONFIG.giftWrapFee : 0;
      r.status = 'QUOTED';
      r.staffNote = null;
      r.quote = {
        itemPrice,
        deliveryFee,
        extraFee,
        total: itemPrice + deliveryFee + extraFee,
        notes: 'Found it with our Lahore supplier. Original quality, ready to dispatch on confirmation.',
        validUntil: new Date(Date.now() + 3 * 86400000).toISOString(),
      };
      r.updatedAt = nowIso();
      changed = true;
    }
  }
  return changed;
}

/* ── Seed reviews ──────────────────────────────────────── */

const REVIEW_NAMES = ['Hamza T.', 'Ali R.', 'Usman K.', 'Bilal A.', 'Saad M.'];
const REVIEW_LINES = [
  'Fabric quality is excellent, exactly like the pictures. Size chart is accurate.',
  'Delivered quickly in Lahore. Fits well, colour hasn’t faded after washing.',
  'Good value for the price. Would order again.',
  'Very comfortable. Ordered one size up for the oversized look.',
];
function seedReviews(p: T.ProductDetail): T.ReviewOut[] {
  return REVIEW_NAMES.slice(0, 3).map((name, i) => ({
    id: `rev_${p.slug}_${i}`,
    authorName: name,
    rating: i === 2 ? 4 : 5,
    title: i === 0 ? 'Highly recommended' : null,
    comment: REVIEW_LINES[(i + p.slug.length) % REVIEW_LINES.length],
    sizePurchased: p.availableSizes[(i + 1) % p.availableSizes.length] ?? null,
    isVerifiedPurchase: true,
    createdAt: new Date(Date.now() - (i + 2) * 5 * 86400000).toISOString(),
  }));
}

/* ── The API ───────────────────────────────────────────── */

export const mockApi: Api = {
  // auth
  async requestOtp({ phone }) {
    if (!normalisePhone(phone)) {
      fail('VALIDATION_ERROR', 'Enter a valid Pakistani mobile number.', 422, [{ field: 'phone', message: 'Enter a valid Pakistani mobile number.' }]);
    }
    return wait({ expiresInSeconds: 300, resendAvailableInSeconds: 60 });
  },

  async verifyOtp({ phone, code, fullName }) {
    const normalised = normalisePhone(phone) ?? fail('VALIDATION_ERROR', 'Enter a valid Pakistani mobile number.', 422);
    if (code !== '123456') fail('OTP_INVALID', 'Incorrect code. In demo mode the code is 123456.', 400);
    const d = await loadDb();
    const existing = Object.entries(d.accounts).find(([, a]) => a.profile.phone === normalised);
    const accessToken = `mock_${rand4()}${Date.now()}`;
    let acc: Account;
    if (existing) {
      acc = existing[1];
      delete d.accounts[existing[0]];
    } else {
      acc = {
        profile: {
          id: `usr_${rand4().toLowerCase()}${d.seq++}`,
          phone: normalised,
          fullName: fullName?.trim() || null,
          email: null,
          avatarUrl: null,
          city: null,
          role: 'customer',
          createdAt: nowIso(),
        },
        addresses: [],
        orders: [],
        requests: [],
        wishlist: [],
      };
    }
    d.accounts[accessToken] = acc;
    saveDb();
    return wait({
      accessToken,
      refreshToken: `${accessToken}_refresh`,
      tokenType: 'bearer',
      expiresIn: 3600,
      user: acc.profile,
      isNewUser: !existing,
    });
  },

  // account
  async me() {
    const acc = await account();
    return wait({ ...acc.profile, addresses: acc.addresses });
  },
  async updateMe(body) {
    const acc = await account();
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      fail('VALIDATION_ERROR', 'Enter a valid email.', 422, [{ field: 'email', message: 'Enter a valid email address.' }]);
    }
    acc.profile = {
      ...acc.profile,
      ...(body.fullName !== undefined ? { fullName: body.fullName } : {}),
      ...(body.email !== undefined ? { email: body.email || null } : {}),
      ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
      ...(body.city !== undefined ? { city: body.city } : {}),
    };
    saveDb();
    return wait({ ...acc.profile, addresses: acc.addresses });
  },
  async addresses() {
    const acc = await account();
    return wait([...acc.addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)));
  },
  async createAddress(body) {
    const acc = await account();
    if (acc.addresses.length >= 10) fail('ADDRESS_LIMIT', 'You can save up to 10 addresses.', 409);
    const errors = (['fullName', 'addressLine1', 'area', 'city'] as const)
      .filter((f) => !body[f]?.trim())
      .map((field) => ({ field, message: 'This field is required.' }));
    if (!normalisePhone(body.phone)) errors.push({ field: 'phone' as never, message: 'Enter a valid Pakistani mobile number.' });
    if (errors.length) fail('VALIDATION_ERROR', 'Please fix the highlighted fields.', 422, errors);
    const isDefault = acc.addresses.length === 0 || !!body.isDefault;
    if (isDefault) acc.addresses.forEach((a) => (a.isDefault = false));
    const address: T.AddressOut = {
      id: `adr_${rand4().toLowerCase()}${Date.now() % 10000}`,
      label: body.label ?? null,
      fullName: body.fullName.trim(),
      phone: normalisePhone(body.phone)!,
      alternatePhone: body.alternatePhone ?? null,
      addressLine1: body.addressLine1.trim(),
      addressLine2: body.addressLine2 ?? null,
      area: body.area.trim(),
      city: body.city.trim(),
      postalCode: body.postalCode ?? null,
      isDefault,
      isExpressEligible: isExpressCity(body.city),
    };
    acc.addresses.push(address);
    saveDb();
    return wait(address);
  },
  async updateAddress(id, body) {
    const acc = await account();
    const a = acc.addresses.find((x) => x.id === id) ?? fail('ADDRESS_NOT_FOUND', 'Address not found.', 404);
    if (body.isDefault) acc.addresses.forEach((x) => (x.isDefault = false));
    Object.entries(body).forEach(([k, v]) => {
      if (v !== undefined && v !== null) (a as any)[k] = v;
    });
    a.isExpressEligible = isExpressCity(a.city);
    saveDb();
    return wait(a);
  },
  async deleteAddress(id) {
    const acc = await account();
    const wasDefault = acc.addresses.find((a) => a.id === id)?.isDefault;
    acc.addresses = acc.addresses.filter((a) => a.id !== id);
    if (wasDefault && acc.addresses[0]) acc.addresses[0].isDefault = true;
    saveDb();
    return wait(null);
  },

  // storefront
  async config() {
    return wait(MOCK_CONFIG, 150);
  },
  async home() {
    await loadDb();
    const cards = MOCK_PRODUCTS.map(toCard);
    const newest = [...cards].sort((a, b) => CREATED_DAYS_AGO[a.slug] - CREATED_DAYS_AGO[b.slug]);
    return wait({
      banners: MOCK_CONTENT.filter((c) => c.contentType === 'BANNER'),
      stories: MOCK_CONTENT.filter((c) => c.contentType === 'STORY'),
      featuredCategories: MOCK_CATEGORIES[0].children.map(({ children, ...c }) => c),
      newArrivals: newest.slice(0, 6),
      bestsellers: [...cards].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6),
      onSale: cards.filter((c) => c.compareAtPrice),
    });
  },

  // catalog
  async categories() {
    return wait(MOCK_CATEGORIES, 150);
  },
  async category(slug) {
    const node = ALL_CATEGORIES.find((c) => c.slug === slug) ?? fail('CATEGORY_NOT_FOUND', 'Category not found.', 404);
    const { children, ...rest } = node;
    return wait({
      ...rest,
      breadcrumbs: node.parentId ? [{ id: 'cat_men', name: 'Men', slug: 'men' }, { id: node.id, name: node.name, slug: node.slug }] : [{ id: node.id, name: node.name, slug: node.slug }],
      children: children.map(({ children: _c, ...c }) => c),
      seo: { title: node.name, description: node.name, canonicalUrl: `https://bazaura.pk/c/${slug}`, image: node.imageUrl },
    });
  },
  async products(f: ProductFilters = {}) {
    await loadDb();
    if (f.q !== undefined && f.q.trim().length > 0 && f.q.trim().length < 2) {
      fail('VALIDATION_ERROR', 'Search needs at least 2 characters.', 422, [{ field: 'q', message: 'Enter at least 2 characters.' }]);
    }
    const q = f.q?.trim().toLowerCase();
    const slugs = f.category ? categorySlugs(f.category) : null;
    const sizes = f.size?.map((s) => s.toLowerCase());
    const colors = f.color?.map((c) => c.toLowerCase());
    let list = MOCK_PRODUCTS.map(liveProduct).filter((p) => {
      if (slugs && !slugs.includes(p.category?.slug ?? '')) return false;
      if (f.gender && p.gender !== f.gender && p.gender !== 'UNISEX') return false;
      if (f.season && p.season !== f.season) return false;
      if (f.minPrice != null && p.price < f.minPrice) return false;
      if (f.maxPrice != null && p.price > f.maxPrice) return false;
      if (f.express && !p.isExpressEligible) return false;
      if (f.inStock && !p.inStock) return false;
      if (f.onSale && !p.compareAtPrice) return false;
      if (f.featured && !FEATURED_SLUGS.includes(p.slug)) return false;
      if (sizes?.length || colors?.length) {
        const ok = p.variants.some(
          (v) =>
            v.inStock &&
            (!sizes?.length || sizes.includes((v.size ?? '').toLowerCase())) &&
            (!colors?.length || colors.includes((v.color ?? '').toLowerCase())),
        );
        if (!ok) return false;
      }
      if (q) {
        const hay = [p.title, p.brand, p.fabric ?? '', ...p.tags].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    switch (f.sort ?? 'newest') {
      case 'newest':
        list.sort((a, b) => CREATED_DAYS_AGO[a.slug] - CREATED_DAYS_AGO[b.slug]);
        break;
      case 'popular':
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'price_asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.ratingAvg - a.ratingAvg);
        break;
    }
    return wait(paginate(list.map(toCard), f.page, f.limit));
  },
  async product(slug) {
    await loadDb();
    const p = findProduct(slug) ?? fail('PRODUCT_NOT_FOUND', 'This product is no longer available.', 404);
    return wait(liveProduct(p));
  },
  async relatedProducts(slug) {
    const p = findProduct(slug) ?? fail('PRODUCT_NOT_FOUND', 'Product not found.', 404);
    const same = MOCK_PRODUCTS.filter((x) => x.slug !== p.slug && x.category?.id === p.category?.id);
    const rest = MOCK_PRODUCTS.filter((x) => x.slug !== p.slug && x.category?.id !== p.category?.id);
    return wait([...same, ...rest].slice(0, 8).map(toCard));
  },
  async reviews(slug, page = 1) {
    const d = await loadDb();
    const p = findProduct(slug) ?? fail('PRODUCT_NOT_FOUND', 'Product not found.', 404);
    return wait(paginate([...(d.reviews[p.slug] ?? []), ...seedReviews(p)], page, 10));
  },
  async createReview(slug, body) {
    const acc = await account();
    const d = await loadDb();
    const p = findProduct(slug) ?? fail('PRODUCT_NOT_FOUND', 'Product not found.', 404);
    const list = (d.reviews[p.slug] ??= []);
    if (list.some((r) => r.id.endsWith(acc.profile.id))) fail('REVIEW_EXISTS', "You've already reviewed this product.", 409);
    if (body.comment.trim().length < 3) fail('VALIDATION_ERROR', 'Write a little more.', 422, [{ field: 'comment', message: 'At least 3 characters.' }]);
    const bought = acc.orders.some((o) => o.status !== 'CANCELLED' && o.items.some((i) => i.productSlug === p.slug));
    const review: T.ReviewOut = {
      id: `rev_${Date.now()}_${acc.profile.id}`,
      authorName: acc.profile.fullName || 'Bazaura customer',
      rating: body.rating,
      title: body.title ?? null,
      comment: body.comment.trim(),
      sizePurchased: body.sizePurchased ?? null,
      isVerifiedPurchase: bought,
      createdAt: nowIso(),
    };
    list.unshift(review);
    saveDb();
    return wait(review);
  },

  // cart & orders
  async quoteCart(body) {
    await loadDb();
    return wait(quote(body), 200);
  },
  async placeOrder(body) {
    const acc = await account();
    const address = acc.addresses.find((a) => a.id === body.addressId) ?? fail('ADDRESS_NOT_FOUND', 'That address no longer exists.', 404);
    const q = quote({ items: body.items, voucherCode: body.voucherCode, deliveryType: body.deliveryType, city: address.city });
    const blocking = q.issues.filter((i) => i.code !== 'VOUCHER_INVALID');
    if (!q.canCheckout || blocking.length) fail('CART_INVALID', 'Some items in your bag need attention.', 400, q.issues);
    for (const l of q.lines) {
      const v = findVariant(l.variantId)!.variant;
      db!.stock[v.id] = stockOf(v) - l.quantity;
    }
    const createdAt = nowIso();
    const order: T.OrderOut = {
      id: `ord_${rand4().toLowerCase()}${Date.now() % 100000}`,
      orderNumber: `BZ-${ymd()}-${rand4()}`,
      status: 'PLACED',
      source: 'CATALOG',
      total: q.total,
      itemCount: q.itemCount,
      deliveryType: q.deliveryType,
      createdAt,
      subtotal: q.subtotal,
      discount: q.discount,
      deliveryFee: q.deliveryFee,
      extraFee: q.extraFee,
      voucherCode: q.appliedVoucher?.code ?? null,
      paymentMethod: 'CASH_ON_DELIVERY',
      deliveryEstimate: q.deliveryEstimate,
      shippingAddress: snapshot(address),
      customerNote: body.customerNote ?? null,
      cancelReason: null,
      canCancel: true,
      items: q.lines.map((l, i) => ({
        id: `itm_${i}_${Date.now()}`,
        productId: l.productId,
        variantId: l.variantId,
        title: l.title,
        productSlug: l.productSlug,
        imageUrl: l.imageUrl,
        sku: l.sku,
        size: l.size,
        color: l.color,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
        lineTotal: l.lineTotal,
      })),
      timeline: [],
      statusHistory: [{ status: 'PLACED', note: null, createdAt }],
    };
    order.timeline = timeline(order);
    acc.orders.unshift(order);
    saveDb();
    return wait(order, 600);
  },
  async orders(page = 1) {
    const acc = await account();
    if (advanceOrders(acc)) saveDb();
    return wait(paginate(acc.orders.map(summary), page, 20));
  },
  async order(id) {
    const acc = await account();
    if (advanceOrders(acc)) saveDb();
    return wait(acc.orders.find((o) => o.id === id) ?? fail('ORDER_NOT_FOUND', 'Order not found.', 404));
  },
  async cancelOrder(id, body = {}) {
    const acc = await account();
    advanceOrders(acc);
    const o = acc.orders.find((x) => x.id === id) ?? fail('ORDER_NOT_FOUND', 'Order not found.', 404);
    if (!o.canCancel) fail('ORDER_NOT_CANCELLABLE', 'This order has already been packed and can’t be cancelled.', 409);
    o.status = 'CANCELLED';
    o.canCancel = false;
    o.cancelReason = body.reason ?? null;
    o.statusHistory.push({ status: 'CANCELLED', note: body.reason ?? null, createdAt: nowIso() });
    o.timeline = timeline(o);
    for (const item of o.items) {
      const found = item.variantId ? findVariant(item.variantId) : null;
      if (found) db!.stock[found.variant.id] = stockOf(found.variant) + item.quantity;
    }
    saveDb();
    return wait(o);
  },

  // custom requests
  async createCustomRequest(body) {
    const acc = await account();
    if (!body.itemName || body.itemName.trim().length < 2) fail('VALIDATION_ERROR', 'Tell us what you’re looking for.', 422, [{ field: 'itemName', message: 'At least 2 characters.' }]);
    if (!body.description || body.description.trim().length < 5) fail('VALIDATION_ERROR', 'Add a few details.', 422, [{ field: 'description', message: 'At least 5 characters.' }]);
    let addr: T.AddressSnapshot;
    if (body.addressId) {
      addr = snapshot(acc.addresses.find((a) => a.id === body.addressId) ?? fail('ADDRESS_NOT_FOUND', 'Address not found.', 404));
    } else if (body.deliveryAddress) {
      addr = snapshot(body.deliveryAddress);
    } else {
      return fail('VALIDATION_ERROR', 'Choose a delivery address.', 422, [{ field: 'addressId', message: 'Choose a delivery address.' }]);
    }
    if (body.deliveryType === 'EXPRESS' && !isExpressCity(addr.city)) {
      fail('EXPRESS_UNAVAILABLE', `Express delivery is only available in ${MOCK_CONFIG.expressDeliveryCities.join(', ')}.`, 400);
    }
    const req: T.CustomRequestOut = {
      id: `crq_${rand4().toLowerCase()}${Date.now() % 100000}`,
      requestNumber: `RQ-${ymd()}-${rand4()}`,
      requestType: body.requestType ?? 'CUSTOM_ITEM',
      status: 'SUBMITTED',
      itemName: body.itemName.trim(),
      description: body.description.trim(),
      quantity: body.quantity ?? 1,
      budget: body.budget ?? null,
      referenceUrl: body.referenceUrl ?? null,
      imageUrls: body.imageUrls ?? [],
      deliveryType: body.deliveryType ?? 'STANDARD',
      deliveryAddress: addr,
      giftMessage: body.giftMessage ?? null,
      giftWrap: !!body.giftWrap,
      hideSender: !!body.hideSender,
      deliverOn: body.deliverOn ?? null,
      staffNote: null,
      quote: null,
      orderId: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    acc.requests.unshift(req);
    saveDb();
    return wait(req, 500);
  },
  async customRequests() {
    const acc = await account();
    if (advanceRequests(acc)) saveDb();
    return wait(acc.requests);
  },
  async customRequest(id) {
    const acc = await account();
    if (advanceRequests(acc)) saveDb();
    return wait(acc.requests.find((r) => r.id === id) ?? fail('REQUEST_NOT_FOUND', 'Request not found.', 404));
  },
  async acceptQuote(id) {
    const acc = await account();
    const r = acc.requests.find((x) => x.id === id) ?? fail('REQUEST_NOT_FOUND', 'Request not found.', 404);
    if (r.status !== 'QUOTED' || !r.quote) fail('NO_ACTIVE_QUOTE', 'There’s no quote to accept yet.', 409);
    if (new Date(r.quote!.validUntil).getTime() < Date.now()) fail('QUOTE_EXPIRED', 'This quote expired. We’ll send a new one.', 409);
    const createdAt = nowIso();
    const order: T.OrderOut = {
      id: `ord_${rand4().toLowerCase()}${Date.now() % 100000}`,
      orderNumber: `BZ-${ymd()}-${rand4()}`,
      status: 'CONFIRMED',
      source: 'CUSTOM_REQUEST',
      total: r.quote!.total,
      itemCount: r.quantity,
      deliveryType: r.deliveryType,
      createdAt,
      subtotal: r.quote!.itemPrice,
      discount: 0,
      deliveryFee: r.quote!.deliveryFee,
      extraFee: r.quote!.extraFee,
      voucherCode: null,
      paymentMethod: 'CASH_ON_DELIVERY',
      deliveryEstimate: r.deliveryType === 'EXPRESS' ? 'Within 3 hours' : '3–5 working days',
      shippingAddress: r.deliveryAddress,
      customerNote: r.giftMessage,
      cancelReason: null,
      canCancel: true,
      items: [
        {
          id: `itm_${Date.now()}`,
          productId: null,
          variantId: null,
          title: r.itemName,
          productSlug: null,
          imageUrl: r.imageUrls[0] ?? null,
          sku: null,
          size: null,
          color: null,
          unitPrice: Math.round(r.quote!.itemPrice / r.quantity),
          quantity: r.quantity,
          lineTotal: r.quote!.itemPrice,
        },
      ],
      timeline: [],
      statusHistory: [
        { status: 'PLACED', note: null, createdAt },
        { status: 'CONFIRMED', note: 'Created from custom request', createdAt },
      ],
    };
    order.timeline = timeline(order);
    acc.orders.unshift(order);
    r.status = 'CONFIRMED';
    r.orderId = order.id;
    r.updatedAt = createdAt;
    saveDb();
    return wait(r);
  },
  async cancelCustomRequest(id, body = {}) {
    const acc = await account();
    const r = acc.requests.find((x) => x.id === id) ?? fail('REQUEST_NOT_FOUND', 'Request not found.', 404);
    if (!['SUBMITTED', 'IN_REVIEW', 'QUOTED'].includes(r.status)) fail('REQUEST_NOT_CANCELLABLE', 'This request can no longer be cancelled.', 409);
    r.status = 'CANCELLED';
    r.staffNote = body.reason ? `Cancelled by you: ${body.reason}` : null;
    r.updatedAt = nowIso();
    saveDb();
    return wait(r);
  },

  // wishlist & uploads
  async wishlist() {
    const acc = await account();
    return wait(acc.wishlist.map((id) => MOCK_PRODUCTS.find((p) => p.id === id)).filter(Boolean).map((p) => toCard(p!)));
  },
  async addToWishlist(productId) {
    const acc = await account();
    if (!acc.wishlist.includes(productId)) acc.wishlist.unshift(productId);
    saveDb();
    return wait(null, 120);
  },
  async removeFromWishlist(productId) {
    const acc = await account();
    acc.wishlist = acc.wishlist.filter((id) => id !== productId);
    saveDb();
    return wait(null, 120);
  },
  async presignUpload() {
    await account();
    return fail('STORAGE_UNAVAILABLE', 'Photo uploads aren’t available in demo mode.', 503);
  },
};
