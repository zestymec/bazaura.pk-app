import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomItemRequest } from '../types/request';
import { CreateRequestPayload } from '../types/api';
import { haptic } from '../utils/haptics';
import { sound } from '../utils/audio';
import { persistStorage } from './persist';
import { requestsService } from '../api/services/requests';

interface RequestState {
  requests: CustomItemRequest[];
  setRequests: (requests: CustomItemRequest[]) => void;
  submitRequest: (data: CreateRequestPayload) => Promise<CustomItemRequest>;
  cancelRequest: (requestId: string) => Promise<void>;
  acceptQuote: (requestId: string) => Promise<void>;
  getRequestById: (requestId: string) => CustomItemRequest | undefined;
}

export const useRequestStore = create<RequestState>()(
  persist(
    (set, get) => ({
      requests: [],

      setRequests: (requests) => set({ requests }),

      submitRequest: async (data) => {
        const created = await requestsService.create(data);
        haptic.success();
        sound.playSuccess();
        set((s) => ({ requests: [created, ...s.requests] }));
        return created;
      },

      cancelRequest: async (requestId) => {
        await requestsService.cancel(requestId);
        haptic.medium();
        // Re-fetch so the timeline reflects what the server recorded.
        set({ requests: await requestsService.list() });
      },

      acceptQuote: async (requestId) => {
        await requestsService.acceptQuote(requestId);
        haptic.success();
        sound.playSuccess();
        set({ requests: await requestsService.list() });
      },

      getRequestById: (requestId) => get().requests.find((r) => r.id === requestId),
    }),
    { name: 'bazaura.requests', storage: persistStorage, version: 1 },
  ),
);

export const selectActiveRequestCount = (s: RequestState) =>
  s.requests.filter((r) => r.status === 'SUBMITTED' || r.status === 'SOURCING_IN_PROGRESS' || r.status === 'PRICE_QUOTED')
    .length;
