import { useQuery } from '@tanstack/react-query';
import { api } from '../endpoints';
import { qk } from '../queryKeys';

/** Fees, delivery labels, express hours/cities. Never hard-code these (FRONTEND.md §0.3). */
export function useConfig() {
  return useQuery({ queryKey: qk.config, queryFn: api.config, staleTime: 10 * 60_000 });
}

export function useIsExpressCity(city: string | null | undefined) {
  const { data } = useConfig();
  if (!city || !data) return false;
  return data.expressDeliveryCities.some((c) => c.toLowerCase() === city.trim().toLowerCase());
}

export function useHome() {
  return useQuery({ queryKey: qk.home, queryFn: api.home, staleTime: 2 * 60_000 });
}
