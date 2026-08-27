export type RequestStatus =
  | 'SUBMITTED'
  | 'SOURCING_IN_PROGRESS'
  | 'PRICE_QUOTED'
  | 'CONFIRMED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'UNAVAILABLE';

export interface SourcingQuote {
  quotedPrice: number; // in PKR
  estimatedDeliveryHours: number; // 2 hours for Lahore, 48-72 for Nationwide
  deliveryType: 'LAHORE_EXPRESS_2HR' | 'NATIONWIDE_STANDARD';
  notes: string;
  validUntil: string;
}

export interface CustomItemRequest {
  id: string;
  itemName: string;
  category: string;
  brandOrModel?: string;
  expectedPrice?: number; // in PKR
  referenceUrl?: string;
  description: string;
  imageUris: string[];
  urgency: 'LAHORE_2HR_EXPRESS' | 'STANDARD_NATIONWIDE';
  contactPhone: string;
  deliveryAddress: string;
  city: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  quote?: SourcingQuote;
  statusTimeline: {
    status: RequestStatus;
    label: string;
    timestamp: string;
    description: string;
  }[];
}
