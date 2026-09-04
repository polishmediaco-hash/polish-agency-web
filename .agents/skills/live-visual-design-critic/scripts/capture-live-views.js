const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const TARGET_URL = process.env.LIVE_URL || "https://www.polishmediaco.com";
const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR || path.resolve("/Users/Macbook Pro/.gemini/antigravity/brain/fad06f18-b4fd-4b7f-a36a-68ac5be5729b");

const AUDIT_VIEWPORTS = [
  { id: "desktop", name: "Desktop Widescreen", width: 1440, height: 900, isMobile: false },
  { id: "tablet", name: "Tablet Portrait", width: 768, height: 1024, isMobile: false },
  { id: "mobile", name: "Standard Mobile (iPhone 14)", width: 390, height: 844, isMobile: true },
  { id: "micro", name: "Micro Mobile (iPhone SE)", width: 320, height: 568, isMobile: true }
];

const LANGUAGES = ["en", "fr", "ar"];

async function captureLiveViews() {
  console.log("📸 INITIATING LIVE WEBSITE VISUAL CAPTURE ENGINE...");
  console.log("Target URL:", TARGET_URL);
  console.log("Artifacts Directory:", ARTIFACTS_DIR);

  const browser = await puppeteer.launch({
    headless: "new",
    pipe: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--single-process", "--no-zygote"]
  });

  const visualInventory = {
    targetUrl: TARGET_URL,
    timestamp: new Date().toISOString(),
    screenshots: []
  };

  for (const vp of AUDIT_VIEWPORTS) {
    console.log(`\n--- Viewport: ${vp.name} (${vp.width}x${vp.height}) ---`);
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });

    for (const lang of LANGUAGES) {
      console.log(`  Capturing Language: [${lang.toUpperCase()}] on ${vp.id}...`);
      
      await page.evaluateOnNewDocument((targetLang) => {
        sessionStorage.setItem("polish_intro_seen", "true");
        localStorage.setItem("polish_lang_preference", targetLang);
      }, lang);

      const navUrl = `${TARGET_URL}/?lang=${lang}`;
      try {
        await page.goto(navUrl, { waitUntil: "networkidle2", timeout: 25000 });
      } catch (err) {
        console.warn(`    Warning on ${navUrl}: ${err.message}`);
      }

      await page.evaluate((targetLang) => {
        if (window.i18n && window.i18n.setLanguage) {
          window.i18n.setLanguage(targetLang);
        } else {
          document.documentElement.setAttribute("lang", targetLang);
          document.documentElement.setAttribute("dir", targetLang === "ar" ? "rtl" : "ltr");
        }
      }, lang);

      await new Promise(r => setTimeout(r, 500));

      const filename = `live_${vp.id}_${vp.width}_${lang}.png`;
      const filepath = path.join(ARTIFACTS_DIR, filename);
      await page.screenshot({ path: filepath });
      console.log(`    ✓ Saved: ${filename}`);

      const viewMetrics = await page.evaluate((vpWidth, vpHeight) => {
        const card = document.querySelector(".hero-glass-card");
        const line1 = document.querySelector(".hero-h1 .kinetic-line:nth-child(1) .kinetic-text");
        const line2 = document.querySelector(".hero-serif-accent");
        const cardRect = card ? card.getBoundingClientRect() : null;
        const bRect = document.getElementById("bottlenecks") ? document.getElementById("bottlenecks").getBoundingClientRect() : null;

        return {
          card: cardRect ? { width: Math.round(cardRect.width), height: Math.round(cardRect.height), top: Math.round(cardRect.top) } : null,
          nextSectionBelowFold: bRect ? bRect.top >= vpHeight : null,
          line1Font: line1 ? window.getComputedStyle(line1).fontFamily : null,
          line2Font: line2 ? window.getComputedStyle(line2).fontFamily : null,
          line2Style: line2 ? window.getComputedStyle(line2).fontStyle : null,
          isRtl: document.documentElement.getAttribute("dir") === "rtl"
        };
      }, vp.width, vp.height);

      visualInventory.screenshots.push({
        viewport: vp.id,
        width: vp.width,
        height: vp.height,
        lang,
        filename,
        filepath,
        metrics: viewMetrics
      });
    }

    await page.close();
  }

  console.log("\n--- Capturing Core Conversion Funnels (Desktop & Mobile) ---");
  for (const route of ["apply", "creators"]) {
    for (const mode of [{ id: "desktop", w: 1440, h: 900 }, { id: "mobile", w: 390, h: 844 }]) {
      const page = await browser.newPage();
      await page.setViewport({ width: mode.w, height: mode.h });
      await page.evaluateOnNewDocument(() => {
        sessionStorage.setItem("polish_intro_seen", "true");
      });

      const url = `${TARGET_URL}/${route}`;
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 25000 });
      } catch (err) {
        console.warn(`    Warning on ${url}: ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 450));

      const fn = `live_${route}_${mode.id}_${mode.w}_en.png`;
      const fp = path.join(ARTIFACTS_DIR, fn);
      await page.screenshot({ path: fp });
      console.log(`  ✓ Saved: ${fn}`);
      visualInventory.screenshots.push({
        route,
        viewport: mode.id,
        width: mode.w,
        height: mode.h,
        lang: "en",
        filename: fn,
        filepath: fp
      });
      await page.close();
    }
  }

  await browser.close();

  const metaPath = path.join(ARTIFACTS_DIR, "live_visual_audit_manifest.json");
  fs.writeFileSync(metaPath, JSON.stringify(visualInventory, null, 2));
  console.log(`\n✨ Visual Capture Engine Complete! Manifest saved to: ${metaPath}`);
  return visualInventory;
}

captureLiveViews().catch(err => {
  console.error("❌ Capture engine failed:", err);
  process.exit(1);
});
