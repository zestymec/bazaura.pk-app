import { env } from '../../config/env';
import { http } from '../client';
import { endpoints } from '../endpoints';
import { mockServer } from '../mock/server';
import { FlashDealsResponse, HomeContent, Paginated, ProductListParams } from '../../types/api';
import { Product } from '../../types/product';

export const catalogService = {
  home: () => (env.USE_MOCK_API ? mockServer.content.home() : http.get<HomeContent>(endpoints.content.home, { auth: false })),

  products: (params: ProductListParams, signal?: AbortSignal) =>
    env.USE_MOCK_API
      ? mockServer.products.list(params)
      : http.get<Paginated<Product>>(endpoints.products.list, { query: { ...params }, signal }),

  product: (id: string) =>
    env.USE_MOCK_API ? mockServer.products.detail(id) : http.get<Product>(endpoints.products.detail(id)),

  flashDeals: () =>
    env.USE_MOCK_API
      ? mockServer.products.flashDeals()
      : http.get<FlashDealsResponse>(endpoints.products.flashDeals, { auth: false }),
};
