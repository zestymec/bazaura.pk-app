/**
 * Demo catalog mirroring the backend's `make seed` (FRONTEND.md §11):
 * 7 categories, 10 products with S–XL or waist-size variants, voucher
 * WELCOME10 and a home banner. Used only while env.USE_MOCK_API is true.
 */
import type { CategoryNode, ContentBlockOut, ProductDetail, StorefrontConfig, VariantOut } from '../types';

export const MOCK_CONFIG: StorefrontConfig = {
  currency: 'PKR',
  paymentMethods: ['CASH_ON_DELIVERY'],
  freeShippingThreshold: 5000,
  expressDeliveryHours: 3,
  expressDeliveryCities: ['Lahore'],
  deliveryOptions: [
    { type: 'STANDARD', label: 'Standard delivery', estimate: '3–5 working days', fee: 200, available: true },
    { type: 'EXPRESS', label: 'Express delivery', estimate: 'Within 3 hours', fee: 400, available: true },
  ],
  giftWrapFee: 150,
};

export const MOCK_VOUCHERS = [
  { code: 'WELCOME10', description: '10% off orders over Rs. 2,000', percent: 10, minSubtotal: 2000, maxDiscount: 1000 },
];

const img = (label: string, bg: string, fg = 'FFFFFF') =>
  `https://placehold.co/600x750/${bg}/${fg}/png?text=${encodeURIComponent(label)}&font=poppins`;

const cat = (id: string, name: string, slug: string, parentId: string | null, order: number, bg: string): CategoryNode => ({
  id,
  name,
  slug,
  parentId,
  description: null,
  imageUrl: img(' ', bg, bg),
  iconName: null,
  isFeatured: parentId !== null,
  displayOrder: order,
  children: [],
});

const CHILDREN: CategoryNode[] = [
  cat('cat_hoodies', 'Hoodies', 'men-hoodies', 'cat_men', 1, '292524'),
  cat('cat_jackets', 'Jackets', 'men-jackets', 'cat_men', 2, '44403C'),
  cat('cat_shirts', 'Shirts', 'men-shirts', 'cat_men', 3, '1E3A5F'),
  cat('cat_tshirts', 'T-Shirts', 'men-t-shirts', 'cat_men', 4, 'FF5722'),
  cat('cat_trousers', 'Trousers', 'men-trousers', 'cat_men', 5, '57534E'),
  cat('cat_tracksuits', 'Tracksuits', 'men-tracksuits', 'cat_men', 6, '0F172A'),
];

export const MOCK_CATEGORIES: CategoryNode[] = [{ ...cat('cat_men', 'Men', 'men', null, 1, '1C1917'), children: CHILDREN }];

export const ALL_CATEGORIES: CategoryNode[] = [MOCK_CATEGORIES[0], ...CHILDREN];

const LETTER_SIZES = ['S', 'M', 'L', 'XL'];
const WAIST_SIZES = ['30', '32', '34', '36'];

let skuSeq = 100;
function variants(
  productKey: string,
  price: number,
  colors: { name: string; hex: string }[],
  sizes: string[],
  soldOut: string[] = [],
  low: string[] = [],
): VariantOut[] {
  const out: VariantOut[] = [];
  for (const c of colors) {
    for (const s of sizes) {
      const key = `${c.name}/${s}`;
      const stockQuantity = soldOut.includes(key) ? 0 : low.includes(key) ? 2 : 12 + ((skuSeq * 7) % 20);
      out.push({
        id: `var_${productKey}_${c.name.toLowerCase().replace(/\s+/g, '')}_${s.toLowerCase()}`,
        sku: `BZ-${(skuSeq++).toString().padStart(5, '0')}`,
        size: s,
        color: c.name,
        colorHex: c.hex,
        price,
        stockQuantity,
        inStock: stockQuantity > 0,
      });
    }
  }
  return out;
}

const ref = (c: CategoryNode) => ({ id: c.id, name: c.name, slug: c.slug });
const byId = (id: string) => CHILDREN.find((c) => c.id === id)!;

interface Seed {
  key: string;
  title: string;
  cat: string;
  price: number;
  compareAt?: number;
  badge?: string;
  season: 'SUMMER' | 'WINTER' | 'ALL_SEASON';
  colors: { name: string; hex: string }[];
  sizes: string[];
  soldOut?: string[];
  low?: string[];
  fabric: string;
  fit: string;
  rating: number;
  reviews: number;
  express: boolean;
  featured?: boolean;
  short: string;
  daysAgo: number;
}

