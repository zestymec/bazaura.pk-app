import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DeliveryType } from '../api/types';
import { persistStorage } from './persist';
import { haptic } from '../utils/haptics';

/**
 * Local cart: only what the server needs (variantId + quantity) plus a tiny
 * display snapshot so the bag isn't blank while the quote loads. Prices are
 * never stored or calculated here — they come from POST /cart/quote (§0.2).
 */
export interface CartEntry {
  variantId: string;
  quantity: number;
  /** Display-only, refreshed by every quote. */
  snapshot?: { title: string; imageUrl: string | null; size: string | null; color: string | null; productSlug: string };
}

export const MAX_QTY = 20;

interface CartState {
  items: CartEntry[];
  voucherCode: string | null;
  deliveryType: DeliveryType;
  add: (variantId: string, quantity: number, snapshot: CartEntry['snapshot']) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  setVoucher: (code: string | null) => void;
  setDeliveryType: (type: DeliveryType) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      voucherCode: null,
      deliveryType: 'STANDARD',

      add: (variantId, quantity, snapshot) => {
        haptic.success();
        set((s) => {
          const existing = s.items.find((i) => i.variantId === variantId);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.variantId === variantId ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + quantity), snapshot } : i,
              ),
            };
          }
          return { items: [...s.items, { variantId, quantity: Math.min(MAX_QTY, quantity), snapshot }] };
        });
      },

      setQuantity: (variantId, quantity) => {
        haptic.light();
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.variantId !== variantId)
              : s.items.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.min(MAX_QTY, quantity) } : i)),
        }));
      },

      remove: (variantId) => {
        haptic.medium();
        set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) }));
      },

      setVoucher: (voucherCode) => set({ voucherCode: voucherCode?.trim().toUpperCase() || null }),
      setDeliveryType: (deliveryType) => set({ deliveryType }),
      clear: () => set({ items: [], voucherCode: null }),
    }),
    { name: 'bazaura.cart.v2', storage: persistStorage, version: 2 },
  ),
);

export const selectCartCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
