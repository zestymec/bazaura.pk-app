import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { haptic } from '../utils/haptics';
import { sound } from '../utils/audio';
import { persistStorage } from './persist';
import { wishlistService } from '../api/services/wishlist';
import { useUserStore } from './useUserStore';

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => boolean; // true if added
  isInWishlist: (productId: string) => boolean;
  setWishlist: (ids: string[]) => void;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlistIds: [],

      // Optimistic: flip locally first, sync to the server when logged in,
      // and roll back if the server rejects it.
      toggleWishlist: (productId) => {
        const exists = get().wishlistIds.includes(productId);
        if (exists) {
          haptic.medium();
          set((s) => ({ wishlistIds: s.wishlistIds.filter((id) => id !== productId) }));
        } else {
          haptic.success();
          sound.playTap();
          set((s) => ({ wishlistIds: [...s.wishlistIds, productId] }));
        }

        if (useUserStore.getState().isAuthenticated) {
          wishlistService.toggle(productId).catch(() => {
            set((s) => ({
              wishlistIds: exists ? [...s.wishlistIds, productId] : s.wishlistIds.filter((id) => id !== productId),
            }));
          });
        }
        return !exists;
      },

      isInWishlist: (productId) => get().wishlistIds.includes(productId),
      setWishlist: (ids) => set({ wishlistIds: ids }),
      clearWishlist: () => set({ wishlistIds: [] }),
    }),
    { name: 'bazaura.wishlist', storage: persistStorage, version: 1 },
  ),
);
