import { ShippingAddress } from './order';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  addresses: ShippingAddress[];
  defaultAddressId?: string;
  selectedCity: string; // Defaults to "Lahore"
  isLahoreExpressEligible: boolean;
  memberSince: string;
}
