import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ProductFilters } from '../endpoints';
import { qk } from '../queryKeys';
import type { ProductCard, ProductDetail, ReviewCreate } from '../types';

export function useCategories() {
  return useQuery({
    queryKey: qk.categories,
    queryFn: api.categories,
    staleTime: 2 * 60_000,
    select: (tree) => [...tree].sort((a, b) => a.displayOrder - b.displayOrder),
  });
}

/** Infinite product list; stops when meta.page >= meta.totalPages (§7.4). */
export function useProducts(filters: Omit<ProductFilters, 'page'>, enabled = true) {
  const query = useInfiniteQuery({
    queryKey: qk.products(filters),
    queryFn: ({ pageParam }) => api.products({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    enabled,
    placeholderData: (prev) => prev,
  });
  return {
    ...query,
    items: query.data?.pages.flatMap((p) => p.items) ?? [],
    total: query.data?.pages[0]?.meta.totalItems ?? 0,
  };
}

/** Product detail; a ProductCard from a list paints the header instantly while it loads. */
export function useProduct(slug: string, preview?: ProductCard) {
  return useQuery({
    queryKey: qk.product(slug),
    queryFn: () => api.product(slug),
    placeholderData: preview ? ({ ...preview, variants: [] } as unknown as ProductDetail) : undefined,
  });
}

export function useRelated(slug: string) {
  return useQuery({ queryKey: qk.related(slug), queryFn: () => api.relatedProducts(slug) });
}

export function useReviews(slug: string) {
  return useQuery({ queryKey: qk.reviews(slug), queryFn: () => api.reviews(slug, 1) });
}

export function useCreateReview(slug: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ReviewCreate) => api.createReview(slug, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.product(slug) });
      qc.invalidateQueries({ queryKey: qk.reviews(slug) });
    },
  });
}
