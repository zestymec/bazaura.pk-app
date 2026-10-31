import { env } from '../../config/env';
import { http } from '../client';
import { endpoints } from '../endpoints';
import { mockServer } from '../mock/server';
import { CartValidatePayload, CartValidation, CreateOrderPayload } from '../../types/api';
import { Order } from '../../types/order';

export const ordersService = {
  validateCart: (payload: CartValidatePayload) =>
    env.USE_MOCK_API ? mockServer.cart.validate(payload) : http.post<CartValidation>(endpoints.cart.validate, payload),

  list: () => (env.USE_MOCK_API ? mockServer.orders.list() : http.get<Order[]>(endpoints.orders.list)),

  detail: (id: string) => (env.USE_MOCK_API ? mockServer.orders.detail(id) : http.get<Order>(endpoints.orders.detail(id))),

  create: (payload: CreateOrderPayload) =>
    env.USE_MOCK_API ? mockServer.orders.create(payload) : http.post<Order>(endpoints.orders.create, payload),
};
