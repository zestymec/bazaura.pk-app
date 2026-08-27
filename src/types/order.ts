import { CartItem, DeliveryType } from './cart';

export type PaymentMethod =
  | 'CASH_ON_DELIVERY'
  | 'JAZZCASH'
  | 'EASYPAISA'
  | 'DEBIT_CREDIT_CARD';

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY_2HR'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ShippingAddress {
  id: string;
  fullName: string;
  phone: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  area: string; // e.g. "Gulberg III", "DHA Phase 5", "Johar Town"
  city: string; // "Lahore", "Karachi", "Islamabad", etc.
  postalCode?: string;
  isLahore: boolean;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  deliveryType: DeliveryType;
  estimatedDeliveryText: string;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PENDING' | 'PAID' | 'COD';
  status: OrderStatus;
  createdAt: string;
  timeline: {
    status: OrderStatus;
    title: string;
    description: string;
    timestamp: string;
    isCompleted: boolean;
  }[];
}
