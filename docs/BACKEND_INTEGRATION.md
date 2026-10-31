# Backend Integration Guide

For the Python/FastAPI developer building the Bazaura API. The full contract is in
[`backend_blueprint.md`](../backend_blueprint.md); this page covers what the app
**actually sends and expects**, so the two plug together without surprises.

## Switching the app to the real API

Edit [`src/config/env.ts`](../src/config/env.ts):

```ts
USE_MOCK_API: false,
API_BASE_URL: { development: 'http://192.168.1.20:8000', production: 'https://api.bazaura.pk' }
```

- Android emulator → `http://10.0.2.2:8000`; a real phone → your laptop's LAN IP.
- **Debug builds** allow plain `http://`. **Release builds (the APK) allow HTTPS only.**
  Test a release APK against a deployed HTTPS server.

Nothing else changes: every screen goes through `src/api/services/*`, which has a
mock branch and a real HTTP branch per call.

## Where things live

| File | Purpose |
| --- | --- |
| `src/api/endpoints.ts` | Every path (mirrors blueprint §3) |
| `src/api/client.ts` | `fetch` wrapper: auth header, timeout, retries, token refresh |
| `src/api/services/*.ts` | One file per module (auth, users, catalog, orders, requests, wishlist, uploads) |
| `src/types/api.ts` | Request/response payload types |
| `src/api/mock/server.ts` | In-app mock backend — a working reference implementation of every endpoint |

## Response format the client expects

```json
{ "success": true, "message": "optional", "data": { ... } }
```

- The client unwraps `data`. A bare (non-envelope) JSON body also works.
- Errors: any non-2xx, **or** `"success": false`. The message shown to the user comes
  from `message`, then `detail`. FastAPI's default 422 body
  (`{"detail": [{"loc": [...], "msg": "..."}]}`) is understood too.
- `204 No Content` is fine for deletes.
- JSON keys inside `data` are **camelCase** (as in the blueprint), except the auth
  token fields (`access_token`, `refresh_token`, `expires_in`) and pagination
  (`total_items`, `total_pages`).

## Headers sent on every request

```
Authorization: Bearer <access_token>     (when logged in)
X-App-Version: 1.0.0
X-Platform: ios | android
Accept: application/json
Content-Type: application/json           (when there's a body)
```

## Auth flow

1. `POST /auth/otp/request` `{ phone }` → `{ expires_in_seconds, resend_available_in_seconds }`.
   The app shows a resend countdown from the second value.
2. `POST /auth/otp/verify` `{ phone, otp_code, full_name? }` → `{ access_token, refresh_token, token_type, expires_in, user }`.
   `full_name` is only sent if the user typed one (new customers). Phone arrives normalised as `03XXXXXXXXX`.
3. On any **401**, the client calls `POST /auth/refresh` `{ refresh_token }` **once**,
   stores the new pair, and retries. If refresh fails, the user is logged out.
   Concurrent 401s share a single refresh call.

Guests can browse and build a cart with no token. Only these need auth:
orders, requests, wishlist, users/me, uploads.

## Notes per endpoint

- **`GET /products`**: sends `search`, `category_id`, `express_only`, `sort_by`, `page`, `limit=20`.
  The app does infinite scroll and stops when `pagination.page >= pagination.total_pages`.
  `category_id` is the category's `id` (e.g. `cat_electronics`).
- **`GET /products/{id}`**: the detail screen calls this right away to fetch `reviews`
  and `specifications`. The list endpoint can omit those two fields to keep payloads small.
- **`GET /content/home`**: powers the whole Home screen *and* the category list in
  Explore/Request (cached 5 min). `heroBanners[]` may also include optional `badge`
  and `bgGradient: [hex, hex]`. `stories[].actionType` may be `CATEGORY | REQUEST | FLASH_DEAL | LAHORE_EXPRESS`,
  with `actionTarget` = search query or category.
- **`POST /cart/validate`**: called at checkout right before placing the order. The app
  **uses the server's totals** for `POST /orders`. Return 422 with a clear `message`
  for out-of-stock items or a bad voucher; it's shown to the user verbatim.
- **`POST /orders`**: return the full `Order` object (with `items[].product` populated
  and `timeline`). It's shown on the success screen and in order history.
- **`POST /requests`**: `imageUris` holds final S3 URLs (the app uploads first via
  `POST /uploads/presigned-url`, then `PUT`s the file to `uploadUrl` with the matching `Content-Type`).
- **`POST /requests/{id}/accept-quote`**, **`/cancel`**: the app re-fetches
  `GET /requests` afterwards, so these can return a minimal body.
- **`POST /wishlist/toggle`**: called optimistically; on error the app rolls back.
  After login, items saved as a guest are pushed with toggle calls.

## Images

Product grids request images at display size by setting `w` and `q` query params on
`images.unsplash.com` and `media.bazaura.pk` URLs (see `src/utils/images.ts`). If the
media CDN supports on-the-fly resizing with those params (imgproxy, Cloudflare Images,
CloudFront + Lambda), grids download 5–10× less data. If it doesn't, nothing breaks.

## Done = delete the mock

When every endpoint is live, set `USE_MOCK_API: false`. You can then delete
`src/api/mock/` and remove the `env.USE_MOCK_API ? … :` branches.
