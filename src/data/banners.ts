export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  ctaText: string;
  badge: string;
  imageUrl: string;
  bgGradient: [string, string];
  targetType: 'CATEGORY' | 'REQUEST' | 'FLASH_DEAL' | 'LAHORE_EXPRESS';
  targetValue: string;
}

export interface StoryItem {
  id: string;
  title: string;
  imageUrl: string;
  isLive?: boolean;
  hasUnseen?: boolean;
  actionType: 'CATEGORY' | 'REQUEST' | 'FLASH_DEAL';
  actionTarget: string;
}

export const PROMO_BANNERS: PromoBanner[] = [
  {
    id: 'banner_lahore_2hr',
    title: 'Lahore Express in 2 Hours',
    subtitle: 'Order from anywhere in Lahore, at your door in 120 mins',
    tag: '⚡ LAHORE EXCLUSIVE',
    ctaText: 'Shop Express',
    badge: '120 Min Delivery',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    bgGradient: ['#FF5B24', '#BF3305'],
    targetType: 'LAHORE_EXPRESS',
    targetValue: 'lahore_express',
  },
  {
    id: 'banner_request_item',
    title: "Can't Find An Item?",
    subtitle: 'Our concierge team will source & deliver any product for you',
    tag: '✨ SOURCING CONCIERGE',
    ctaText: 'Request Custom Item',
    badge: 'Special Feature',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&auto=format&fit=crop&q=80',
    bgGradient: ['#D4AF37', '#917116'],
    targetType: 'REQUEST',
    targetValue: 'request_tab',
  },
  {
    id: 'banner_flash_tech',
    title: 'Next-Gen Tech & Gadgets',
    subtitle: 'Up to 45% OFF on Smart Watches, Earbuds & Smart Home',
    tag: '🔥 MEGA DEAL',
    ctaText: 'Explore Gadgets',
    badge: 'Save Big',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
    bgGradient: ['#0F172A', '#334155'],
    targetType: 'CATEGORY',
    targetValue: 'electronics',
  },
];

export const STORY_ITEMS: StoryItem[] = [
  {
    id: 'story_2hr',
    title: '⚡ 2-Hr Lahore',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80',
    isLive: true,
    hasUnseen: true,
    actionType: 'CATEGORY',
    actionTarget: 'groceries',
  },
  {
    id: 'story_request',
    title: '✨ Sourcing',
    imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=300&auto=format&fit=crop&q=80',
    hasUnseen: true,
    actionType: 'REQUEST',
    actionTarget: 'request',
  },
  {
    id: 'story_deals',
    title: '🔥 Flash 50%',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=300&auto=format&fit=crop&q=80',
    hasUnseen: true,
    actionType: 'FLASH_DEAL',
    actionTarget: 'deals',
  },
  {
    id: 'story_tech',
    title: '🎧 Audio',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    hasUnseen: false,
    actionType: 'CATEGORY',
    actionTarget: 'gadgets',
  },
  {
    id: 'story_fashion',
    title: '👗 Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&auto=format&fit=crop&q=80',
    hasUnseen: false,
    actionType: 'CATEGORY',
    actionTarget: 'fashion',
  },
  {
    id: 'story_beauty',
    title: '💄 Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80',
    hasUnseen: false,
    actionType: 'CATEGORY',
    actionTarget: 'beauty',
  },
];
