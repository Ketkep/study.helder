# Decisions log

Every product or technical decision, newest at the bottom. The decisions in `docs/SPEC.md` section 1 are settled and are not repeated here.

Format: date, decision, reason, alternatives rejected. "Owner" says who decided: **user** (answered a question) or **claude** (small implementation detail, allowed by SPEC 0.3).

---

## 2026-09-30: Start from an empty repository

- **Owner:** claude (observation)
- **Decision:** The repository had no commits, files or branches. The project starts from scratch; nothing needs to be migrated or removed.
- **Reason:** Found during repo inspection (SPEC 0.5).

## 2026-09-30: Test on free plans only for now

- **Owner:** user
- **Decision:** While only the owner is testing, everything runs on free plans (Supabase Free, Vercel Hobby, free tiers of any other service).
- **Reason:** Only one person is testing, so paid plans are not needed yet.
- **Consequences:** The Anthropic API has no free plan and is billed separately from a Claude.ai subscription, so AI features run in mock mode (`USE_MOCK_AI=true`) until a key with credit is added (Phase 3). Supabase Free pauses after 7 days of low activity and the built-in auth email only reaches project team members (2 emails per hour).

## 2026-09-30: npm as package manager

- **Owner:** claude
- **Decision:** Use npm.
- **Reason:** It ships with Node.js, so the owner does not need to install anything extra on Windows. Vercel supports it out of the box.
- **Rejected:** pnpm (faster and stricter, but one more tool to install and explain on Windows); yarn and bun (no real benefit here).

## 2026-09-30: Vitest for unit tests, Playwright for end-to-end tests

- **Owner:** claude
- **Decision:** Vitest for unit and RLS tests, Playwright for end-to-end tests (desktop and phone viewports).
- **Reason:** Both are standard with Next.js and TypeScript, fast, and Playwright's Chromium is already installed in the build environment.
- **Rejected:** Jest (slower, more config with ESM and TypeScript); Cypress (heavier, weaker multi-viewport story).

## 2026-09-30: Fonts are self-hosted

- **Owner:** claude
- **Decision:** Load fonts with `next/font`, which downloads them at build time and serves them from our own domain.
- **Reason:** No requests from students' browsers to Google or other font CDNs (privacy, GDPR, no third-party tracking), and faster loading.
- **Rejected:** Linking Google Fonts directly from the page.

## 2026-09-30: Phase 1 answers from the owner

All answered in one message. Each item is the owner's choice (Owner: user).

### Review the work on Vercel preview links

- **Decision:** After each phase the owner reviews on a Vercel preview deployment of the working branch.
- **Reason:** No local setup needed on Windows.
- **Rejected:** Running the app locally on Windows (needs Node.js, commands, and more explaining).

### One Supabase cloud project for testing, local Supabase for automated tests

- **Decision:** One free Supabase cloud project in Frankfurt (EU) for the owner's testing. Automated tests run against a local Supabase (Docker) in Claude's environment. A separate production project gets created before real users arrive.
- **Reason:** Free plan allows two projects; one is enough while only the owner tests.
- **Rejected:** Separate dev and prod cloud projects now (no benefit yet).

### Supabase built-in email for now, Resend later

- **Decision:** Auth emails (confirmation, password reset) use Supabase's built-in email while only the owner tests. Resend (custom SMTP on helderlabs.com) gets set up before anyone else signs up.
- **Reason:** The built-in email only reaches members of the Supabase team and sends 2 emails per hour, which is enough for one tester.
- **Rejected:** Setting up Resend now (needs DNS changes, not needed yet).

### CAPTCHA with Cloudflare Turnstile, off until launch

- **Decision:** Build Cloudflare Turnstile into sign-up, login and password reset. It turns on only when its keys are configured, and stays off while only the owner tests.
- **Reason:** Free, privacy-friendly, no tracking cookies. Adds friction without benefit while there is one user.
- **Rejected:** hCaptcha (more friction for users); no CAPTCHA at all (spam sign-ups after launch).

### Age confirmation is a checkbox

