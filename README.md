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
2. Click **"Add project"**
3. Enter a project name (e.g., `transapp-dev`)
4. Disable Google Analytics (optional for dev)
5. Click **"Create project"**

### 2. Enable Authentication

1. In the Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Go to the **"Sign-in method"** tab
4. Enable **"Email/Password"**
5. Also enable **"Anonymous"** (for flexibility)
6. Click **"Save"**

### 3. Enable Firestore Database

1. In the sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a region close to you (e.g., `asia-southeast1`)
5. Click **"Enable"**

### 4. Get Client API Keys

1. Click the **gear icon** ⚙️ next to "Project Overview" → **"Project settings"**
2. Scroll down to **"Your apps"**
3. If no app exists, click **"Add app"** → Choose **Web** (</> icon)
4. Enter an app nickname (e.g., `transapp-web`)
5. Click **"Register app"**
6. You'll see the Firebase config object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc..."
   };
   ```
7. Copy these values — you'll need them for the `.env.local` file

### 5. Generate Service Account JSON (Required for Core)

> ⚠️ **This step is ONLY needed for TransCredit Core** (it uses the Admin SDK for server-side operations).

1. In Project Settings, go to the **"Service accounts"** tab
2. Click **"Generate new private key"**
3. A JSON file will download — it contains your service credentials
4. **Keep this file safe** — do NOT commit it to git
5. Copy the **entire JSON content** as a single line for the environment variable

---

## ⚙️ Environment Variables

Create a file named `.env.local` in the project root:

```env
# Firebase Client SDK (for Payment page real-time listener)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (paste entire JSON as a single line)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

> 💡 **Tip:** To convert the downloaded JSON file to a single line, you can use:
> ```bash
> cat your-service-account.json | jq -c .
> ```

---

## 🚀 Installation & Running

```bash
# Install dependencies
npm install

# Start the development server (port 3000)
npm run dev
```

The server will be available at: **http://localhost:3000**

---

## 📡 API Reference

### `POST /api/external/transaction`

Creates a new pending payment transaction.

**Request Body:**
```json
{
  "amount": 30000,
  "orderInfo": "Premium Coffee",
  "returnUrl": "http://localhost:3001/success",
  "apiKey": "TRANS_KEY_V1"
}
```

**Response (201):**
```json
{
  "success": true,
  "paymentUrl": "http://localhost:3000/pay/abc123",
  "transactionId": "abc123"
}
```

**Error Responses:**
- `400` — Missing required fields or invalid amount
- `401` — Invalid API key
- `500` — Internal server error

**API Key:** `TRANS_KEY_V1` (hardcoded for development)

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
│   ├── page.tsx
│   └── globals.css
├── lib/
│   ├── firebaseAdmin.ts      # Firebase Admin SDK (server)
│   └── firebaseClient.ts     # Firebase Client SDK (client)
├── .env.local.example
├── LICENSE
└── README.md
```

---

## 📄 License

MIT — See [LICENSE](./LICENSE)
