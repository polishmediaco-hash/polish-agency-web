# POLISH Media Agency — Web & Lead Engine (`polishmediaco.com`)

High-ticket 2-page lead generation funnel and backend application built for **POLISH Media Co**.

---

## ⚡ Key Capabilities & Architecture

* **Lightning-Fast Frontend**: Pure modern CSS & Vanilla JS with zero render-blocking bundle bloat. First Contentful Paint < 0.4s.
* **Exact Logo Integration**: The unaltered vector/raster logo anchored across navigation, hero, and footers with cyan-to-blue glow effects.
* **Direct WhatsApp Integration**: Floating, pulsing WhatsApp button linking directly to `+213 662 41 77 61` (`wa.me/213662417761`) with pre-filled conversion copy and quick-chat drawer.
* **Fullstack Lead Intake Backend**:
  * `POST /api/apply`: Validates 9-point brand dossiers, prevents duplicate/spam submissions, and records leads to JSON database with unique IDs.
  * `GET /api/leads`: Secured endpoint to view all applicants with one-click email and social links.
  * Extensible webhook alert dispatcher for Slack/Discord/Email notifications.
* **Production Security & Speed**: Helmet headers, gzip/brotli compression, rate-limiting, and CORS.

---

## 🚀 Quickstart

### 1. Install & Run Locally
```bash
cd polish-agency-web
npm install
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

* **Main Landing Page**: `http://localhost:3000/`
* **Executive Intake Form**: `http://localhost:3000/apply`
* **Lead Admin Portal**: `http://localhost:3000/admin` (Default Key: `polish_admin_secure_key_2026`)

---

## 🌐 Deploying to `polishmediaco.com`

### Option A: Railway / Render / DigitalOcean (Recommended)
1. Push this folder to GitHub.
2. Connect the repo to **Railway** or **Render** (Node.js web service).
3. Set environment variables from `.env`.
4. In your domain registrar (Namecheap, GoDaddy, Cloudflare), point `polishmediaco.com`:
   * **CNAME** `@` / `www` -> your deployment URL (e.g. `polish-web.up.railway.app`).

### Option B: VPS (Ubuntu with PM2 & NGINX)
```bash
npm install -g pm2
pm2 start server/index.js --name "polish-web"
pm2 startup
```

---

## 💬 WhatsApp Customization
Edit `.env`:
```env
WHATSAPP_NUMBER=213662417761
```
