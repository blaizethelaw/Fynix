# Fynix — From ashes to assets

**Purpose:** This is a complete, self‑contained instruction set for an AI code assistant (Codex) to 1) deeply analyze the entire repo and attachments, 2) synthesize the best parts into one production‑grade app, and 3) rebrand everything to **Fynix** with **“From ashes to assets”** and an always‑visible **“by BLAiZE IT🔥”** byline under the wordmark (Visible‑by‑Verizon style).

---

## Inputs You Must Ingest (in this order)
1. **GitHub repo:** `https://github.com/blaizethelaw/Fynix`
2. **Attached ZIP:** a copy of the repo (e.g., `Fynix-main.zip`). Unpack and analyze exactly as if it were the repo.
3. **In‑repo documentation:**
   - Prefer: `docs/fynix_skeleton_readme_ready_to_paste.md`
   - Also read: any file named like `Create an overall summary*.md`, `Fynix*.md`, or `Fynix.docx` (convert `.docx` to text in memory).
   - If duplicates conflict, treat the most recently edited file as canonical.

> You must parse **every** Markdown and text file for requirements/instructions and factor them into the plan.

---

## Non‑Negotiable Branding
- **App name:** `Fynix`
- **Tagline:** `From ashes to assets`
- **Logo image (use everywhere):** `https://i.imgur.com/VXfQFab.png`
- **Byline:** `by BLAiZE IT🔥` displayed **directly beneath** the Fynix wordmark on **all screen sizes**, including mobile. Do **not** hide, collapse, or visually diminish it with media queries. Emulate the **“Visible\nby Verizon”** treatment.
- Update `<title>`, manifest, favicons, Open Graph/Twitter meta, and app splash/logo assets accordingly.

### BrandMark component spec (authoritative)
- Structure (semantics):
  - Container: `role="img"` not needed; use an `<img>` with informative `alt`.
  - Left: Phoenix logo (`src` = URL above, `alt="Fynix phoenix logo"`).
  - Right: Two stacked lines: **Fynix** (bold) on top, **by BLAiZE IT🔥** below (smaller), fixed line‑height.
- Accessibility:
  - Minimum byline font size ≥ 12px; ensure 4.5:1 contrast on both light/dark themes.
  - Never set `aria-hidden="true"` on the byline; never hide via `display:none`, `visibility:hidden`, 0 height, or `opacity:0` at any breakpoint.

---

## Analysis Scope (Granular, Every File)
1. **Inventory:** Recursively list all files with type and size; include hidden/config files. Export to `docs/analysis/file-inventory.json`.
2. **Classify:** For each source file (HTML/JS/TS/TSX/CSS/JSON/etc.), detect purpose (UI, state, utils, data, config, build). Note libraries used (e.g., Chart.js, Recharts, p5.js), frameworks (React, CDN React, vanilla), and patterns.
3. **Feature Matrix:** Build `docs/analysis/feature-matrix.csv` with features as rows and each variant/page as columns. Score each (0–5) on: correctness, UX, performance, accessibility, testability, and maintainability. Add short notes and source file paths.
4. **Dead/Duplicate Code:** Detect redundancy and similar files across variants; mark winners/keepers.
5. **Content Audit:** Extract all text content/education/FAQs from Markdown/HTML. Produce `docs/analysis/content-audit.md` with a proposed IA (information architecture).

---

## Target Architecture (Ship This)
- **Framework:** React + TypeScript.
  - Preferred base: **Vite** (lightweight) *or* **Next.js App Router** (if SSR/SEO is required). Choose one; write an ADR stating why.
- **Styling:** Tailwind CSS with a small token layer; optional component lib: **shadcn/ui**; icons: **lucide-react**.
- **State:** Local component state + **Zustand** (or Context where trivial).
- **Server/async data:** **TanStack Query** for caching/fetching.
- **Forms:** **React Hook Form** + **Zod** for schema validation.
- **Charts:** Choose **Recharts** or **Chart.js** (one only). Provide a `<ChartContainer>` wrapper component.
- **Testing:** Vitest + React Testing Library; E2E: Playwright.
- **Quality:** ESLint, Prettier, TypeScript `strict`.
- **Build/Deploy:** Vite build, static hosting or Node adapter; GitHub Actions CI.
- **PWA (optional):** Workbox; add manifest + icon set derived from the phoenix image.

Create `docs/adr/` with explicit decisions.

---

## Unification & Refactor Plan
1. **Pick the best pieces:** For each feature present in any variant (calculators, dashboards, charts, onboarding, etc.), either select the best implementation or synthesize a better one. Record the source files used in `docs/analysis/selection-rationale.md`.
2. **Design system:** Extract primitives (Button, Card, Input, Select, Modal/Sheet, Tabs, Tooltip, Toast, ChartContainer). Add light/dark themes and tokens for spacing, radius, shadows, colors.
3. **Routing and pages:** Consolidate into `Home`, `Dashboard`, `Tools` (calculators), and `Docs` (learn/guides) routes. Ensure deep links work.
4. **Accessibility:** Keyboard navigation first; visible focus; semantic landmarks; aria labels; reduced‑motion fallbacks; color contrast ≥ WCAG AA.
5. **Performance:** Lighthouse ≥ 90 on mobile/desktop. Preload critical font(s); lazy‑load noncritical routes/chunks; compress images.
6. **Content:** Migrate educational/marketing copy into MDX/JSON. Add a TOC, summaries, and internal linking.

