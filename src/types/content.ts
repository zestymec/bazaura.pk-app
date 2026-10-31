/** Editorial content served by GET /content/home. */
export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  ctaText: string;
  badge?: string;
  imageUrl: string;
  bgGradient?: [string, string];
  targetType: 'CATEGORY' | 'REQUEST' | 'FLASH_DEAL' | 'LAHORE_EXPRESS';
  targetValue: string;
}

export interface StoryItem {
  id: string;
  title: string;
  imageUrl: string;
  isLive?: boolean;
  hasUnseen?: boolean;
  actionType: 'CATEGORY' | 'REQUEST' | 'FLASH_DEAL' | 'LAHORE_EXPRESS';
  actionTarget: string;
}
