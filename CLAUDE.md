# Study by HelderLabs

A learning platform where students bring their own material and Study helps them understand, practice, remember and master it. English and Dutch. Hosted at `study.helderlabs.com`.

## Read these first

- `docs/SPEC.md`: the full product spec and source of truth. Re-read the relevant sections at the start of every phase.
- `docs/DECISIONS.md`: every decision made so far. Add an entry for each answered question or non-trivial choice.
- `docs/PROGRESS.md`: current phase, what is done, what is next, open questions, known issues.
- `docs/SETUP.md`: manual setup steps for the owner (Supabase, Vercel).
- `AGENTS.md`: Next.js 16 differs from older versions; read the bundled docs in `node_modules/next/dist/docs/` before writing Next.js code.

## How we work

- One phase at a time (SPEC section 30). After each phase: run checks, update PROGRESS and DECISIONS, report, then **stop and wait for approval**.
- Ask before anything hard to undo, anything touching safety, privacy, minors or legal copy, and anything the spec doesn't cover that changes what students see. Batch questions at the start of a phase, with options and a recommendation in plain language.
- The owner works on Windows with PowerShell. Manual steps get exact, step-by-step instructions.
- Develop on the branch named for the session; never push elsewhere without permission.

## Conventions

- Next.js App Router, React, TypeScript strict, Tailwind CSS, Supabase (EU), Vercel. Package manager: npm.
- No hard-coded UI strings: all copy lives in the EN and NL translation files. Dutch is natural Dutch with "je/jij".
- No em dashes in product copy (a test enforces this for translation files). No banned marketing phrases, no invented social proof (SPEC 18).
- All AI calls are server-side, behind the provider abstraction in `lib/ai/`. Prompts live in `lib/ai/prompts/`, never inline. Every AI output is validated with a zod schema. Model names come from env vars.
- Deterministic logic (spaced repetition, mastery, weak topics, session flow, recommendations) is plain, unit-tested code, never AI.
- RLS on every user-owned table, tested with two users. Never trust a user ID from the client. The service role key never reaches the browser.
- Schema changes only through Supabase CLI migrations in the repo.
- Design: deep navy, off-white, light neutrals, warm yellow accent used sparingly. No gradients, no glassmorphism, little rounding, few shadows, subtle motion that respects `prefers-reduced-motion`.
- No third-party analytics or trackers. Fonts are self-hosted via `next/font`.
- Class names go through `cn()` (tailwind-merge). Colors, sizes and radii only from the tokens in `app/globals.css`.
- Before pushing: `npm run check`, `npm run build`, and `npm run test:e2e` (needs `npm run db:start`).
- Commit messages: short imperative summary line, body explains why.
