import { env } from '../../config/env';
import { http } from '../client';
import { endpoints } from '../endpoints';
import { mockServer } from '../mock/server';
import { PresignedUpload } from '../../types/api';

export const uploadsService = {
  /**
   * Uploads a local file straight to S3 via a presigned URL and returns the
   * public URL to send to the API (e.g. in a sourcing request's imageUris).
   */
  async uploadImage(localUri: string, folder: 'sourcing_requests' | 'avatars'): Promise<string> {
    const fileName = localUri.split('/').pop() || `upload_${Date.now()}.jpg`;
    const fileType = fileName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

    if (env.USE_MOCK_API) return (await mockServer.uploads.presignedUrl(fileName)).finalFileUrl;

    const presigned = await http.post<PresignedUpload>(endpoints.uploads.presignedUrl, { fileName, fileType, folder });
    const file = await fetch(localUri);
    const blob = await file.blob();
    const res = await fetch(presigned.uploadUrl, { method: 'PUT', headers: { 'Content-Type': fileType }, body: blob });
    if (!res.ok) throw new Error('Image upload failed. Please try again.');
    return presigned.finalFileUrl;
  },
};
