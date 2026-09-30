# Decisions log

Every product or technical decision, newest at the bottom. The decisions in `docs/SPEC.md` section 1 are settled and are not repeated here.

Format: date, decision, reason, alternatives rejected. "Owner" says who decided: **user** (answered a question) or **claude** (small implementation detail, allowed by SPEC 0.3).

---

## 2026-09-30: Start from an empty repository

* **Owner:** claude (observation)
* **Decision:** The repository had no commits, files or branches. The project starts from scratch; nothing needs to be migrated or removed.
* **Reason:** Found during repo inspection (SPEC 0.5).

## 2026-09-30: Test on free plans only for now

* **Owner:** user
* **Decision:** While only the owner is testing, everything runs on free plans (Supabase Free, Vercel Hobby, free tiers of any other service).
* **Reason:** Only one person is testing, so paid plans are not needed yet.
* **Consequences:** The Anthropic API has no free plan and is billed separately from a Claude.ai subscription, so AI features run in mock mode (`USE_MOCK_AI=true`) until a key with credit is added (Phase 3). Supabase Free pauses after 7 days of low activity and the built-in auth email only reaches project team members (2 emails per hour).

## 2026-09-30: npm as package manager

* **Owner:** claude
* **Decision:** Use npm.
* **Reason:** It ships with Node.js, so the owner does not need to install anything extra on Windows. Vercel supports it out of the box.
* **Rejected:** pnpm (faster and stricter, but one more tool to install and explain on Windows); yarn and bun (no real benefit here).

## 2026-09-30: Vitest for unit tests, Playwright for end-to-end tests

* **Owner:** claude
* **Decision:** Vitest for unit and RLS tests, Playwright for end-to-end tests (desktop and phone viewports).
* **Reason:** Both are standard with Next.js and TypeScript, fast, and Playwright's Chromium is already installed in the build environment.
* **Rejected:** Jest (slower, more config with ESM and TypeScript); Cypress (heavier, weaker multi-viewport story).

## 2026-09-30: Fonts are self-hosted

* **Owner:** claude
* **Decision:** Load fonts with `next/font`, which downloads them at build time and serves them from our own domain.
* **Reason:** No requests from students' browsers to Google or other font CDNs (privacy, GDPR, no third-party tracking), and faster loading.
* **Rejected:** Linking Google Fonts directly from the page.
