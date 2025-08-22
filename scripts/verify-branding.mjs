// Verification script for Fynix branding & meta
// Run locally with:  BASE_URL=http://localhost:4173 node scripts/verify-branding.mjs
// Assumes a server is running at BASE_URL (vite preview, next start, etc.)

import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:4173";

function log(pass, msg) {
  const icon = pass ? "✅" : "❌";
  console.log(`${icon} ${msg}`);
}

function assert(cond, msg) {
  if (!cond) {
    log(false, msg);
    process.exitCode = 1;
  } else {
    log(true, msg);
  }
}

async function checkViewport(page, width) {
  await page.setViewportSize({ width, height: 900 });
  await page.reload({ waitUntil: "domcontentloaded" });

  // Tagline visible
  const tagline = page.getByText(/From ashes to assets/i).first();
  const taglineVisible = await tagline.isVisible().catch(() => false);
  assert(taglineVisible, `Tagline visible at ${width}px`);

  // Byline checks
  const byline = page.getByText(/by BLAiZE IT🔥/i).first();
  const bylineVisible = await byline.isVisible().catch(() => false);
  assert(bylineVisible, `Byline visible at ${width}px`);

  if (bylineVisible) {
    const style = await byline.evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        display: s.display,
        visibility: s.visibility,
        opacity: parseFloat(s.opacity || "1"),
        fontSize: parseFloat(s.fontSize || "0"),
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
      };
    });

    assert(style.display !== "none", `Byline not display:none at ${width}px`);
    assert(style.visibility !== "hidden", `Byline not visibility:hidden at ${width}px`);
    assert(style.opacity > 0.01, `Byline opacity > 0 at ${width}px`);
    assert(style.fontSize >= 12, `Byline font-size ≥ 12px at ${width}px`);

    // Check it appears BELOW the wordmark text "Fynix"
    const wordmark = page.getByText(/^Fynix$/).first();
    const wRect = await wordmark.boundingBox();
    const bRect = style.rect;
    if (wRect) {
      assert(bRect.y >= wRect.y, `Byline positioned at or below wordmark at ${width}px`);
    }
  }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  // Basic document title check
  const title = await page.title();
  assert(/Fynix/i.test(title), 'Document <title> contains "Fynix"');

  // Meta image check
  const ogImage = await page.evaluate(() =>
    document.querySelector('meta[property="og:image"]')?.content || ""
  );
  assert(
    /i\.imgur\.com\/VXfQFab\.png/i.test(ogImage),
    'og:image points to https://i.imgur.com/VXfQFab.png'
  );

  // Desktop & mobile passes
  await checkViewport(page, 1440);
  await checkViewport(page, 320);

  await browser.close();

  if (process.exitCode && process.exitCode !== 0) {
    throw new Error("Branding verification failed. See ❌ above.");
  } else {
    console.log("\nAll branding checks passed.");
  }
})();
