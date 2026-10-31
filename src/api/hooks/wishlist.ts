import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { api } from '../endpoints';
import { qk } from '../queryKeys';
import type { ProductCard } from '../types';
import { useAuthStore } from '../../store/auth';
import { haptic } from '../../utils/haptics';

export function useWishlist() {
  const loggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({ queryKey: qk.wishlist, queryFn: api.wishlist, enabled: loggedIn });
}

/** Set of saved product IDs — drives every heart icon in the app (§7.10). */
export function useWishlistIds(): Set<string> {
  const { data } = useWishlist();
  return useMemo(() => new Set((data ?? []).map((p) => p.id)), [data]);
}

/** Optimistic toggle; both endpoints are idempotent, rolled back on error. */
export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ product, saved }: { product: ProductCard; saved: boolean }) =>
      saved ? api.removeFromWishlist(product.id) : api.addToWishlist(product.id),
    onMutate: async ({ product, saved }) => {
      saved ? haptic.light() : haptic.success();
      await qc.cancelQueries({ queryKey: qk.wishlist });
      const previous = qc.getQueryData<ProductCard[]>(qk.wishlist);
      qc.setQueryData<ProductCard[]>(qk.wishlist, (list = []) =>
        saved ? list.filter((p) => p.id !== product.id) : [product, ...list],
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => qc.setQueryData(qk.wishlist, ctx?.previous),
    onSettled: () => qc.invalidateQueries({ queryKey: qk.wishlist }),
  });
}
