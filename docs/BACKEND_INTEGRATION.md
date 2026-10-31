# Backend integration

The app is built against the backend spec **`FRONTEND.md`** (backend API v1, in the backend repo
under `docs/FRONTEND.md`). This page only covers how to switch the app from demo data to the real server.

## Switch to the real backend

Edit `src/config/env.ts`:

```ts
USE_MOCK_API: false,
// development URLs (include /api/v1):
//   iOS simulator    http://localhost:8000/api/v1
//   Android emulator http://10.0.2.2:8000/api/v1
//   Real phone       http://<laptop-LAN-IP>:8000/api/v1
// production: the HTTPS URL from the backend owner
```

In local development every OTP is `123456`; run `make seed` on the backend for the sample catalog.

Debug builds allow plain `http://`. **Release builds (the shareable APK) only allow HTTPS.**

## How the code maps to the spec

| Spec section | Code |
| --- | --- |
| §4 types | `src/api/types.ts` (verbatim) |
| §5 client | `src/api/client.ts`; tokens in Keychain/Keystore via `src/api/tokens.ts` |
| §6 endpoints | `src/api/endpoints.ts` (`api` object) |
| §9 query keys / freshness | `src/api/queryKeys.ts`, `src/api/hooks/*`, `src/hooks/queryClient.ts` |
| §7.6 cart | `src/store/cart.ts` (variantId + quantity only) + `useCartQuote` |
| Demo backend | `src/api/mock/` (same contract, seed from §11). Delete when the server is live. |

## Deviations from the spec (on purpose)

- **Base URL** lives in `src/config/env.ts` instead of `react-native-config`, so there's no extra native module.
- **Demo-only behaviour** (mock only): custom requests are auto-quoted ~20 s after submission and
  catalog orders move one status per minute, so quote-accept and tracking can be tried without staff tools.
  Photo uploads return `STORAGE_UNAVAILABLE` in demo mode, which exercises the §7.14 fallback.
