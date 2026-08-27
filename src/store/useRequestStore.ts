import { create } from 'zustand';
import { CustomItemRequest, RequestStatus } from '../types/request';
import { generateId } from '../utils/formatters';
import { haptic } from '../utils/haptics';
import { sound } from '../utils/audio';

interface RequestState {
  requests: CustomItemRequest[];
  submitRequest: (data: {
    itemName: string;
    category: string;
    brandOrModel?: string;
    expectedPrice?: number;
    referenceUrl?: string;
    description: string;
    imageUris: string[];
    urgency: 'LAHORE_2HR_EXPRESS' | 'STANDARD_NATIONWIDE';
    contactPhone: string;
    deliveryAddress: string;
    city: string;
  }) => CustomItemRequest;
  cancelRequest: (requestId: string) => void;
  acceptQuote: (requestId: string) => void;
  getRequestById: (requestId: string) => CustomItemRequest | undefined;
}

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [
    // Pre-loaded realistic sample request showing live progression
    {
      id: 'req_101',
      itemName: 'Sony PlayStation 5 DualSense Edge Wireless Controller',
      category: 'Electronics & Smart Tech',
      brandOrModel: 'Sony CFI-ZCP1',
      expectedPrice: 58000,
      referenceUrl: 'https://direct.playstation.com/dualsense-edge',
      description: 'Need the official pro controller with swappable thumbstick caps. Need delivery in Gulberg III Lahore.',
      imageUris: ['https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80'],
      urgency: 'LAHORE_2HR_EXPRESS',
      contactPhone: '03001234567',
      deliveryAddress: 'House 42, Main Boulevard, Gulberg III',
      city: 'Lahore',
      status: 'PRICE_QUOTED',
      createdAt: '2026-08-26T14:30:00.000Z',
      updatedAt: '2026-08-26T15:10:00.000Z',
      quote: {
        quotedPrice: 59500,
        estimatedDeliveryHours: 2,
        deliveryType: 'LAHORE_EXPRESS_2HR',
        notes: 'Original sealed US import located at our Gulberg fulfillment center. Ready for 120-minute dispatch.',
        validUntil: '2026-08-28T23:59:59.000Z',
      },
      statusTimeline: [
        {
          status: 'SUBMITTED',
          label: 'Request Submitted',
          timestamp: '2026-08-26 02:30 PM',
          description: 'Your item request was received by our Bazaura Sourcing Desk.',
        },
        {
          status: 'SOURCING_IN_PROGRESS',
          label: 'Sourcing In Progress',
          timestamp: '2026-08-26 02:45 PM',
          description: 'Our Lahore procurement team verified inventory with authorized distributors.',
        },
        {
          status: 'PRICE_QUOTED',
          label: 'Price Quoted & Verified',
          timestamp: '2026-08-26 03:10 PM',
          description: 'Quote prepared: Rs. 59,500 with 2-Hour Express Lahore Delivery.',
        },
      ],
    },
  ],

  submitRequest: (data) => {
    haptic.success();
    sound.playSuccess();

    const now = new Date().toISOString();
    const newRequest: CustomItemRequest = {
      id: generateId('req'),
      ...data,
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
      statusTimeline: [
        {
          status: 'SUBMITTED',
          label: 'Request Submitted',
          timestamp: new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          description: 'Your custom request has been routed to our Bazaura Concierge team.',
        },
      ],
    };

    set((state) => ({
      requests: [newRequest, ...state.requests],
    }));

    return newRequest;
  },

  cancelRequest: (requestId) => {
    haptic.medium();
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'UNAVAILABLE' as RequestStatus,
              statusTimeline: [
                ...req.statusTimeline,
                {
                  status: 'UNAVAILABLE' as RequestStatus,
                  label: 'Request Cancelled',
                  timestamp: new Date().toLocaleTimeString(),
                  description: 'Request was cancelled by user.',
                },
              ],
            }
          : req
      ),
    }));
  },

  acceptQuote: (requestId) => {
    haptic.success();
    sound.playSuccess();
    set((state) => ({
      requests: state.requests.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: 'CONFIRMED' as RequestStatus,
              statusTimeline: [
                ...req.statusTimeline,
                {
                  status: 'CONFIRMED' as RequestStatus,
                  label: 'Quote Accepted & Confirmed',
                  timestamp: new Date().toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }),
                  description: 'Sourcing confirmed! Item is being packed for express courier dispatch.',
                },
              ],
            }
          : req
      ),
    }));
  },

  getRequestById: (requestId) => {
    return get().requests.find((r) => r.id === requestId);
  },
}));
