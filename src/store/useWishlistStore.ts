import { create } from 'zustand';
import { haptic } from '../utils/haptics';
import { sound } from '../utils/audio';

interface WishlistState {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => boolean; // returns true if added, false if removed
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlistIds: ['prod_1', 'prod_8'], // sample pre-saved wishlist items

  toggleWishlist: (productId: string) => {
    const exists = get().wishlistIds.includes(productId);
    if (exists) {
      haptic.medium();
      set((state) => ({
        wishlistIds: state.wishlistIds.filter((id) => id !== productId),
      }));
      return false;
    } else {
      haptic.success();
      sound.playTap();
      set((state) => ({
        wishlistIds: [...state.wishlistIds, productId],
      }));
      return true;
    }
  },

  isInWishlist: (productId: string) => {
    return get().wishlistIds.includes(productId);
  },

  clearWishlist: () => {
    set({ wishlistIds: [] });
  },
}));
