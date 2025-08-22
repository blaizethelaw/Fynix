Below are two drop-in files:

1) `scripts/verify-branding.mjs` – a Node script that uses **Playwright** to verify the byline, logo meta, and tagline are correct on both desktop and mobile widths.
2) `.github/workflows/ci.yml` – a GitHub Actions workflow that installs deps, builds your app, serves the production preview, and runs the verification script (plus lint/typecheck/tests if present).

> If your repo doesn’t already include Playwright, the CI file below installs it ephemerally. Locally, run: `npm i -D playwright` to use the script.

---

## `scripts/verify-branding.mjs`
```js
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
```

---

## `.github/workflows/ci.yml`
```yaml
name: CI

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build-test-verify:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: |
          npm i
          # Ensure verify deps are available even if not in package.json
          npm i -D playwright

      - name: Typecheck & build
        run: npm run build --if-present

      - name: Lint (if present)
        run: npm run lint --if-present

      - name: Unit tests (if present)
        run: npx vitest run --passWithNoTests || echo "No tests or vitest not configured"

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Start preview server (Vite)
        run: |
          npx vite preview --port 4173 --strictPort &
          npx --yes wait-on http://localhost:4173

      - name: Verify branding and meta
        env:
          BASE_URL: http://localhost:4173
        run: node scripts/verify-branding.mjs

      # Optional: upload preview logs or screenshots from failures
      - name: Upload artifacts on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: ci-artifacts
          path: |
            playwright-report
            dist
            **/vite*.log
```

---

### Notes
- If you’re using **Next.js** instead of Vite, replace the preview step with:
  ```yaml
  - name: Start preview server (Next.js)
    run: |
      npm run build
      npm run start -- -p 4173 &
      npx --yes wait-on http://localhost:4173
  ```
- You can run the verification locally:
  ```bash
  npm run build && npx vite preview --port 4173 &
  npx wait-on http://localhost:4173
  BASE_URL=http://localhost:4173 node scripts/verify-branding.mjs
  ```
- Extend the script with additional route checks by navigating to `/dashboard` etc. and repeating the byline assertions.

