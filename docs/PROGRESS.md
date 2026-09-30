# Progress

## Current phase

**Phase 1: Foundation.** Built and checked on 2026-09-30. **Waiting for the owner's review and approval** before Phase 2 starts.

## Phase overview

| Phase | Name                        | Status                   |
| ----- | --------------------------- | ------------------------ |
| 1     | Foundation                  | Done, waiting for review |
| 2     | Subjects and material       | Not started              |
| 3     | AI foundation               | Not started              |
| 4     | Flashcards and quizzes      | Not started              |
| 5     | Learning and progress       | Not started              |
| 6     | Ask Study and external info | Not started              |
| 7     | Continuity                  | Not started              |
| 8     | Polish and launch readiness | Not started              |

## Phase 1 checklist

- [x] Repo inspection (empty repository, no existing code)
- [x] `docs/SPEC.md`, `docs/DECISIONS.md`, `docs/PROGRESS.md`, `CLAUDE.md`, `docs/SETUP.md`
- [x] Phase 1 questions answered (see DECISIONS, 2026-09-30)
- [x] Design direction approved
- [x] Project setup: Next.js 16 (App Router), React 19, TypeScript strict, Tailwind 4, ESLint, Prettier
- [x] i18n: next-intl, `/nl` and `/en` in every URL, browser language on `/` with Dutch fallback, typed messages
- [x] Supabase local setup (config, email templates, keep-alive migration)
- [x] Auth: sign up with email confirmation and age checkbox, log in, log out, forgot/reset password, resend confirmation, protected routes, persistent sessions, language saved to the account, change password (asks for the current one)
- [x] CAPTCHA support (Cloudflare Turnstile), off until keys are configured
- [x] Security: nonce-based Content-Security-Policy, security headers, safe redirects after login, no user enumeration on sign-up and password reset, server-side validation with zod
- [x] Design system: buttons, inputs, checkbox, badges, source labels, highlight, progress and mastery bars, tabs, dialog, surface, notices, empty/loading/error states, skeletons (`/nl/styleguide`, until public launch)
- [x] Landing page (hero, how it works, product preview with demo subject, features, final CTA, footer with AI disclosure)
- [x] App shell: desktop sidebar, phone top bar with account menu and bottom navigation; Home, Subjects, Flashcards, Progress, Settings
- [x] Privacy and Terms placeholders (EN + NL, marked as draft)
- [x] 404 and error pages in both languages
- [x] Keep-alive cron endpoint + `vercel.json` (Frankfurt region, daily cron)
- [x] Setup self-check at `/api/health` (plain-language advice, never shows keys, off after public launch)
- [x] Tests: 63 unit tests (Vitest), 37 end-to-end tests on desktop and phone (Playwright, against local Supabase and the production build), client bundle secret scan
- [x] CI workflow (GitHub Actions): lint, types, formatting, unit tests, build, bundle scan, end-to-end
- [ ] Owner: Supabase cloud project, Vercel project, URL settings (see `docs/SETUP.md`)
- [ ] Owner: review on the Vercel preview and approve Phase 1

## What's next (Phase 2: Subjects and material)

Starts after approval. First step: propose the database schema, RLS policies and storage policies for approval (SPEC 21), plus the questions for Phase 2.

## Known issues and limitations

- **CAPTCHA is untested end to end.** Cloudflare is not reachable from the build environment. The widget renders and the security policy allows it; test it when turning it on before launch.
- **The working branch is Vercel's production branch** (no `main` yet), so the review link is the production `.vercel.app` address and the keep-alive cron runs. Pages are not indexed until launch on the real domain.
- **"Create a subject" buttons are disabled** until Phase 2.
- **Language and age confirmation live in the auth user's metadata** until the `profiles` table exists (Phase 2 schema). They move there once the schema is approved.
- **Export my data / delete my account** are Phase 7. Settings says to email info@helderlabs.com until then.
- **Auth emails are Supabase's default English emails** on the free plan (custom templates need a custom email sender). Study's own NL/EN templates are in `supabase/templates` and get switched on with Resend. Default-email links only sign you in directly in the browser where you signed up; in another browser the account is confirmed and you log in.
- **Schema changes on the cloud project are applied by hand** (SQL Editor) for now. Automating `supabase db push` is a Phase 2 question.

## Before a public launch (not needed while only the owner tests)

- **Legal review of the Privacy and Terms pages.** Both are placeholders marked as draft. The privacy statement must list all processors (Supabase, Vercel, AI provider, search provider, email provider, Cloudflare Turnstile) with verified data-use and retention terms, and name the controller.
- Custom email provider (Resend on helderlabs.com) for auth emails: Supabase's built-in email only reaches team members and sends 2 per hour. Then turn on Study's own NL/EN templates (`supabase/templates`, paste them in the dashboard and uncomment them in `supabase/config.toml`).
- Turn on CAPTCHA (Turnstile keys in Vercel and Supabase).
- Set `NEXT_PUBLIC_SITE_URL` and the Supabase Site URL to `https://study.helderlabs.com`.
- Verify support resources for wellbeing messages (113, De Kindertelefoon: numbers and URLs).
- Decide on Supabase Pro (daily backups, no pausing) once real users arrive. Vercel Hobby is non-commercial only.
