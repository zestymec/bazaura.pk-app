/**
 * REST paths, relative to `${API_BASE_URL}/api/v1`.
 * Mirrors section 3 of backend_blueprint.md — keep the two in sync.
 */
export const endpoints = {
  auth: {
    requestOtp: '/auth/otp/request',
    verifyOtp: '/auth/otp/verify',
    refresh: '/auth/refresh',
  },
  users: {
    me: '/users/me',
    city: '/users/me/city',
    addresses: '/users/me/addresses',
    address: (id: string) => `/users/me/addresses/${encodeURIComponent(id)}`,
  },
  products: {
    list: '/products',
    detail: (id: string) => `/products/${encodeURIComponent(id)}`,
    flashDeals: '/products/flash-deals',
  },
  content: {
    home: '/content/home',
  },
  cart: {
    validate: '/cart/validate',
  },
  orders: {
    list: '/orders',
    create: '/orders',
    detail: (id: string) => `/orders/${encodeURIComponent(id)}`,
  },
  requests: {
    list: '/requests',
    create: '/requests',
    acceptQuote: (id: string) => `/requests/${encodeURIComponent(id)}/accept-quote`,
    cancel: (id: string) => `/requests/${encodeURIComponent(id)}/cancel`,
  },
  wishlist: {
    list: '/wishlist',
    toggle: '/wishlist/toggle',
  },
  uploads: {
    presignedUrl: '/uploads/presigned-url',
  },
} as const;
