import { create } from 'zustand';
import { UserProfile } from '../types/user';
import { Order, ShippingAddress } from '../types/order';
import { generateId } from '../utils/formatters';
import { haptic } from '../utils/haptics';
import { sound } from '../utils/audio';

interface UserState {
  user: UserProfile;
  orders: Order[];
  recentSearches: string[];
  selectedAddressId: string;

  // Actions
  setSelectedCity: (city: string) => void;
  setSelectedAddress: (addressId: string) => void;
  addAddress: (address: Omit<ShippingAddress, 'id'>) => ShippingAddress;
  addOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'timeline'>) => Order;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: {
    id: 'usr_bazaura_01',
    fullName: 'Muhammad Ali',
    email: 'ali.lahore@example.pk',
    phone: '03001234567',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    selectedCity: 'Lahore',
    isLahoreExpressEligible: true,
    memberSince: 'August 2026',
    defaultAddressId: 'addr_1',
    addresses: [
      {
        id: 'addr_1',
        fullName: 'Muhammad Ali',
        phone: '03001234567',
        addressLine1: 'House #42, Street 14, Sector Y, Phase 3',
        area: 'DHA Phase 3',
        city: 'Lahore',
        postalCode: '54792',
        isLahore: true,
        isDefault: true,
      },
      {
        id: 'addr_2',
        fullName: 'Muhammad Ali (Office)',
        phone: '03001234567',
        addressLine1: 'Office 402, 4th Floor, Pace Tower, Gulberg III',
        area: 'Gulberg III',
        city: 'Lahore',
        postalCode: '54660',
        isLahore: true,
        isDefault: false,
      },
    ],
  },
  selectedAddressId: 'addr_1',
  recentSearches: ['iPhone 15 Pro Max', 'Airfryer', 'Dior Sauvage', 'Coffee', 'Anker 200W'],
  orders: [
    {
      id: 'ord_1001',
      orderNumber: 'BZ-94821',
      items: [
        {
          id: 'prod_4_std',
          product: {
            id: 'prod_4',
            title: 'Nescafé Gold Rich & Smooth Premium Instant Coffee (200g Jar)',
            brand: 'Nescafé',
            category: 'Instant Essentials & Groceries',
            price: 3450,
            originalPrice: 3950,
            discountPercent: 13,
            rating: 4.9,
            reviewCount: 512,
            description: 'Crafted with Arabica coffee beans.',
            images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80'],
            features: ['2-Hour Lahore Delivery'],
            inStock: true,
            stockCount: 150,
            isLahoreExpress2Hour: true,
            nationwideDeliveryDays: '2-3 Days',
            badge: '2-HOUR EXPRESS',
            tags: ['coffee', 'groceries'],
          },
          quantity: 2,
          unitPrice: 3450,
          addedAt: Date.now() - 86400000,
        },
      ],
      subtotal: 6900,
      discount: 500,
      deliveryFee: 0,
      total: 6400,
      deliveryType: 'LAHORE_EXPRESS_2HR',
      estimatedDeliveryText: 'Delivered in 1 hr 18 mins (Lahore Express)',
      shippingAddress: {
        id: 'addr_1',
        fullName: 'Muhammad Ali',
        phone: '03001234567',
        addressLine1: 'House #42, Street 14, Sector Y, Phase 3',
        area: 'DHA Phase 3',
        city: 'Lahore',
        postalCode: '54792',
        isLahore: true,
        isDefault: true,
      },
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'COD',
      status: 'DELIVERED',
      createdAt: '2026-08-25T11:20:00.000Z',
      timeline: [
        { status: 'PLACED', title: 'Order Placed', description: 'Order received', timestamp: '11:20 AM', isCompleted: true },
        { status: 'CONFIRMED', title: 'Confirmed & Packed', description: 'Packed at Gulberg Hub', timestamp: '11:32 AM', isCompleted: true },
        { status: 'OUT_FOR_DELIVERY_2HR', title: 'Express Rider Dispatched', description: 'Rider on bike en route', timestamp: '11:45 AM', isCompleted: true },
        { status: 'DELIVERED', title: 'Delivered to Doorstep', description: 'Received by Muhammad Ali', timestamp: '12:38 PM', isCompleted: true },
      ],
    },
  ],

  setSelectedCity: (city) => {
    haptic.selection();
    set((state) => ({
      user: {
        ...state.user,
        selectedCity: city,
        isLahoreExpressEligible: city.toLowerCase() === 'lahore',
      },
    }));
  },

  setSelectedAddress: (addressId) => {
    haptic.selection();
    set({ selectedAddressId: addressId });
  },

  addAddress: (addressData) => {
    haptic.success();
    const newAddr: ShippingAddress = {
      id: generateId('addr'),
      ...addressData,
    };
    set((state) => ({
      user: {
        ...state.user,
        addresses: [...state.user.addresses, newAddr],
      },
      selectedAddressId: newAddr.id,
    }));
    return newAddr;
  },

  addOrder: (orderData) => {
    haptic.success();
    sound.playSuccess();
    const now = new Date();
    const isLahore = orderData.shippingAddress.isLahore && orderData.deliveryType === 'LAHORE_EXPRESS_2HR';
    const orderNumber = `BZ-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: generateId('ord'),
      orderNumber,
      createdAt: now.toISOString(),
      ...orderData,
      timeline: [
        {
          status: 'PLACED',
          title: 'Order Placed Successfully',
          description: `Order ${orderNumber} received. Preparing for express fulfillment.`,
          timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isCompleted: true,
        },
        {
          status: 'PREPARING',
          title: 'Packing at Nearest Fulfillment Hub',
          description: isLahore ? 'Picking items at Lahore Central Hub.' : 'Transferring to Pakistan Post / Courier Express.',
          timestamp: 'In progress',
          isCompleted: false,
        },
        {
          status: isLahore ? 'OUT_FOR_DELIVERY_2HR' : 'OUT_FOR_DELIVERY_2HR',
          title: isLahore ? '⚡ 2-Hour Express Rider Dispatch' : 'Courier Out for Delivery',
          description: isLahore ? 'Rider assigned for rapid delivery in under 120 mins.' : 'Courier en route to your city address.',
          timestamp: isLahore ? 'Estimated in 35 mins' : 'Estimated 2-3 Days',
          isCompleted: false,
        },
      ],
    };

    set((state) => ({
      orders: [newOrder, ...state.orders],
    }));

    return newOrder;
  },

  addRecentSearch: (query) => {
    const clean = query.trim();
    if (!clean) return;
    set((state) => {
      const filtered = state.recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase());
      return {
        recentSearches: [clean, ...filtered].slice(0, 8),
      };
    });
  },

  clearRecentSearches: () => {
    haptic.light();
    set({ recentSearches: [] });
  },

  updateProfile: (data) => {
    haptic.success();
    set((state) => ({
      user: {
        ...state.user,
        ...data,
      },
    }));
  },
}));
