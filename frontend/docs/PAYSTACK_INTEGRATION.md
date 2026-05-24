# Paystack Integration Guide — Beginner Friendly
# Complete step-by-step: from creating an account to handling live payments in TrustBase.
# Read LEARN.md first for background on what Paystack is and why we use it.

---

## What We're Building

TrustBase charges users to get verified:
- Individual verification: ₦2,000
- Business verification: ₦5,000

The flow:
```
User clicks "Get Verified"
    ↓
Our backend calls Paystack API → gets a payment link URL
    ↓
User is redirected to Paystack's payment page (hosted by Paystack, not us)
    ↓
User pays with card / bank transfer / USSD
    ↓
Paystack calls our webhook endpoint (tells us "payment successful")
    ↓
Our backend verifies the webhook is real (HMAC signature check)
    ↓
We mark the user as verified in our database
    ↓
User sees their verified badge
```

---

## STEP 1 — Create a Paystack Account

1. Go to dashboard.paystack.com
2. Click "Create a free account"
3. Fill in your business details
4. Verify your email address

**For development — use TEST mode:**
- After logging in, look for the toggle in the top-right: "Test" / "Live"
- Make sure it says "Test" — test mode uses fake money
- Test card numbers are provided by Paystack (no real money moves)

---

## STEP 2 — Get Your API Keys

1. In Paystack dashboard → Settings (bottom-left gear icon) → API Keys & Webhooks
2. You'll see two pairs of keys:
   - **Test keys** (start with `sk_test_` and `pk_test_`)
   - **Live keys** (start with `sk_live_` and `pk_live_`) — use only when going live

3. For TrustBase backend, copy the **Test Secret Key** (starts with `sk_test_`)
4. Add it to `trustbase/backend/.env`:
   ```
   PAYSTACK_SECRET=sk_test_xxxxxxxxxxxxxxxxxxxx
   ```

**NEVER put your secret key in frontend code or commit it to git.**

---

## STEP 3 — Set Up Your Webhook URL

Paystack needs to call your backend when a payment completes.

**For development (localhost):**
You need a public URL because Paystack can't reach localhost.
Use ngrok to create a temporary public URL:

```sh
# Install ngrok (one time)
npm install -g ngrok

# While your backend is running on port 3000:
ngrok http 3000
```

ngrok gives you a URL like: `https://abc123.ngrok-free.app`

**In Paystack dashboard:**
1. Settings → API Keys & Webhooks → Webhook URL
2. Enter: `https://abc123.ngrok-free.app/api/verify/webhook`
3. Click "Update"

**For production:**
Replace the ngrok URL with your real Railway URL:
`https://your-app.railway.app/api/verify/webhook`

---

## STEP 4 — How the Backend Code Works

### File: `backend/src/config/paystack.js`
```js
const axios = require('axios');

const paystackApi = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
    'Content-Type': 'application/json',
  },
});

module.exports = paystackApi;
```

This creates an axios instance (like a pre-configured fetch) that automatically
includes your secret key in every request header.

### Initiating a Payment (creating a payment link)

When the user clicks "Get Verified", the frontend calls:
`POST /api/verify/initiate`

The backend (`verification.service.js`) does this:
```js
const response = await paystackApi.post('/transaction/initialize', {
  amount: 200000,        // ₦2,000 in kobo (multiply naira × 100)
  currency: 'NGN',
  reference: 'TB-user123-1234567890',   // unique ID you create
  callback_url: 'https://yourapp.com/verification-status',
  metadata: {
    userId: 'user123',
    type: 'individual',
  },
});

// response.data.data.authorization_url is the Paystack payment page URL
// Send this URL to the frontend → frontend redirects user there
```

**What "reference" is:** A unique string YOU create to identify this transaction.
You'll use it later when Paystack tells you the payment went through.
Format: `TB-{userId slice}-{timestamp}` ensures uniqueness.

**What "metadata" is:** Extra data you can attach. Paystack sends it back in the webhook.
We put userId and type here so we know which user to verify when payment completes.

### Handling the Webhook (Paystack tells us "payment done")

Paystack sends a POST request to your webhook URL with payment data.

**CRITICAL SECURITY STEP — Verify the signature:**
Anyone could send a fake POST request to your webhook pretending to be Paystack.
Paystack includes an `x-paystack-signature` header to prove it's really them.
You must verify this signature before doing anything.

