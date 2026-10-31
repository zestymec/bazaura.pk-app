# Bazaura (`@bazaura.pk`) - Mobile Application

[![React Native CLI](https://img.shields.io/badge/React_Native_CLI-0.76.7-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-FF5B24?style=for-the-badge)](#)

Bazaura is an enterprise-grade, pure **React Native CLI** e-commerce mobile application built for iOS and Android following **Apple Human Interface Guidelines (HIG)** and modern liquid design standards.

---

## 🌟 Core Business Features & USPs

### 1. ⚡ Lahore 2-Hour Express Delivery
- **Instant Motorcycle Dispatch**: Direct fulfillment from localized Lahore hubs (Gulberg, DHA, Johar Town, Model Town, Cantt, Bahria Town).
- **Live Postal Zone Selector**: Dynamic delivery time estimation (45 to 110 mins) based on user neighborhood.
- **Express Indicators**: Highlighting eligible products with real-time countdown clocks.

### 2. 📦 2-3 Days Nationwide Delivery Across Pakistan
- Verified courier logistics covering Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Sialkot, and all other major cities.

### 3. ✨ "Request an Item" Sourcing Concierge
- **Custom Procurement Engine**: Dedicated feature enabling customers to request any unlisted product from international markets or local distributors.
- **Interactive Form**: Clean Apple-style grouped form with budget in PKR, reference URLs, and photo attachment.
- **Real-Time Request Tracker**: Live status timeline progression (`SUBMITTED` ➔ `SOURCING_IN_PROGRESS` ➔ `PRICE_QUOTED` ➔ `CONFIRMED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`) with 1-tap quote acceptance.

### 4. 📱 Apple iOS Liquid Navigation
- Clean elevated bottom tab bar with subtle hairline divider, minimal active icons, live badge counters, and an elevated center **Request** button with tactile haptic response.

### 5. 💳 Pakistan-Tailored Checkout & Payments
- Support for **Cash on Delivery (COD)**, **JazzCash Wallet**, **EasyPaisa**, and **Debit / Credit Cards (Visa & Mastercard)**.
- Dynamic voucher discount engine (e.g., `BAZAURA10` for 10% off, `LAHORE2HR` for Rs. 500 off).
- Free delivery progress tracker above Rs. 10,000.

---

## 🏗 Enterprise Directory Architecture

```
bazaura.pk/
├── assets/
│   └── images/                     # Official brand logos, banners, icons
├── src/
│   ├── components/                 # Reusable, atomic UI components
│   │   ├── common/
│   │   │   ├── Badge.tsx           # Minimalist soft pill badges
│   │   │   ├── Button.tsx          # Apple-style filled & tinted buttons
│   │   │   ├── Header.tsx          # Top bar embedding Bazaura logo & location
│   │   │   ├── Input.tsx           # iOS grouped textfields
│   │   │   └── ProductCard.tsx     # Apple Store style product cards
│   │   ├── home/
│   │   │   ├── CategoryChips.tsx   # Segmented category selector pills
│   │   │   ├── DeliveryUSPBanner.tsx# Clean iOS segmented delivery banner
│   │   │   ├── FlashDealsSection.tsx# Flash deals with minimalist countdown
│   │   │   ├── HeroBannerCarousel.tsx# Apple editorial promo carousel
│   │   │   └── StoryBar.tsx        # Thin 1.5px brand ring stories
│   │   └── navigation/
│   │       └── CustomTabBar.tsx    # iOS liquid bottom tab bar
│   ├── screens/
│   │   ├── home/HomeScreen.tsx     # Main storefront & discovery feed
│   │   ├── explore/ExploreScreen.tsx# iOS search bar, category grid, trending tags
│   │   ├── request/RequestItemScreen.tsx# Sourcing concierge & request tracker
│   │   ├── cart/CartScreen.tsx     # Shopping bag, express toggle, vouchers
│   │   ├── product/ProductDetailScreen.tsx# Product showcase & Lahore postal estimator
│   │   ├── checkout/CheckoutScreen.tsx# iOS Settings grouped checkout
│   │   ├── checkout/OrderSuccessScreen.tsx# Order confirmation & live tracking
│   │   ├── profile/ProfileScreen.tsx# Apple ID style profile & WhatsApp support
│   │   └── wishlist/WishlistScreen.tsx# 2-column saved items grid
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Native Stack Navigator
│   │   └── TabNavigator.tsx        # Bottom Tab Navigator
│   ├── store/                      # Zustand state management stores
│   │   ├── useCartStore.ts         # Cart items, vouchers, delivery fees, totals
│   │   ├── useWishlistStore.ts     # Favorited items with haptics
│   │   ├── useRequestStore.ts      # Custom sourcing requests & status timeline
│   │   └── useUserStore.ts         # Profile, addresses, orders, search history
│   ├── theme/                      # Centralized design tokens
│   │   ├── colors.ts               # Brand Orange (#FF5B24), Gold (#D4AF37), Neutrals
│   │   ├── typography.ts           # Scale, line heights, font weights
│   │   ├── spacing.ts              # Radii (6, 8, 12, 14, 16, 20), subtle iOS shadows
│   │   └── index.ts                # Unified theme object
│   ├── data/                       # Rich mock datasets (products, categories, banners, lahoreAreas)
│   ├── types/                      # TypeScript definitions
│   ├── utils/                      # formatters (PKR), haptics, audio, validation
│   └── services/                   # storage
├── App.tsx                         # Root app component
├── app.json                        # React Native app configuration
├── index.js                        # AppRegistry entry point
├── babel.config.js                 # @react-native/babel-preset
├── metro.config.js                 # @react-native/metro-config
├── tsconfig.json                   # TypeScript compiler configuration
└── package.json                    # Pure React Native CLI dependencies
```

---

## 🎨 Theme & Brand Tokens

Everything is derived from the logo (`assets/images/logo-transparent.png`): one deep orange on white.

| Token | Hex | Purpose |
| :--- | :--- | :--- |
| `primary.500` | `#FF5722` | Bazaura Orange — exact logo colour (CTAs, active states, badges) |
| `secondary.100` | `#FFEDE5` | Brand peach (from the banner gradient) — concierge / premium surfaces |
| `surface.background` | `#FAF8F6` | Warm off-white canvas |
| `neutral.900` | `#1C1917` | Titles (warm ink) |
| `neutral.500` | `#78716C` | Secondary text |

**Fonts** (`assets/fonts`, SIL OFL): **Fredoka** for headings (echoes the bubbly "BazAura" wordmark)
and **Nunito** for body text. `src/components/common/AppText.tsx` picks the right file from each
style's `fontWeight`/`fontSize`, so always import `Text`/`TextInput` from there, not `react-native`.

Brand images (header mark, wordmark, login logo) live in `assets/brand/`. App icons and splash
screens were generated from the logo for both platforms.

---

## 🚀 Getting Started & Running the App (Pure RN CLI)

### Installation
```bash
# 1. Install dependencies
npm install --legacy-peer-deps
```

### Running on Android
```bash
# Start Metro bundler in background
npm start

# Run on Android emulator / connected device
npm run android
```

### Running on iOS
```bash
# Install CocoaPods (macOS only)
cd ios && pod install && cd ..

# Run on iOS Simulator
npm run ios
```

### Type Checking
```bash
npm run check-types
```

### Building the shareable Android APK
```bash
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```
Release builds are signed with `android/app/bazaura-release.keystore` using credentials in
`android/keystore.properties`. **Both files are git-ignored. Back them up offline.** Every future
Play Store update must be signed with the same key. Without `keystore.properties` the build
falls back to the debug key.

The APK targets ARM phones only (`reactNativeArchitectures` in `android/gradle.properties`).
To test on an Intel emulator: `./gradlew assembleRelease -PreactNativeArchitectures=x86_64`.
For the Play Store, upload an App Bundle instead: `./gradlew bundleRelease`.

## 🔌 Backend / API

The app runs on an in-app mock backend until the real API is ready. Switching is one flag in
`src/config/env.ts` (`USE_MOCK_API`). See **[docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md)**
for the exact contract the app expects.