const BLACK = { name: 'Black', hex: '1C1917' };
const GREY = { name: 'Grey', hex: '78716C' };
const NAVY = { name: 'Navy', hex: '1E3A5F' };
const OLIVE = { name: 'Olive', hex: '4D5B33' };
const WHITE = { name: 'White', hex: 'F5F5F4' };
const BEIGE = { name: 'Beige', hex: 'D6C3A5' };
const MAROON = { name: 'Maroon', hex: '7F1D1D' };

const SEEDS: Seed[] = [
  { key: 'essential-hoodie', title: 'Essential Oversized Hoodie', cat: 'cat_hoodies', price: 3499, compareAt: 4499, badge: 'SALE', season: 'WINTER', colors: [BLACK, GREY], sizes: LETTER_SIZES, low: ['Black/XL'], fabric: '80% cotton, 20% polyester fleece (320 GSM)', fit: 'Oversized', rating: 4.7, reviews: 128, express: true, featured: true, short: 'Heavyweight brushed fleece with a dropped shoulder and kangaroo pocket.', daysAgo: 3 },
  { key: 'zip-hoodie', title: 'Zip-Up Fleece Hoodie', cat: 'cat_hoodies', price: 3999, badge: 'NEW', season: 'WINTER', colors: [NAVY, MAROON], sizes: LETTER_SIZES, soldOut: ['Maroon/S'], fabric: '100% cotton fleece', fit: 'Regular', rating: 4.5, reviews: 41, express: true, short: 'Full-zip hoodie with metal YKK zip and ribbed cuffs.', daysAgo: 1 },
  { key: 'puffer-jacket', title: 'Quilted Puffer Jacket', cat: 'cat_jackets', price: 7999, compareAt: 9999, badge: 'SALE', season: 'WINTER', colors: [BLACK, OLIVE], sizes: LETTER_SIZES, fabric: 'Nylon shell, polyester padding', fit: 'Regular', rating: 4.8, reviews: 76, express: false, featured: true, short: 'Warm, light and water-resistant for Lahore and Islamabad winters.', daysAgo: 10 },
  { key: 'denim-jacket', title: 'Classic Denim Jacket', cat: 'cat_jackets', price: 5499, badge: 'BESTSELLER', season: 'ALL_SEASON', colors: [NAVY], sizes: LETTER_SIZES, low: ['Navy/M'], fabric: '100% cotton denim (12 oz)', fit: 'Regular', rating: 4.6, reviews: 203, express: true, short: 'Rigid denim trucker jacket that softens with every wear.', daysAgo: 30 },
  { key: 'oxford-shirt', title: 'Oxford Button-Down Shirt', cat: 'cat_shirts', price: 2799, season: 'ALL_SEASON', colors: [WHITE, NAVY], sizes: LETTER_SIZES, fabric: '100% cotton oxford', fit: 'Slim', rating: 4.4, reviews: 58, express: true, short: 'Crisp oxford cloth with a button-down collar — office to evening.', daysAgo: 14 },
  { key: 'flannel-shirt', title: 'Brushed Flannel Check Shirt', cat: 'cat_shirts', price: 2999, compareAt: 3499, badge: 'SALE', season: 'WINTER', colors: [MAROON, OLIVE], sizes: LETTER_SIZES, fabric: '100% brushed cotton flannel', fit: 'Regular', rating: 4.3, reviews: 22, express: false, short: 'Soft brushed flannel in a classic check.', daysAgo: 20 },
  { key: 'basic-tee', title: 'Heavyweight Basic Tee', cat: 'cat_tshirts', price: 1499, badge: 'BESTSELLER', season: 'SUMMER', colors: [BLACK, WHITE, BEIGE], sizes: LETTER_SIZES, fabric: '100% combed cotton (220 GSM)', fit: 'Boxy', rating: 4.6, reviews: 341, express: true, featured: true, short: 'The everyday tee — thick, soft and holds its shape.', daysAgo: 45 },
  { key: 'graphic-tee', title: 'Lahore Graphic Tee', cat: 'cat_tshirts', price: 1799, badge: 'NEW', season: 'SUMMER', colors: [WHITE, BLACK], sizes: LETTER_SIZES, soldOut: ['White/XL', 'Black/S'], fabric: '100% cotton', fit: 'Oversized', rating: 4.2, reviews: 12, express: true, short: 'Screen-printed graphic inspired by old Lahore.', daysAgo: 2 },
  { key: 'chino-trouser', title: 'Stretch Chino Trouser', cat: 'cat_trousers', price: 3299, season: 'ALL_SEASON', colors: [BEIGE, NAVY, BLACK], sizes: WAIST_SIZES, fabric: '98% cotton, 2% elastane', fit: 'Slim', rating: 4.5, reviews: 97, express: true, short: 'Smart stretch chinos with a tapered leg.', daysAgo: 25 },
  { key: 'fleece-tracksuit', title: 'Fleece Tracksuit Set', cat: 'cat_tracksuits', price: 6499, compareAt: 7499, badge: 'SALE', season: 'WINTER', colors: [BLACK, GREY], sizes: LETTER_SIZES, fabric: 'Cotton-blend fleece', fit: 'Relaxed', rating: 4.7, reviews: 64, express: false, featured: true, short: 'Matching zip jacket and joggers — warm, easy, everyday.', daysAgo: 7 },
];

