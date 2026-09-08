---
name: vibe-security
description: Audits codebases for common security vulnerabilities that AI coding assistants introduce in "vibe-coded" applications. Checks for exposed API keys, broken access control (Supabase RLS, Firebase rules), missing auth validation, client-side trust issues, insecure payment flows, and more. Use this skill whenever the user asks about security, wants a code review, mentions "vibe coding", or when you're writing or reviewing code that handles authentication, payments, database access, API keys, secrets, or user data — even if they don't explicitly mention security. Also trigger when the user says things like "is this safe?", "check my code", "audit this", "review for vulnerabilities", or "can someone hack this?".
license: MIT
metadata:
  author: Chris Raroque (raroque/vibe-security-skill)
  version: "1.0"
  source: https://github.com/raroque/vibe-security-skill
  installed: 2026-09-09
---

Audit code for security vulnerabilities commonly introduced by AI code generation. These issues are prevalent in "vibe-coded" apps — projects built rapidly with AI assistance where security fundamentals get skipped.

AI assistants consistently get these patterns wrong, leading to real breaches, stolen API keys, and drained billing accounts. This skill exists to catch those mistakes before they ship.


## The Core Principle

Never trust the client. Every price, user ID, role, subscription status, feature flag, and rate limit counter must be validated or enforced server-side. If it exists only in the browser, mobile bundle, or request body, an attacker controls it.


## Audit Process

Examine the codebase systematically. For each step, load the relevant reference file only if the codebase uses that technology or pattern. Skip steps that aren't relevant.

1. **Secrets & Environment Variables** — Scan for hardcoded API keys, tokens, or credentials. Check for secrets exposed via client-side env var prefixes (`NEXT_PUBLIC_`, `VITE_`, `EXPO_PUBLIC_`). Verify `.env` is in `.gitignore`. See `references/secrets-and-env.md`.

2. **Database Access Control** — Check Supabase RLS policies, Firebase Security Rules, or Convex auth guards. This is the #1 source of critical vulnerabilities in vibe-coded apps. See `references/database-security.md`.

3. **Authentication & Authorization** — Validate JWT handling, middleware auth, Server Action protection, and session management. See `references/authentication.md`.

4. **Rate Limiting & Abuse Prevention** — Ensure auth endpoints, AI calls, and expensive operations have rate limits. Verify rate limit counters can't be tampered with. See `references/rate-limiting.md`.

5. **Payment Security** — Check for client-side price manipulation, webhook signature verification, and subscription status validation. See `references/payments.md`.

6. **Mobile Security** — Verify secure token storage, API key protection via backend proxy, and deep link validation. See `references/mobile.md`.

7. **AI / LLM Integration** — Check for exposed AI API keys, missing usage caps, and prompt injection vectors. See `references/ai-integration.md`.

8. **Data Access & Input Validation** — Review parameterized queries, ORM safety, input sanitization, and file upload handling. See `references/data-access.md`.

9. **Deployment Configuration** — Check for debug mode, source maps, exposed `.git`, and security headers. See `references/deployment.md`.


## Output Format

For each vulnerability found:

```
[SEVERITY] Category
Location: file:line or component name
Issue: What the vulnerability is
Impact: What an attacker can do
Fix: The specific change needed
```

Severity levels: CRITICAL | HIGH | MEDIUM | LOW

Always provide code examples for fixes. If a fix would break existing functionality, explain the trade-off.


## For the POLISH Media Co Stack (Node.js + Express + Firebase)

When auditing this specific project, pay special attention to:

- **Admin route** `/admin` — served without any server-side auth middleware
- **Firebase config endpoint** `/api/config/firebase` — unthrottled, exposes live API key to any anonymous request
- **`ADMIN_API_KEY`** in `.env` — weak, guessable static key
- **`cors()` with no origin** — allows any domain to call your APIs
- **`contentSecurityPolicy: false`** in Helmet — opens XSS attack surface
- **Flat-file JSON storage** (`server/db/leads.json`, `content.json`) — no atomic writes, no backup, race conditions on concurrent requests
- **`.env` in repo** — verify it is gitignored and not committed to history
- **Firebase security rules** — verify client-side Firebase cannot write unrestricted data
- **WhatsApp token** in `.env` — if exposed, attackers can send messages from your number
