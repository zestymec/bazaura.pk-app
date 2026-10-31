import { env } from '../../config/env';
import { http } from '../client';
import { endpoints } from '../endpoints';
import { mockServer } from '../mock/server';
import { WishlistResponse } from '../../types/api';

export const wishlistService = {
  list: () => (env.USE_MOCK_API ? mockServer.wishlist.list() : http.get<WishlistResponse>(endpoints.wishlist.list)),

  toggle: (productId: string) =>
    env.USE_MOCK_API
      ? mockServer.wishlist.toggle(productId)
      : http.post<{ productId: string; isInWishlist: boolean }>(endpoints.wishlist.toggle, { productId }),
};
