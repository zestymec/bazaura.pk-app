import { api } from '../api/endpoints';

/** Presign → PUT to storage → return the public URL to store (FRONTEND.md §7.14). */
export async function uploadImage(localUri: string, folder: 'avatars' | 'custom-requests' | 'reviews', mimeType?: string) {
  const lower = localUri.toLowerCase();
  const contentType = mimeType ?? (lower.endsWith('.png') ? 'image/png' : lower.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
  const { uploadUrl, fileUrl } = await api.presignUpload({
    fileName: localUri.split('/').pop() ?? 'photo.jpg',
    contentType,
    folder,
  });
  const blob = await (await fetch(localUri)).blob();
  const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': contentType }, body: blob });
  if (!put.ok) throw new Error('Upload failed');
  return fileUrl;
}
