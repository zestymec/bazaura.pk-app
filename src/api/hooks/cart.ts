import { useQuery } from '@tanstack/react-query';
import { api } from '../endpoints';
import { qk } from '../queryKeys';
import type { CartQuoteRequest } from '../types';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

/**
 * Live server quote for the local cart (§7.6). The app never calculates
 * money itself — everything shown comes from here. Debounced 400 ms so
 * tapping +/- quickly sends one request.
 */
export function useCartQuote(body: CartQuoteRequest) {
  const debounced = useDebouncedValue(body, 400);
  return useQuery({
    queryKey: qk.cartQuote(debounced),
    queryFn: () => api.quoteCart(debounced),
    enabled: debounced.items.length > 0,
    staleTime: 0,
    placeholderData: (prev) => prev,
  });
}