- **Decision:** Sign-up has a required checkbox "I am 16 or older". Only the fact and the time it was ticked are stored.
- **Reason:** Data minimisation: no date of birth to store and protect.
- **Rejected:** Asking for date of birth.

### Locale in the URL, Dutch as default

- **Decision:** All pages live under `/nl/...` or `/en/...`. Visitors to `/` get their browser language, with Dutch as fallback. Logged-in users' language is saved to their account.
- **Reason:** Both language versions of the landing page can be indexed by search engines. Dutch is the main audience.
- **Rejected:** Cookie-only locale (only one language gets indexed); English as default.

### Light mode only in v1

- **Decision:** v1 ships light mode only. All colors are design tokens, so dark mode can be added later.
- **Reason:** Smaller scope.
- **Rejected:** Light and dark from the start.

### Keep the Supabase project awake with a daily cron

- **Decision:** A daily Vercel cron job calls `/api/cron/keep-alive`, which runs one tiny database query.
- **Reason:** Supabase Free pauses after 7 days of low activity. Vercel Hobby allows daily cron jobs for free. Not officially guaranteed by Supabase; if it ever stops working, the project can be resumed from the dashboard.
- **Rejected:** Manually resuming a paused project; upgrading to Supabase Pro now.

### Legal identity and contact

- **Decision:** Study is the owner's personal project, published under the name HelderLabs. Contact address on Privacy and Terms pages: `info@helderlabs.com`.
- **Note:** GDPR requires the controller's identity. Whether the owner's full name must appear on the Privacy page is part of the legal review before a public launch.

### No logo; text wordmark

- **Decision:** "Study" set in the heading font with a small yellow square, plus "by HelderLabs".

### Design direction approved

