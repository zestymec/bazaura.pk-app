import { PixelRatio } from 'react-native';

/**
 * Hosts that resize on the fly via a `w` query param. Requesting an image at
 * the size it's displayed (instead of 800–1000px originals) cuts download size
 * by 5–10× on product grids — the single biggest win for scroll smoothness on
 * mid-range Android phones and slow mobile data.
 *
 * When the backend's media CDN goes live (e.g. imgproxy / CloudFront + Lambda
 * at media.bazaura.pk), make sure it honours `w` and `q`.
 */
const RESIZABLE_HOSTS = ['images.unsplash.com', 'media.bazaura.pk'];

export function optimizeImageUrl(uri: string | undefined, displayWidth: number, quality = 70): string {
  if (!uri) return '';
  const match = uri.match(/^https?:\/\/([^/?#]+)/i);
  if (!match || !RESIZABLE_HOSTS.includes(match[1].toLowerCase())) return uri;

  const px = PixelRatio.getPixelSizeForLayoutSize(displayWidth);
  // Round up to a 100px bucket so nearby sizes share the HTTP / image cache.
  const width = Math.min(1600, Math.ceil(px / 100) * 100);
  const [base, query = ''] = uri.split('?');
  const params = query
    .split('&')
    .filter((kv) => kv && !/^(w|q)=/.test(kv));
  params.push(`w=${width}`, `q=${quality}`);
  return `${base}?${params.join('&')}`;
}
