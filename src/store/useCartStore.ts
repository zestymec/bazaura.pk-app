import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartSummary, DeliveryType, Voucher } from '../types/cart';
import { Product } from '../types/product';
import { haptic } from '../utils/haptics';
import { sound } from '../utils/audio';
import { AVAILABLE_VOUCHERS, calculateTotals, unitPriceFor } from '../utils/pricing';
import { persistStorage } from './persist';

interface CartState {
  items: CartItem[];
  deliveryType: DeliveryType;
  appliedVoucher: Voucher | null;

  addItem: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setDeliveryType: (type: DeliveryType) => void;
  applyVoucher: (code: string) => { success: boolean; message: string };
  removeVoucher: () => void;
  clearCart: () => void;

  getSummary: () => CartSummary;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryType: 'LAHORE_EXPRESS_2HR',
      appliedVoucher: null,

      addItem: (product, quantity = 1, selectedVariants = {}) => {
        haptic.success();
        sound.playAddToCart();

        const variantKey = Object.entries(selectedVariants)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${v}`)
          .join('|');
        const itemId = `${product.id}_${variantKey || 'standard'}`;
        const unitPrice = unitPriceFor(product, selectedVariants);

        set((state) => {
          const existing = state.items.find((item) => item.id === itemId);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === itemId ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { id: itemId, product, quantity, selectedVariants, unitPrice, addedAt: Date.now() },
            ],
          };
        });
      },

      removeItem: (itemId) => {
        haptic.medium();
        set((state) => ({ items: state.items.filter((item) => item.id !== itemId) }));
      },

      updateQuantity: (itemId, quantity) => {
        haptic.light();
        sound.playTap();
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        }));
      },

      setDeliveryType: (type) => {
        haptic.selection();
        set({ deliveryType: type });
      },

      applyVoucher: (code) => {
        const cleanCode = code.trim().toUpperCase();
        const found = AVAILABLE_VOUCHERS.find((v) => v.code === cleanCode);
        if (!found) {
          haptic.error();
          return { success: false, message: 'Invalid voucher code. Try "BAZAURA10"' };
        }

        const subtotal = get().items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
        if (found.minOrderAmount && subtotal < found.minOrderAmount) {
          haptic.warning();
          return {
            success: false,
            message: `Voucher requires minimum order of Rs. ${found.minOrderAmount.toLocaleString('en-PK')}`,
          };
        }

        haptic.success();
        sound.playSuccess();
        set({ appliedVoucher: found });
        return { success: true, message: `Voucher "${found.code}" applied successfully!` };
      },

      removeVoucher: () => {
        haptic.light();
        set({ appliedVoucher: null });
      },

      clearCart: () => set({ items: [], appliedVoucher: null }),

      getSummary: () => {
        const { items, deliveryType, appliedVoucher } = get();
        return { ...calculateTotals(items, deliveryType, appliedVoucher), appliedVoucher, deliveryType };
      },

      getItemCount: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
    }),
    {
      name: 'bazaura.cart',
      storage: persistStorage,
      version: 1,
      partialize: (s) => ({ items: s.items, deliveryType: s.deliveryType, appliedVoucher: s.appliedVoucher }),
    },
  ),
);

/** Cheap selector for badges — re-renders only when the count changes. */
export const selectCartCount = (s: CartState) => s.items.reduce((acc, item) => acc + item.quantity, 0);
