import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../endpoints';
import { qk } from '../queryKeys';
import type { AddressCreate, AddressUpdate, UserUpdate } from '../types';
import { useAuthStore } from '../../store/auth';

export function useMe() {
  const loggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({
    queryKey: qk.me,
    queryFn: async () => {
      const me = await api.me();
      useAuthStore.getState().setUser(me);
      return me;
    },
    enabled: loggedIn,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UserUpdate) => api.updateMe(body),
    onSuccess: (me) => {
      useAuthStore.getState().setUser(me);
      qc.setQueryData(qk.me, me);
    },
  });
}

export function useAddresses() {
  const loggedIn = useAuthStore((s) => s.isLoggedIn);
  return useQuery({ queryKey: qk.addresses, queryFn: api.addresses, enabled: loggedIn });
}

function useInvalidateAddresses() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: qk.addresses });
    qc.invalidateQueries({ queryKey: qk.me });
  };
}

export function useCreateAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({ mutationFn: (body: AddressCreate) => api.createAddress(body), onSuccess: invalidate });
}

export function useUpdateAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: AddressUpdate }) => api.updateAddress(id, body),
    onSuccess: invalidate,
  });
}

export function useDeleteAddress() {
  const invalidate = useInvalidateAddresses();
  return useMutation({ mutationFn: (id: string) => api.deleteAddress(id), onSuccess: invalidate });
}
