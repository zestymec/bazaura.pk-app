import { env } from '../../config/env';
import { http } from '../client';
import { endpoints } from '../endpoints';
import { mockServer } from '../mock/server';
import { AuthSession, OtpRequestResponse, OtpVerifyPayload } from '../../types/api';

export const authService = {
  requestOtp: (phone: string) =>
    env.USE_MOCK_API
      ? mockServer.auth.requestOtp(phone)
      : http.post<OtpRequestResponse>(endpoints.auth.requestOtp, { phone }, { auth: false }),

  verifyOtp: (payload: OtpVerifyPayload) =>
    env.USE_MOCK_API
      ? mockServer.auth.verifyOtp(payload)
      : http.post<AuthSession>(endpoints.auth.verifyOtp, payload, { auth: false }),
};
