# TransCredit Core — API Gateway & Central Bank

**Version:** `v0.1.0`  
**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Firebase Admin SDK

TransCredit Core is the central payment gateway for the TransApp ecosystem. It exposes a public API that merchants use to create payment transactions, and hosts a secure checkout page where users complete payments via QR code scanning.

---

## 🏗️ Architecture

```
Merchant (Demo_Shop) ──POST──▶ /api/external/transaction ──▶ Firestore (PENDING)
                                        │
                                        ▼
                               Returns paymentUrl
                                        │
                              User visits /pay/[id]
                                        │
                               QR Code displayed
                                        │
                              HotWave Wallet scans QR
                                        │
                               Firestore → SUCCESS
                                        │
                               onSnapshot fires
                                        │
                               Redirect to returnUrl
```

---

## 🔥 Firebase Setup (Step-by-Step)

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** → name it (e.g., `transapp-dev`)
3. Disable Google Analytics (optional) → **"Create project"**

### 2. Enable Authentication

1. Sidebar → **"Authentication"** → **"Get started"**
2. **"Sign-in method"** tab → Enable **"Email/Password"** + **"Anonymous"**

### 3. Enable Firestore

1. Sidebar → **"Firestore Database"** → **"Create database"**
2. Select **"Start in test mode"** → Choose region → **"Enable"**

### 4. Get Client API Keys

1. ⚙️ **"Project Settings"** → Scroll to **"Your apps"**
2. Click **"Add app"** → **Web** (</>) → Register
3. Copy the `firebaseConfig` values for your `.env.local`

### 5. Generate Service Account JSON

> ⚠️ **Required only for TransCredit Core** (Admin SDK for server-side Firestore).

1. **"Project Settings"** → **"Service accounts"** tab
2. **"Generate new private key"** → Download JSON
3. Copy entire JSON content as a single line:
   ```bash
   cat your-service-account.json | jq -c .
   ```

---

## ⚙️ Environment Variables

Copy `.env.local.example` → `.env.local`:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin SDK (entire JSON as single line)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Public base URL (for paymentUrl generation)
NEXT_PUBLIC_API_URL=http://localhost:3000

# CORS allowed origin (Demo Shop URL)
ALLOWED_ORIGIN=http://localhost:3001
```

---

## 🚀 Installation & Running

```bash
npm install
npm run dev     # http://localhost:3000
```

---

## 📡 API Reference

### `POST /api/external/transaction`

| Field       | Type   | Required | Description            |
|-------------|--------|----------|------------------------|
| `amount`    | number | ✅       | Payment amount (VND)   |
| `orderInfo` | string | ✅       | Order description      |
| `returnUrl` | string | ✅       | Redirect after success |
| `apiKey`    | string | ✅       | `TRANS_KEY_V1`         |

**Response (201):**
```json
{
  "success": true,
  "paymentUrl": "http://localhost:3000/pay/abc123",
  "transactionId": "abc123"
}
```

---

## 🚢 Deployment (Vercel)

1. **Push this repo to GitHub**
2. **Import to Vercel** at [vercel.com/new](https://vercel.com/new)
3. **Add Environment Variables** in Vercel Dashboard → Settings → Environment Variables:
   - All `NEXT_PUBLIC_FIREBASE_*` keys
   - `FIREBASE_SERVICE_ACCOUNT` (the entire JSON as a single line)
   - `NEXT_PUBLIC_API_URL` → Set to your Vercel deployment URL (e.g., `https://transcredit-core.vercel.app`)
   - `ALLOWED_ORIGIN` → Set to the Demo Shop's production URL (e.g., `https://demo-shop.vercel.app`)
4. **Deploy** → Vercel will auto-build and deploy

> [!IMPORTANT]
> After deploying Core, copy the Vercel URL and update:
> - **Demo_Shop** → `NEXT_PUBLIC_CORE_API_URL` in its Vercel env vars
> - **HotWave_Wallet** → If it calls Core directly in the future

---

## 📁 Project Structure

```
TransCredit_Core/
├── app/
│   ├── api/external/transaction/
│   │   └── route.ts          # Public transaction API
│   ├── pay/[id]/
│   │   └── page.tsx          # Checkout page with QR code
│   ├── layout.tsx
│   └── globals.css
├── lib/
│   ├── firebaseAdmin.ts      # Firebase Admin SDK (lazy init)
│   └── firebaseClient.ts     # Firebase Client SDK (client)
├── .env.local.example
├── LICENSE
└── README.md
```

---

## 📄 License

MIT — See [LICENSE](./LICENSE)