```js
const crypto = require('crypto');

// The signature is HMAC-SHA512 of the raw request body, using your secret key
const hash = crypto
  .createHmac('sha512', process.env.PAYSTACK_SECRET)
  .update(rawBody)         // MUST be the raw body string (not parsed JSON!)
  .digest('hex');

if (hash !== req.headers['x-paystack-signature']) {
  return res.sendStatus(401);  // reject fake webhooks
}

// Now it's safe to process
const event = JSON.parse(rawBody);

if (event.event === 'charge.success') {
  // Payment was successful!
  const reference = event.data.reference;  // the reference you created
  // Look up the verification by reference and mark as paid
}

res.sendStatus(200);  // ALWAYS respond 200 quickly — Paystack retries if you don't
```

**Why raw body matters:**
In `app.js`, we have this special line BEFORE `express.json()`:
```js
app.use('/api/verify/webhook', express.raw({ type: 'application/json' }));
```

This tells Express: "for the webhook route, give me the raw bytes, not parsed JSON."
If we let `express.json()` parse it first, the signature check would fail because
the raw bytes and the re-stringified JSON are slightly different.

---

## STEP 5 — Testing Payments Locally

### Test Card Numbers (Paystack test mode)
Use these card numbers on the Paystack test payment page:

| Card Number         | Scenario                        |
|---------------------|----------------------------------|
| 4084 0840 8408 4081 | Successful payment               |
| 4084 0840 8408 4081 | Use any future expiry + CVV 408  |
| 5531 8866 5214 2950 | Mastercard (successful)          |
| 0000 0000 0000 0000 | Declined payment                 |

### Full Test Flow
1. Start backend: `npm run dev` (port 3000)
2. Start ngrok: `ngrok http 3000` → copy the URL
3. Set ngrok URL as webhook in Paystack test dashboard
4. Start frontend: `npm run dev` (port 5173)
5. Create an account → click Get Verified
6. You'll be redirected to Paystack test page
7. Enter test card details → complete payment
8. Paystack sends webhook to ngrok URL → ngrok forwards to your backend
9. Backend verifies signature → marks user as verified
10. User is redirected to /verification-status → shows "Payment Received"

### Checking webhook deliveries
In Paystack dashboard → Settings → API Keys & Webhooks → Webhook Log
You can see every webhook Paystack sent and retry failed ones.

---

## STEP 6 — Paystack Event Types We Handle

| Event | What it means | What we do |
|-------|--------------|-----------|
| `charge.success` | Payment completed successfully | Mark verification as `payment_received` |
| `transfer.failed` | (future) bank transfer failed | Notify user |

We only handle `charge.success` for now. Add more events as needed.

---

## STEP 7 — Going Live (When Ready to Accept Real Money)

1. In Paystack dashboard, switch toggle from "Test" to "Live"
2. You may need to verify your business documents (CAC, bank account)
3. Replace test keys in production environment with live keys:
   - Railway dashboard → Variables → `PAYSTACK_SECRET` = `sk_live_xxxxx`
4. Update the webhook URL to your live Railway URL
5. Set `FRONTEND_URL` in backend to your real Vercel URL

**Never mix test and live keys.** Test keys don't process real money.
Live keys do. Keep them separate by environment.

---

## Common Paystack Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid key" | Wrong secret key format | Check it starts with `sk_test_` |
| Webhook signature mismatch | Parsed body instead of raw | Check app.js raw body setup |
| "Duplicate transaction" | Same reference used twice | Generate unique reference per attempt |
| Callback URL not called | User closed browser | That's OK — webhook handles it, not callback |
| "Amount too small" | Less than ₦100 (10000 kobo) | Our amounts (₦2,000+) are fine |

---

## Paystack API Reference (Key Endpoints Used)

### Initialize Transaction
```
POST https://api.paystack.co/transaction/initialize
Headers: Authorization: Bearer sk_test_xxx
Body: {
  email: "user@email.com",       (optional but recommended for receipts)
  amount: 200000,                (kobo)
  currency: "NGN",
  reference: "unique-string",
  callback_url: "https://your-app/verification-status",
  metadata: { userId: "...", type: "individual" }
}
Response: {
  status: true,
  data: {
    authorization_url: "https://checkout.paystack.com/xxxxxxxxx",
    access_code: "xxxxxxxxx",
    reference: "unique-string"
  }
}
```

### Verify Transaction (manual check, useful for debugging)
```
GET https://api.paystack.co/transaction/verify/{reference}
Headers: Authorization: Bearer sk_test_xxx
Response: {
  data: {
    status: "success",
    amount: 200000,
    reference: "unique-string"
  }
}
```

You can use this endpoint to manually check if a payment went through
(e.g., if a webhook was missed).
