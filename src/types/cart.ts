import { Product } from './product';

export interface CartItem {
  id: string; // unique item id (productId + selected variant combo)
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>; // e.g. { Color: "Midnight Black", Storage: "256GB" }
  unitPrice: number;
  addedAt: number;
}

export type DeliveryType = 'LAHORE_EXPRESS_2HR' | 'NATIONWIDE_STANDARD';

export interface Voucher {
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  value: number; // e.g. 10 for 10%, or 500 for Rs. 500
  minOrderAmount?: number;
  maxDiscount?: number;
  description: string;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedVoucher: Voucher | null;
  deliveryType: DeliveryType;
  itemCount: number;
}
