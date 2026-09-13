const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const TARGET_URL = process.env.TARGET_URL || "http://127.0.0.1:3000/presentation?client=Celestia%20Cosmetics&name=Yasmine&board=polish-cosmetics-launch&video=dQw4w9WgXcQ&title=90-Day%20Growth%20Roadmap";
const OUT_DIR = process.env.OUT_DIR || "/Users/Macbook Pro/.gemini/antigravity/brain/da97ccae-cb9e-43f8-9f14-90c244781201";

const VIEWPORTS = [
  { id: "desktop", name: "Desktop Widescreen", width: 1440, height: 900, isMobile: false },
  { id: "tablet", name: "Tablet Portrait", width: 768, height: 1024, isMobile: false },
  { id: "mobile", name: "Standard Mobile (iPhone 14)", width: 390, height: 844, isMobile: true },
  { id: "micro", name: "Micro Mobile (iPhone SE)", width: 320, height: 568, isMobile: true }
];

async function capture() {
  console.log("Capturing presentation views...");
  console.log("Target:", TARGET_URL);
  console.log("Out:", OUT_DIR);

  const browser = await puppeteer.launch({
    headless: "new",
    pipe: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--single-process", "--no-zygote"]
  });

  const report = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile });
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded", timeout: 15000 });
    await new Promise(r => setTimeout(r, 1200));

    const filename = `pres_${vp.id}_${vp.width}.png`;
    const filepath = path.join(OUT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: false });
    console.log(`Saved viewport snapshot: ${filename}`);

    const metrics = await page.evaluate(() => {
      const header = document.querySelector(".pres-header-inner");
      const videoStage = document.querySelector(".pres-video-stage");
      const boardIframe = document.getElementById("boardIframe");
      const headerCta = document.querySelector(".pres-btn-header-cta");
      const headerWa = document.querySelector(".pres-btn-header-wa");
      const bookMonolith = document.querySelector(".pres-btn-primary-monolith");

      const getDims = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { width: Math.round(r.width), height: Math.round(r.height), top: Math.round(r.top) };
      };

      return {
        docWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        hasHOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        headerDims: getDims(header),
        videoDims: getDims(videoStage),
        boardDims: getDims(boardIframe),
        headerCtaDims: getDims(headerCta),
        headerWaVisible: headerWa ? window.getComputedStyle(headerWa).display !== "none" : false,
        bookMonolithDims: getDims(bookMonolith)
      };
    });

    report.push({ viewport: vp.id, width: vp.width, filename, filepath, metrics });
    await page.close();
  }

  await browser.close();
  console.log("Capture complete. Metrics:", JSON.stringify(report, null, 2));
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
