/**
 * Runtime configuration.
 *
 * ── Connecting the backend ───────────────────────────────────────────────
 * 1. Put the backend URL (including /api/v1) below:
 *      iOS simulator   → http://localhost:8000/api/v1
 *      Android emulator→ http://10.0.2.2:8000/api/v1
 *      Real phone      → http://<laptop-LAN-IP>:8000/api/v1
 *      Production      → https URL from the backend owner
 * 2. Set USE_MOCK_API to false.
 * In local development every OTP is 123456 (FRONTEND.md §11).
 * ─────────────────────────────────────────────────────────────────────────
 */
import { Platform } from 'react-native';

const API_URL = {
  development: Platform.select({
    android: 'http://10.0.2.2:8000/api/v1',
    default: 'http://localhost:8000/api/v1',
  }),
  production: 'https://api.bazaura.pk/api/v1',
};

export const env = {
  /** true → the app answers from the built-in demo backend (src/api/mock). */
  USE_MOCK_API: true,

  API_URL: __DEV__ ? API_URL.development : API_URL.production,

  /** A free testing server can take ~60 s to wake up (FRONTEND.md §5). */
  TIMEOUT_MS: 70_000,

  /** Simulated latency for the demo backend so loading states are visible. */
  MOCK_LATENCY_MS: 300,

  APP_VERSION: '1.0.0',

  SUPPORT_PHONE: '+92 300 0000000',
  SUPPORT_WHATSAPP: '923000000000',
};
