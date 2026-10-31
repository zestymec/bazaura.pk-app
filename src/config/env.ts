/**
 * App runtime configuration.
 *
 * ── Connecting the real backend ──────────────────────────────────────────
 * 1. Set API_BASE_URL.production to the deployed FastAPI host (HTTPS).
 * 2. For local testing, set API_BASE_URL.development to the dev machine's
 *    LAN IP, e.g. 'http://192.168.1.20:8000' (Android emulator: 10.0.2.2).
 * 3. Flip USE_MOCK_API to false.
 * Every screen already talks to src/api/services, so nothing else changes.
 * ─────────────────────────────────────────────────────────────────────────
 */
import { Platform } from 'react-native';

const API_BASE_URL = {
  development: Platform.select({ android: 'http://10.0.2.2:8000', default: 'http://localhost:8000' }),
  production: 'https://api.bazaura.pk',
};

export const env = {
  /** true → services answer from the in-app mock backend (src/api/mock). */
  USE_MOCK_API: true,

  API_BASE_URL: __DEV__ ? API_BASE_URL.development : API_BASE_URL.production,
  API_PREFIX: '/api/v1',

  /** Network request timeout. Pakistani mobile networks can be slow; keep it generous. */
  REQUEST_TIMEOUT_MS: 15000,
  /** GETs that fail on network errors are retried this many times. */
  GET_RETRIES: 2,

  /** Artificial latency for mock responses so loading states are exercised. */
  MOCK_LATENCY_MS: 350,

  APP_VERSION: '1.0.0',

  SUPPORT_PHONE: '+92 300 0000000',
  SUPPORT_WHATSAPP: '923000000000',
  SUPPORT_EMAIL: 'support@bazaura.pk',
};
