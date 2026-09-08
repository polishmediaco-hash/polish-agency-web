# Rate Limiting & Abuse Prevention

## Where Rate Limiting Is Required

Every one of these endpoints needs rate limiting. AI assistants almost never add it:

- **Auth endpoints** — login, register, password reset, OTP verification, magic link. Without limits, attackers can brute-force passwords or enumerate accounts.
- **AI API calls** — Any endpoint that calls OpenAI, Anthropic, or similar. A single user can drain your entire monthly budget in minutes.
- **Email / SMS sending** — Attackers can use your app as a spam relay.
- **File processing** — Upload, resize, convert. CPU-intensive operations without limits enable denial-of-service.
- **Webhook-like endpoints** — Anything accepting external input at scale.
- **Lead submission / contact forms** — Spam bots will hammer these.

## Express Rate Limiting with express-rate-limit

```javascript
const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for form submissions (lead intake, apply)
const formLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, error: 'Too many submissions. Please try again later.' }
});

// Apply globally and selectively
app.use('/api/', apiLimiter);
app.use('/api/apply', formLimiter);
app.use('/api/leads', formLimiter);
```

## Current Issues in POLISH Media Stack

The current rate limiter applies only to `intakeLimiter` (30 req/15min), but it is **not applied to**:
- `/api/config/firebase` — completely unthrottled
- Lead submission endpoints
- Any route sending WhatsApp/email notifications

Unthrottled notification endpoints can cause:
- WhatsApp spam relay abuse
- Notification flooding (your alert chat gets thousands of fake lead alerts)
- Green API cost overrun

## Combine Per-IP and Per-User Limiting

- IP-only limits are bypassable with VPNs/proxies
- User-only limits require authentication first
- Best practice: IP rate limit on public endpoints, user rate limit on authenticated endpoints

## Don't Trust Client-Submitted Counters

Rate limit state must live server-side. Never:
- Read rate limit state from a request body
- Let users reset their own rate limit records via an API

For multi-server deployments, use Redis (Upstash is free tier + serverless-friendly):

```javascript
const { Ratelimit } = require('@upstash/ratelimit');
const { Redis } = require('@upstash/redis');

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```