---

## Concrete Work Items for Codex (Do This Exactly)
1. **Discovery**
   - Unpack ZIP; crawl the repo; produce `file-inventory.json`.
   - Generate `feature-matrix.csv` and `content-audit.md`.
2. **Branding**
   - Replace all names/strings with **Fynix** and the tagline.
   - Install the **BrandMark** component in the header, auth/onboarding, and any splash/empty states.
   - Update meta: `<title>`, `<meta name="description">`, Open Graph/Twitter with `https://i.imgur.com/VXfQFab.png`.
   - Add favicons/manifest derived from the phoenix image.
3. **Scaffold**
   - Create a fresh project under `/app` using the chosen framework.
   - Add Tailwind, tokens, and a UI primitives folder.
   - Implement `Header` with **BrandMark**; place the byline under the wordmark (always visible).
   - Create `Home` and `Dashboard` pages with placeholder sections and copy hooks for calculators.
4. **Port Features**
   - Migrate the best calculators, charts, and utilities into typed modules with tests.
   - Standardize on one charting library.
   - Remove old CDN React/inline script variants; convert into components.
5. **Docs**
   - Write `README.md` (setup, scripts, stack, branding rules).
   - Write ADRs and `selection-rationale.md`.
6. **Quality & CI**
   - Add ESLint, Prettier, Vitest, Playwright.
   - GitHub Actions: lint, typecheck, unit, E2E, Lighthouse CI (or build + upload for manual check).

---

## Verification & Guardrails (Automated)
Create a script `scripts/verify-branding.mjs` that fails CI if any of these are false:
- `BrandMark` renders stacked **Fynix** and **by BLAiZE IT🔥**; byline is present in the DOM and not hidden at any viewport width (check computed styles for `display`, `visibility`, `opacity`, `font-size`).
- `index.html` or document head includes OG/Twitter tags with the phoenix URL.
- At least one prominent surface (Home hero or header) contains the tagline **“From ashes to assets.”**

Also add a content check:
- Search the codebase for strings like `display:none` or `@media (max-` rules targeting the byline class; fail if found.

---

## Deliverables
- `/app` — consolidated, production‑ready app.
- `/docs/analysis/file-inventory.json` — every file.
- `/docs/analysis/feature-matrix.csv` — comparison grid.
- `/docs/analysis/selection-rationale.md` — why each part was chosen.
- `/docs/adr/*` — architecture decisions.
- `/docs/content-audit.md` — information architecture and content plan.
- `/docs/release/` — CHANGELOG, Lighthouse, and a11y reports.
- `/scripts/verify-branding.mjs` — CI branding tests.

---

## Implementation Hints
- When consolidating multiple near‑identical modules, extract pure utilities and write unit tests before refactor.
- Prefer composition over inheritance; expose props for variants.
- Keep tokens central; avoid hard‑coded colors/sizes; ensure dark‑mode parity.

---

## Acceptance Criteria (Definition of Done)
1. The byline **“by BLAiZE IT🔥”** is visible and legible under the Fynix wordmark at 320px width and above.
2. The phoenix image is used in the header, favicon, PWA icons, and OG/Twitter meta.
3. Lighthouse mobile and desktop scores ≥ 90 (Perf, A11y, Best Practices, SEO).
4. All chosen features compile and function with TypeScript `strict` enabled.
5. `feature-matrix.csv`, `selection-rationale.md`, and ADRs exist and are coherent.
6. CI passes (lint, typecheck, unit, e2e, verify-branding).

---

## Optional Stretch Goals
- Add PWA install prompt and offline caching.
- Add guided onboarding with checklist and progress.
- Add a pricing/plan UI and gated features (stub only).
- Add basic telemetry (privacy‑respecting) and a settings panel to opt out.

---

## Example BrandMark (React + Tailwind)
```tsx
export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="https://i.imgur.com/VXfQFab.png"
        alt="Fynix phoenix logo"
        className="h-10 w-10 rounded-lg"
        loading="eager"
        decoding="async"
      />
      <div className="leading-none">
        <div className="font-extrabold text-2xl tracking-wide">Fynix</div>
        <div className="text-xs opacity-80">by BLAiZE IT🔥</div>
      </div>
    </div>
  );
}
```

## Example Visible‑style byline in plain HTML
```html
<a class="brand" href="/">
  <img class="brand__logo" src="https://i.imgur.com/VXfQFab.png" alt="Fynix phoenix logo" />
  <span class="brand__text">
    <strong class="brand__name">Fynix</strong>
    <small class="brand__byline">by BLAiZE IT🔥</small>
  </span>
</a>
```
```css
.brand{display:inline-flex;align-items:center;gap:.75rem}
.brand__logo{width:40px;height:40px;border-radius:.5rem}
.brand__text{display:flex;flex-direction:column;line-height:1}
.brand__name{font-weight:800;font-size:1.25rem}
.brand__byline{font-size:.75rem;opacity:.85}
/* Never hide the byline on mobile. No media queries that toggle visibility. */
```

---

### Final Note to Codex
If the repo contains multiple “versions of the same thing,” **do not** keep all of them. Preserve the **single best** implementation per feature, documented via selection rationale, and delete the rest. The outcome is **one** cohesive, modern, branded app: **Fynix — From ashes to assets**.

