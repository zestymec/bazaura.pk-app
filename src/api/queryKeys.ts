/** React Query keys (FRONTEND.md §9). */
export const qk = {
  config: ['config'] as const,
  home: ['home'] as const,
  categories: ['categories'] as const,
  category: (slug: string) => ['category', slug] as const,
  products: (filters: object) => ['products', filters] as const,
  product: (slug: string) => ['product', slug] as const,
  related: (slug: string) => ['product', slug, 'related'] as const,
  reviews: (slug: string) => ['product', slug, 'reviews'] as const,
  cartQuote: (body: object) => ['cartQuote', body] as const,
  me: ['me'] as const,
  addresses: ['addresses'] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
  customRequests: ['customRequests'] as const,
  customRequest: (id: string) => ['customRequest', id] as const,
  wishlist: ['wishlist'] as const,
};
