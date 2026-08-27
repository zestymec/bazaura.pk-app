import { create } from 'zustand';
import { CartItem, CartSummary, DeliveryType, Voucher } from '../types/cart';
import { Product } from '../types/product';
import { haptic } from '../utils/haptics';
import { sound } from '../utils/audio';

const AVAILABLE_VOUCHERS: Voucher[] = [
  {
    code: 'BAZAURA10',
    discountType: 'PERCENT',
    value: 10,
    minOrderAmount: 2000,
    maxDiscount: 5000,
    description: '10% OFF on all orders above Rs. 2,000',
  },
  {
    code: 'LAHORE2HR',
    discountType: 'FLAT',
    value: 500,
    minOrderAmount: 5000,
    description: 'Rs. 500 OFF on Lahore Express Orders',
  },
  {
    code: 'FIRSTORDER',
    discountType: 'FLAT',
    value: 1000,
    minOrderAmount: 8000,
    description: 'Rs. 1,000 Welcome Voucher on your first order',
  },
];

interface CartState {
  items: CartItem[];
  deliveryType: DeliveryType;
  appliedVoucher: Voucher | null;
  
  // Actions
  addItem: (product: Product, quantity?: number, selectedVariants?: Record<string, string>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setDeliveryType: (type: DeliveryType) => void;
  applyVoucher: (code: string) => { success: boolean; message: string };
  removeVoucher: () => void;
  clearCart: () => void;
  
  // Selectors
  getSummary: () => CartSummary;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [
    // Pre-populate with sample items so cart is active out-of-the-box
    {
      id: 'cart_init_1',
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
        description: 'Crafted with Arabica coffee beans ground 10 times finer for an authentic, rich aroma.',
        images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80'],
        features: ['100% Pure Arabica & Robusta Beans', '2-Hour Lahore Express Delivery'],
        inStock: true,
        stockCount: 150,
        isLahoreExpress2Hour: true,
        nationwideDeliveryDays: '2-3 Days',
        badge: '2-HOUR EXPRESS',
        tags: ['coffee', 'groceries', 'lahore_2hr'],
      },
      quantity: 1,
      unitPrice: 3450,
      addedAt: Date.now(),
    },
    {
      id: 'cart_init_2',
      product: {
        id: 'prod_3',
        title: 'Anker Prime 20,000mAh Power Bank (200W Output & Smart Display)',
        brand: 'Anker',
        category: 'Audio, Wearables & Gadgets',
        price: 34999,
        originalPrice: 42000,
        discountPercent: 17,
        rating: 4.9,
        reviewCount: 215,
        description: 'Equipped with two high-powered USB-C ports and smart digital display.',
        images: ['https://images.unsplash.com/photo-1609592424368-f9b1f24d45d6?w=800&auto=format&fit=crop&q=80'],
        features: ['200W Output', 'OLED Screen'],
        inStock: true,
        stockCount: 45,
        isLahoreExpress2Hour: true,
        nationwideDeliveryDays: '2 Days',
        badge: '2-HOUR EXPRESS',
        tags: ['anker', 'powerbank'],
      },
      quantity: 1,
      unitPrice: 34999,
      addedAt: Date.now(),
    },
  ],
  deliveryType: 'LAHORE_EXPRESS_2HR',
  appliedVoucher: null,

  addItem: (product, quantity = 1, selectedVariants = {}) => {
    haptic.success();
    sound.playAddToCart();

    // Generate unique ID based on product and variant keys
    const variantKey = Object.entries(selectedVariants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    const itemId = `${product.id}_${variantKey || 'standard'}`;

    // Calculate modifier price if any
    let unitPrice = product.price;
    if (product.variants && selectedVariants) {
      product.variants.forEach((v) => {
        const selectedVal = selectedVariants[v.name];
        const match = v.options.find((opt) => opt.value === selectedVal);
        if (match?.priceModifier) {
          unitPrice += match.priceModifier;
        }
      });
    }

    set((state) => {
      const existingIdx = state.items.findIndex((item) => item.id === itemId);
      if (existingIdx > -1) {
        const updated = [...state.items];
        updated[existingIdx].quantity += quantity;
        return { items: updated };
      }
      return {
        items: [
          ...state.items,
          {
            id: itemId,
            product,
            quantity,
            selectedVariants,
            unitPrice,
            addedAt: Date.now(),
          },
        ],
      };
    });
  },

  removeItem: (itemId) => {
    haptic.medium();
    set((state) => ({
      items: state.items.filter((item) => item.id !== itemId),
    }));
  },

  updateQuantity: (itemId, quantity) => {
    haptic.light();
    sound.playTap();
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
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

  clearCart: () => {
    set({ items: [], appliedVoucher: null });
  },

  getSummary: () => {
    const { items, deliveryType, appliedVoucher } = get();
    const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    // Delivery fee logic: Free above Rs. 10,000. Otherwise 2-Hour Express: Rs. 299, Standard: Rs. 199
    let deliveryFee = 0;
    if (subtotal > 0) {
      if (subtotal >= 10000) {
        deliveryFee = 0; // Free shipping over Rs. 10,000
      } else {
        deliveryFee = deliveryType === 'LAHORE_EXPRESS_2HR' ? 299 : 199;
      }
    }

    let discount = 0;
    if (appliedVoucher && subtotal > 0) {
      if (appliedVoucher.discountType === 'PERCENT') {
        discount = Math.round((subtotal * appliedVoucher.value) / 100);
        if (appliedVoucher.maxDiscount && discount > appliedVoucher.maxDiscount) {
          discount = appliedVoucher.maxDiscount;
        }
      } else {
        discount = appliedVoucher.value;
      }
    }

    const total = Math.max(0, subtotal - discount + deliveryFee);

    return {
      subtotal,
      discount,
      deliveryFee,
      total,
      appliedVoucher,
      deliveryType,
      itemCount,
    };
  },

  getItemCount: () => {
    return get().items.reduce((acc, item) => acc + item.quantity, 0);
  },
}));
