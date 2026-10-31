import { Linking } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import type { ContentBlockOut, Gender, ProductSort, Season } from '../api/types';
import type { ProductFilters } from '../api/endpoints';
import type { RootStackParamList } from '../types/navigation';

/** "season=WINTER&onSale=true" → ProductFilters (COLLECTION targets, §7.3). */
export function parseCollection(query: string | null): Omit<ProductFilters, 'page' | 'limit'> {
  const f: Omit<ProductFilters, 'page' | 'limit'> = {};
  if (!query) return f;
  for (const pair of query.replace(/^\?/, '').split('&')) {
    const [rawKey, rawValue = ''] = pair.split('=');
    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue.replace(/\+/g, ' '));
    if (!value) continue;
    switch (key) {
      case 'category':
      case 'q':
        f[key] = value;
        break;
      case 'gender':
        f.gender = value as Gender;
        break;
      case 'season':
        f.season = value as Season;
        break;
      case 'sort':
        f.sort = value as ProductSort;
        break;
      case 'size':
      case 'color':
        f[key] = [...(f[key] ?? []), value];
        break;
      case 'minPrice':
      case 'maxPrice':
        f[key] = Number(value);
        break;
      case 'express':
      case 'inStock':
      case 'onSale':
      case 'featured':
        f[key] = value === 'true' || value === '1';
        break;
    }
  }
  return f;
}

/** Banner / story tap → navigation (§7.3 table). */
export function openContentTarget(block: ContentBlockOut, navigation: NavigationProp<RootStackParamList>) {
  switch (block.targetType) {
    case 'CATEGORY':
      if (block.targetValue) navigation.navigate('ProductList', { filters: { category: block.targetValue }, title: block.title });
      break;
    case 'PRODUCT':
      if (block.targetValue) navigation.navigate('ProductDetail', { slug: block.targetValue });
      break;
    case 'COLLECTION':
      navigation.navigate('ProductList', { filters: parseCollection(block.targetValue), title: block.title });
      break;
    case 'CUSTOM_REQUEST':
      navigation.navigate('RequestForm', { type: /gift/i.test(block.title) ? 'GIFT' : 'CUSTOM_ITEM' });
      break;
    case 'URL':
      if (block.targetValue?.startsWith('https://')) Linking.openURL(block.targetValue).catch(() => {});
      break;
  }
}