function toDetail(s: Seed, idx: number): ProductDetail {
  const category = byId(s.cat);
  const vs = variants(s.key, s.price, s.colors, s.sizes, s.soldOut, s.low);
  const first = s.colors[0];
  const images = s.colors.map((c) => img(s.title.split(' ').slice(-1)[0], c.hex === 'F5F5F4' ? 'E7E5E4' : c.hex, c.hex === 'F5F5F4' ? '1C1917' : 'FFFFFF'));
  const discountPercent = s.compareAt ? Math.round(((s.compareAt - s.price) / s.compareAt) * 100) : null;
  return {
    id: `prd_${(idx + 1).toString().padStart(3, '0')}`,
    slug: s.key,
    title: s.title,
    brand: 'Bazaura',
    price: s.price,
    compareAtPrice: s.compareAt ?? null,
    discountPercent,
    primaryImage: images[0],
    images,
    badge: s.badge ?? null,
    gender: 'MEN',
    season: s.season,
    category: ref(category),
    ratingAvg: s.rating,
    reviewCount: s.reviews,
    inStock: vs.some((v) => v.inStock),
    isExpressEligible: s.express,
    availableSizes: s.sizes,
    availableColors: s.colors.map((c) => c.name),
    shortDescription: s.short,
    description: `${s.short} Designed in Lahore and made to last — pre-washed to minimise shrinkage. ${first.name} is our most popular colour.`,
    fabric: s.fabric,
    fit: s.fit,
    careInstructions: 'Machine wash cold, inside out. Do not bleach. Tumble dry low.',
    sizeChartUrl: null,
    attributes: { Fit: s.fit, Season: s.season === 'ALL_SEASON' ? 'All season' : s.season === 'WINTER' ? 'Winter' : 'Summer', Origin: 'Made in Pakistan' },
    tags: [s.key, category.slug],
    variants: vs,
    breadcrumbs: [ref(MOCK_CATEGORIES[0]), ref(category)],
    seo: { title: s.title, description: s.short, canonicalUrl: `https://bazaura.pk/p/${s.key}`, image: images[0] },
    updatedAt: new Date(Date.now() - s.daysAgo * 86400000).toISOString(),
  };
}

export const MOCK_PRODUCTS: ProductDetail[] = SEEDS.map(toDetail);
export const FEATURED_SLUGS = SEEDS.filter((s) => s.featured).map((s) => s.key);
export const CREATED_DAYS_AGO: Record<string, number> = Object.fromEntries(SEEDS.map((s) => [s.key, s.daysAgo]));

export const MOCK_CONTENT: ContentBlockOut[] = [
  {
    id: 'cnt_winter',
    contentType: 'BANNER',
    title: 'Winter Drop is here',
    subtitle: 'Hoodies, puffers and tracksuits — up to 25% off.',
    tag: 'NEW SEASON',
    imageUrl: img(' ', 'C2410C', 'C2410C'),
    mobileImageUrl: null,
    ctaText: 'Shop winter',
    targetType: 'COLLECTION',
    targetValue: 'season=WINTER&onSale=true',
    displayOrder: 1,
  },
  {
    id: 'cnt_gift',
    contentType: 'BANNER',
    title: 'Send a gift anywhere in Pakistan',
    subtitle: 'Gift-wrapped, with your message. We handle the rest.',
    tag: 'GIFTING',
    imageUrl: img(' ', '292524', '292524'),
    mobileImageUrl: null,
    ctaText: 'Send a gift',
    targetType: 'CUSTOM_REQUEST',
    targetValue: null,
    displayOrder: 2,
  },
  ...CHILDREN.slice(0, 5).map<ContentBlockOut>((c, i) => ({
    id: `cnt_story_${c.slug}`,
    contentType: 'STORY',
    title: c.name,
    subtitle: null,
    tag: null,
    imageUrl: c.imageUrl!,
    mobileImageUrl: null,
    ctaText: null,
    targetType: 'CATEGORY',
    targetValue: c.slug,
    displayOrder: i + 1,
  })),
];
