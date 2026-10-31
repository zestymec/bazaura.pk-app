import { env } from '../../config/env';
import { http } from '../client';
import { endpoints } from '../endpoints';
import { mockServer } from '../mock/server';
import { NewAddressPayload, UpdateProfilePayload } from '../../types/api';
import { ShippingAddress } from '../../types/order';
import { UserProfile } from '../../types/user';

export const usersService = {
  me: () => (env.USE_MOCK_API ? mockServer.users.me() : http.get<UserProfile>(endpoints.users.me)),

  update: (data: UpdateProfilePayload) =>
    env.USE_MOCK_API ? mockServer.users.update(data) : http.put<UserProfile>(endpoints.users.me, data),

  setCity: (city: string) =>
    env.USE_MOCK_API
      ? mockServer.users.setCity(city)
      : http.put<{ selectedCity: string; isLahoreExpressEligible: boolean }>(endpoints.users.city, { city }),

  addAddress: (data: NewAddressPayload) =>
    env.USE_MOCK_API ? mockServer.users.addAddress(data) : http.post<ShippingAddress>(endpoints.users.addresses, data),

  deleteAddress: (id: string) =>
    env.USE_MOCK_API ? mockServer.users.deleteAddress(id) : http.delete<void>(endpoints.users.address(id)),
};
