import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../endpoints';
import { qk } from '../queryKeys';
import type { CustomRequestCreate, CustomRequestOut } from '../types';
import { useAuthStore } from '../../store/auth';

const WAITING = ['SUBMITTED', 'IN_REVIEW'];

export function useCustomRequests() {
  const loggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: qk.customRequests,
    queryFn: () => api.customRequests(1),
    enabled: loggedIn,
    refetchInterval: (q) => (q.state.data?.some((r) => WAITING.includes(r.status)) ? 60_000 : false),
  });
}

/** Polls every 60 s while staff are still working on it (§9). */
export function useCustomRequest(id: string) {
  return useQuery({
    queryKey: qk.customRequest(id),
    queryFn: () => api.customRequest(id),
    refetchInterval: (q) => (q.state.data && WAITING.includes(q.state.data.status) ? 60_000 : false),
  });
}

export function useCreateCustomRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CustomRequestCreate) => api.createCustomRequest(body),
    onSuccess: (r) => {
      qc.setQueryData(qk.customRequest(r.id), r);
      qc.invalidateQueries({ queryKey: qk.customRequests });
    },
  });
}

function useRequestMutation(id: string, fn: (reason?: string) => Promise<CustomRequestOut>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (r) => {
      qc.setQueryData(qk.customRequest(id), r);
      qc.invalidateQueries({ queryKey: qk.customRequests });
      qc.invalidateQueries({ queryKey: qk.orders });
    },
    onError: () => qc.invalidateQueries({ queryKey: qk.customRequest(id) }),
  });
}

export const useAcceptQuote = (id: string) => useRequestMutation(id, () => api.acceptQuote(id));
export const useCancelCustomRequest = (id: string) =>
  useRequestMutation(id, (reason) => api.cancelCustomRequest(id, { reason: reason || null }));
