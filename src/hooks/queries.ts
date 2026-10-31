import { useInfiniteQuery, useQueries, useQuery } from '@tanstack/react-query';
import { catalogService } from '../api/services/catalog';
import { ProductListParams } from '../types/api';
import { Product } from '../types/product';

export const queryKeys = {
  home: ['catalog', 'home'] as const,
  products: (params: Omit<ProductListParams, 'page'>) => ['catalog', 'products', params] as const,
  product: (id: string) => ['catalog', 'product', id] as const,
  flashDeals: ['catalog', 'flash-deals'] as const,
};

/** Stories, banners, categories and rails for Home — one round trip. */
export function useHomeContent() {
  return useQuery({ queryKey: queryKeys.home, queryFn: catalogService.home, staleTime: 5 * 60 * 1000 });
}

/** Categories come from the home bundle (cached), so no extra request. */
export function useCategories() {
  const q = useHomeContent();
  return { ...q, data: q.data?.categories ?? [] };
}

const PAGE_SIZE = 20;

/** Paginated catalog for infinite-scroll grids. */
export function useProducts(params: Omit<ProductListParams, 'page' | 'limit'> = {}, enabled = true) {
  const query = useInfiniteQuery({
    queryKey: queryKeys.products(params),
    queryFn: ({ pageParam, signal }) => catalogService.products({ ...params, page: pageParam, limit: PAGE_SIZE }, signal),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.pagination.page < last.pagination.total_pages ? last.pagination.page + 1 : undefined,
    enabled,
    placeholderData: (prev) => prev,
  });
  const items: Product[] = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total = query.data?.pages[0]?.pagination.total_items ?? 0;
  return { ...query, items, total };
}

/** Full product detail. Seeded with the list item so the screen paints instantly. */
export function useProduct(product: Product) {
  return useQuery({
    queryKey: queryKeys.product(product.id),
    queryFn: () => catalogService.product(product.id),
    initialData: product,
    // List payloads may omit reviews/specs; fetch the full record right away.
    initialDataUpdatedAt: 0,
  });
}

/**
 * Resolves wishlist IDs to products. Each product is its own cached query, so
 * items already opened on the detail screen show instantly.
 */
export function useProductsByIds(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.product(id),
      queryFn: () => catalogService.product(id),
      staleTime: 5 * 60 * 1000,
    })),
    combine: (results) => ({
      products: results.map((r) => r.data).filter((p): p is Product => !!p),
      isLoading: results.some((r) => r.isLoading),
    }),
  });
}
