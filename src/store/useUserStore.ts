import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types/user';
import { Order, ShippingAddress } from '../types/order';
import { NewAddressPayload } from '../types/api';
import { haptic } from '../utils/haptics';
import { persistStorage } from './persist';
import { usersService } from '../api/services/users';

export const GUEST_USER: UserProfile = {
  id: 'guest',
  fullName: '',
  email: '',
  phone: '',
  selectedCity: 'Lahore',
  isLahoreExpressEligible: true,
  memberSince: '',
  addresses: [],
};

interface UserState {
  /** Session flag. Tokens themselves live in api/tokenStorage. */
  isAuthenticated: boolean;
  user: UserProfile;
  orders: Order[];
  recentSearches: string[];
  selectedAddressId: string;

  setSession: (user: UserProfile) => void;
  resetToGuest: () => void;
  setUser: (user: UserProfile) => void;
  setOrders: (orders: Order[]) => void;
  prependOrder: (order: Order) => void;

  setSelectedCity: (city: string) => void;
  setSelectedAddress: (addressId: string) => void;
  addAddress: (address: NewAddressPayload) => Promise<ShippingAddress>;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: GUEST_USER,
      orders: [],
      recentSearches: [],
      selectedAddressId: '',

      setSession: (user) =>
        set({
          isAuthenticated: true,
          user,
          selectedAddressId: user.defaultAddressId || user.addresses[0]?.id || '',
        }),

      resetToGuest: () =>
        set((s) => ({
          isAuthenticated: false,
          user: { ...GUEST_USER, selectedCity: s.user.selectedCity, isLahoreExpressEligible: s.user.isLahoreExpressEligible },
          orders: [],
          selectedAddressId: '',
        })),

      setUser: (user) => set({ user }),
      setOrders: (orders) => set({ orders }),
      prependOrder: (order) => set((s) => ({ orders: [order, ...s.orders.filter((o) => o.id !== order.id)] })),

      setSelectedCity: (city) => {
        haptic.selection();
        set((s) => ({
          user: { ...s.user, selectedCity: city, isLahoreExpressEligible: city.toLowerCase() === 'lahore' },
        }));
        if (get().isAuthenticated) usersService.setCity(city).catch(() => {});
      },

      setSelectedAddress: (addressId) => {
        haptic.selection();
        set({ selectedAddressId: addressId });
      },

      addAddress: async (data) => {
        const created = await usersService.addAddress(data);
        haptic.success();
        set((s) => ({
          user: { ...s.user, addresses: [...s.user.addresses, created] },
          selectedAddressId: created.id,
        }));
        return created;
      },

      addRecentSearch: (query) => {
        const clean = query.trim();
        if (!clean) return;
        set((s) => ({
          recentSearches: [clean, ...s.recentSearches.filter((q) => q.toLowerCase() !== clean.toLowerCase())].slice(0, 8),
        }));
      },

      clearRecentSearches: () => {
        haptic.light();
        set({ recentSearches: [] });
      },

      updateProfile: (data) => {
        haptic.success();
        set((s) => ({ user: { ...s.user, ...data } }));
        if (get().isAuthenticated) {
          const { fullName, email, avatarUrl } = data;
          usersService.update({ fullName, email, avatarUrl }).catch(() => {});
        }
      },
    }),
    {
      name: 'bazaura.user',
      storage: persistStorage,
      version: 1,
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        user: s.user,
        orders: s.orders,
        recentSearches: s.recentSearches,
        selectedAddressId: s.selectedAddressId,
      }),
    },
  ),
);
