# Progress

## Current phase

**Phase 1: Foundation.** Started 2026-09-30. Waiting for answers to the Phase 1 questions and approval of the design direction before scaffolding.

## Phase overview

| Phase | Name | Status |
|---|---|---|
| 1 | Foundation | In progress |
| 2 | Subjects and material | Not started |
| 3 | AI foundation | Not started |
| 4 | Flashcards and quizzes | Not started |
| 5 | Learning and progress | Not started |
| 6 | Ask Study and external info | Not started |
| 7 | Continuity | Not started |
| 8 | Polish and launch readiness | Not started |

## Phase 1 checklist

- [x] Repo inspection (empty repository, no existing code)
- [x] `docs/SPEC.md`, `docs/DECISIONS.md`, `docs/PROGRESS.md`, `CLAUDE.md`
- [ ] Phase 1 questions answered (see "Open questions")
- [ ] Design direction approved
- [ ] Project setup (Next.js, TypeScript strict, Tailwind, ESLint, Prettier)
- [ ] Test setup (Vitest, Playwright, em dash check on translation files)
- [ ] i18n (EN + NL)
- [ ] Supabase local setup (for development and tests)
- [ ] Supabase cloud project (owner creates it, EU region)
- [ ] Auth: sign up with email confirmation and age confirmation, log in, log out, password reset, protected routes
- [ ] Design system: buttons, inputs, cards, tabs, modals, badges, progress, empty/loading/error states
- [ ] Landing page
- [ ] App shell (navigation, desktop and phone)
- [ ] Privacy and Terms placeholders (EN + NL)
- [ ] Phase checks: types, lint, tests, manual walkthrough
- [ ] Phase report

## Open questions (Phase 1)

Asked 2026-09-30, waiting for answers:

1. How the owner views the work (Vercel preview links vs running locally on Windows)
2. Supabase projects for testing (one cloud project now, local Supabase for automated tests)
3. Auth emails (Supabase built-in email vs a custom email provider)
4. CAPTCHA on sign-up and login
5. Age confirmation (checkbox vs date of birth)
6. Language in URLs and default language
7. Dark mode in v1
8. Supabase Free pausing (keep-alive vs manual restore)
9. Who is named on the Privacy and Terms pages, and which contact email
10. Logo (existing assets vs simple wordmark)
11. Design direction approval (fonts, colors, spacing, key screens, phone navigation)

## Known issues

None yet.

## Before a public launch (not needed while only the owner tests)

- Privacy and Terms pages need a review before a public launch.
- Custom email provider for auth emails (the Supabase built-in email only reaches team members).
- Verify support resources for wellbeing messages (113, De Kindertelefoon: numbers and URLs).
- Decide on Supabase Pro (backups, no pausing) once real users arrive.