- **Decision:** As proposed on the design page: font option A (Atkinson Hyperlegible Next, with Atkinson Hyperlegible Mono for numbers), the navy/paper/yellow color tokens, 4 px spacing grid, 4/6/10 px corner radius, few shadows, yellow reserved for "from your material" and due items.
- **Mastery:** shown in shades of navy with a text label, not red/orange/green.
- **Navigation:** main menu Home, Subjects, Flashcards, Progress (plus Settings in the desktop sidebar; behind the user's initials on a phone). Inside a subject, the nine tabs are grouped into four on phone and desktop: Overview, Learn (session, flashcards, quizzes, summaries), Material (material, topics), Ask.
- **Rejected:** Font options B and C; traffic-light mastery colors; all nine subject tabs flat on desktop.

## 2026-09-30: Phase 1 implementation choices

Small technical choices made while building Phase 1 (Owner: claude, allowed by SPEC 0.3). Each can be revisited.

### Next.js 16 with `proxy.ts`

- **Decision:** Next.js 16.3 (latest). Its request middleware is called `proxy.ts` now; it does three things per request: refreshes the Supabase session, sets a fresh CSP nonce, and routes languages (next-intl).

### Nonce-based Content-Security-Policy

- **Decision:** Every page gets a per-request nonce; scripts only run with it (`'strict-dynamic'`). Pages are therefore rendered per request, not cached as static HTML.
- **Reason:** Strongest practical protection against injected scripts (SPEC 24). The app is mostly personal, signed-in pages, so static caching buys little.
- **Rejected:** A static CSP with `'unsafe-inline'` scripts (weaker).

### Language and age confirmation stored in auth user metadata (temporary)

- **Decision:** Until the `profiles` table exists, the saved language (`locale`) and `age_confirmed_at` are stored in Supabase Auth's user metadata.
- **Reason:** The spec requires schema approval before any table is created (SPEC 21). This avoids creating a schema in Phase 1.
- **Next:** Moves to `profiles` in Phase 2, once the schema is approved.

### Email links use `token_hash`

- **Decision:** Confirmation and reset emails link to `/auth/confirm?token_hash=...`, which verifies the token server-side.
- **Reason:** Works when the email is opened in a different browser or device than the one used to sign up (the default PKCE code flow does not).

### No user enumeration

- **Decision:** Sign-up, resend and forgot-password show the same result whether or not an account exists.

### Changing the password in Settings asks for the current password

- **Reason:** Someone with a moment's access to an unlocked device can't lock the owner out. Resetting via email link does not ask (the email proves ownership).

### Password rules

- **Decision:** At least 8 characters, at most 72 bytes (bcrypt limit), no composition rules.
- **Reason:** Length matters more than character rules (current NIST guidance). Supabase's leaked-password check needs the Pro plan.

### URLs are English in both languages

- **Decision:** `/nl/subjects`, `/en/subjects` (not `/nl/vakken`).
- **Reason:** Simpler, stable links. Page titles and all visible text are translated.

### Small libraries

- **lucide-react** for the few interface icons (navigation, notices). Plain line icons, no sparkles.
- **tailwind-merge** inside `cn()`, so component class overrides behave predictably. (Found through a real bug: a hidden button still showed on phones.)
- **Prettier** with the Tailwind plugin, 120 characters per line.

### Keep-alive query uses a tiny `health_check()` function

- **Decision:** Migration `20260930120000_health_check.sql` adds `public.health_check()` (returns `true`, touches no data). The cron endpoint requires `Authorization: Bearer <CRON_SECRET>`.

### Vercel functions in Frankfurt

- **Decision:** `vercel.json` sets region `fra1`, next to the Supabase project.

### Design system page only outside production

- **Decision:** `/nl/styleguide` shows every component. It returns 404 on the production deployment and is never indexed.

### Local Supabase trimmed

- **Decision:** Local Supabase runs without Studio, Realtime, Analytics, Edge Functions and a few other services (`npm run db:start`). Realtime is disabled in config because Study doesn't use it.

## 2026-10-01: Default Supabase emails on the free plan

- **Owner:** claude (forced by a Supabase plan limit the owner ran into)
- **Finding:** Supabase's free plan no longer allows editing email templates unless a custom email sender (SMTP) is configured.
- **Decision:** Use Supabase's default (English) confirmation and reset emails while only the owner tests. `/auth/confirm` now handles both link formats: the default one (`?code=...`, via Supabase's verify page) and our own templates (`?token_hash=...`). Local Supabase uses the default templates too, so the tests cover the real flow.
- **Consequence:** A default-email link signs you in directly only in the browser where you signed up. Opened elsewhere, the account is still confirmed and the login page says so. Password-reset links must be opened in the same browser.
- **Later:** Study's own Dutch/English templates (already in `supabase/templates`) get switched on together with Resend, before other people sign up.
- **Rejected:** Setting up Resend now (owner chose to do it later); Supabase Pro (paid).

## 2026-10-01: The working branch is Vercel's production branch for now

- **Owner:** claude (follows from how Vercel set up the project; no product impact)
- **Finding:** The repository has no `main` branch, so Vercel made `claude/study-helderlabs-setup-qplao1` the production branch.
- **Decision:** Keep it that way while only the owner tests. Every push deploys to the production `.vercel.app` address, which is the review link. Side benefit: Vercel Cron (production only) runs, so the Supabase keep-alive works.
- **Safeguard:** Nothing is indexed and `/styleguide` stays available until Study is live on its real domain (`isPubliclyLaunched()`: production deployment and `NEXT_PUBLIC_SITE_URL` set). Pages carry `noindex` and `robots.txt` disallows everything until then.
- **Later:** When we create `main` (the owner's call), switch Vercel's production branch to it and set `NEXT_PUBLIC_SITE_URL` at launch.

## 2026-10-01: Setup self-check at /api/health

- **Owner:** claude
- **Decision:** `/api/health` checks the Supabase URL and key (shape, and whether Supabase accepts them), the keep-alive function and `CRON_SECRET`, and returns plain-language advice. It never shows a key (only its type) and returns 404 once Study is publicly launched.
- **Reason:** The owner's first sign-up failed with a configuration error; diagnosing it through Vercel's logs is hard for a non-developer. Everything it reveals (the Supabase host) is already public in the browser bundle.
