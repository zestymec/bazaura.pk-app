export interface ProductReview {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  cityName: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Color", "Storage", "Size"
  options: {
    id: string;
    label: string;
    value: string;
    inStock: boolean;
    priceModifier?: number;
  }[];
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  subCategory?: string;
  price: number; // in PKR
  originalPrice?: number; // in PKR
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  description: string;
  images: string[];
  features: string[];
  inStock: boolean;
  stockCount: number;
  isLahoreExpress2Hour: boolean; // ⚡ 2-Hour Lahore Express Delivery USP
  nationwideDeliveryDays: string; // e.g., "2-3 Days"
  badge?: '2-HOUR EXPRESS' | 'HOT DEAL' | 'BEST SELLER' | 'FEATURED' | 'TOP RATED';
  variants?: ProductVariant[];
  tags: string[];
  reviews?: ProductReview[];
  specifications?: Record<string, string>;
  vendorName?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  itemCount: number;
  isPopular?: boolean;
}
