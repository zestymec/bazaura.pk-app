import { env } from '../../config/env';
import { http } from '../client';
import { endpoints } from '../endpoints';
import { mockServer } from '../mock/server';
import { AcceptQuoteResponse, CreateRequestPayload } from '../../types/api';
import { CustomItemRequest } from '../../types/request';
import { PaymentMethod } from '../../types/order';

export const requestsService = {
  list: () =>
    env.USE_MOCK_API ? mockServer.requests.list() : http.get<CustomItemRequest[]>(endpoints.requests.list),

  create: (payload: CreateRequestPayload) =>
    env.USE_MOCK_API
      ? mockServer.requests.create(payload)
      : http.post<CustomItemRequest>(endpoints.requests.create, payload),

  acceptQuote: (id: string, paymentMethod: PaymentMethod = 'CASH_ON_DELIVERY') =>
    env.USE_MOCK_API
      ? mockServer.requests.acceptQuote(id)
      : http.post<AcceptQuoteResponse>(endpoints.requests.acceptQuote(id), { paymentMethod }),

  cancel: (id: string) =>
    env.USE_MOCK_API ? mockServer.requests.cancel(id) : http.post<void>(endpoints.requests.cancel(id)),
};
