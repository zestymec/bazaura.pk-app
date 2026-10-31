import { DeliveryType, Voucher } from '../types/cart';
import { Product } from '../types/product';

/**
 * Pricing rules from backend_blueprint.md §3.5. The server is the source of
 * truth at checkout (POST /cart/validate); this mirror keeps the cart UI
 * instant while offline or before validation returns.
 */
export const FREE_SHIPPING_THRESHOLD = 10000;
export const DELIVERY_FEES: Record<DeliveryType, number> = {
  LAHORE_EXPRESS_2HR: 299,
  NATIONWIDE_STANDARD: 199,
};

export const AVAILABLE_VOUCHERS: Voucher[] = [
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

export function unitPriceFor(product: Product, selectedVariants: Record<string, string> = {}): number {
  let price = product.price;
  product.variants?.forEach((v) => {
    const match = v.options.find((opt) => opt.value === selectedVariants[v.name]);
    if (match?.priceModifier) price += match.priceModifier;
  });
  return price;
}

export function deliveryFeeFor(subtotal: number, deliveryType: DeliveryType): number {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return DELIVERY_FEES[deliveryType];
}

export function discountFor(subtotal: number, voucher: Voucher | null): number {
  if (!voucher || subtotal <= 0) return 0;
  if (voucher.minOrderAmount && subtotal < voucher.minOrderAmount) return 0;
  if (voucher.discountType === 'PERCENT') {
    const d = Math.round((subtotal * voucher.value) / 100);
    return voucher.maxDiscount ? Math.min(d, voucher.maxDiscount) : d;
  }
  return Math.min(voucher.value, subtotal);
}

export function calculateTotals(
  lines: { unitPrice: number; quantity: number }[],
  deliveryType: DeliveryType,
  voucher: Voucher | null,
) {
  const subtotal = lines.reduce((acc, l) => acc + l.unitPrice * l.quantity, 0);
  const itemCount = lines.reduce((acc, l) => acc + l.quantity, 0);
  const deliveryFee = deliveryFeeFor(subtotal, deliveryType);
  const discount = discountFor(subtotal, voucher);
  return {
    subtotal,
    itemCount,
    deliveryFee,
    discount,
    total: Math.max(0, subtotal - discount + deliveryFee),
  };
}
