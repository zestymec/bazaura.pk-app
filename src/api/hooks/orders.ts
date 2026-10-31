import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../endpoints';
import { qk } from '../queryKeys';
import type { OrderCreate, OrderOut } from '../types';
import { useAuthStore } from '../../store/auth';

const FINAL = ['DELIVERED', 'CANCELLED', 'RETURNED'];

export function useOrders() {
  const loggedIn = useAuthStore((s) => s.isLoggedIn);
  const query = useInfiniteQuery({
    queryKey: qk.orders,
    queryFn: ({ pageParam }) => api.orders(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    enabled: loggedIn,
  });
  return { ...query, items: query.data?.pages.flatMap((p) => p.items) ?? [] };
}

/** Live order; polls every 30 s until it reaches a final status (§9). */
export function useOrder(id: string) {
  return useQuery({
    queryKey: qk.order(id),
    queryFn: () => api.order(id),
    refetchInterval: (q) => (q.state.data && FINAL.includes(q.state.data.status) ? false : 30_000),
  });
}

export function usePlaceOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderCreate) => api.placeOrder(body),
    onSuccess: (order) => {
      qc.setQueryData(qk.order(order.id), order);
      qc.invalidateQueries({ queryKey: qk.orders });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCancelOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => api.cancelOrder(id, { reason: reason || null }),
    onSuccess: (order: OrderOut) => {
      qc.setQueryData(qk.order(id), order);
      qc.invalidateQueries({ queryKey: qk.orders });
    },
    onError: () => qc.invalidateQueries({ queryKey: qk.order(id) }),
  });
}
