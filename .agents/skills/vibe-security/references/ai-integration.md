# AI / LLM Integration Security

## API Keys Are Server-Side Only

AI API keys (OpenAI, Anthropic, Google, etc.) must never appear in client-side code. They allow unlimited API usage at your expense. A leaked key can drain thousands of dollars in minutes.

- No `NEXT_PUBLIC_OPENAI_API_KEY`
- No API keys in React Native / Expo bundles
- No API keys in client-side JavaScript

All AI API calls go through your backend. The client sends the user's message to your server; your server calls the AI API.

## Spending Caps

Set hard spending caps on every AI API provider:
- OpenAI: Usage limits in dashboard
- Anthropic: Spending limits in console
- Google: Budget alerts in Cloud Console
- Calendly / Green API / third-party services: Monitor for abuse

Also implement **per-user usage limits** in your application:
- Track request counts per IP in your database or Redis
- Set daily/monthly caps per user or per tier
- Return a clear error when limits are exceeded
- Don't rely on the AI provider's caps alone — they may have lag

## Prompt Injection

User input must be sanitized before inclusion in prompts. Never concatenate raw user input into system prompts:

```javascript
// BAD: user can override system instructions
const prompt = `You are a helpful assistant. User says: ${userInput}`;

// BETTER: separate system and user messages
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: userInput }, // Keep separate, never interpolate into system
];
```

## Third-Party API Credential Security (POLISH Media Specific)

The stack uses several third-party APIs with credentials in `.env`:

| Service | Token/Key | Risk if Leaked |
|---------|-----------|----------------|
| Green API (WhatsApp) | `GREEN_API_TOKEN_INSTANCE` | Attackers send WhatsApp messages from your number |
| Calendly | `CALENDLY_API_TOKEN` | Read/modify your calendar and meeting data |
| Firebase | `FIREBASE_API_KEY` | Low risk alone — Firebase Security Rules are the real guard |
| Admin Key | `ADMIN_API_KEY` | Full admin access to your CMS |

Rotate all credentials immediately if `.env` was ever committed to git. Run:
```bash
git log --all --full-history -- .env
git log --all --full-history -- "**/.env"
```
If any `.env` appears in history, those credentials are compromised.
