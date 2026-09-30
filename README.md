# Study by HelderLabs

Learn from your own material. Study turns notes and chapters into summaries, flashcards, quizzes and study sessions, in Dutch and English.

- Product spec: [`docs/SPEC.md`](docs/SPEC.md)
- Decisions: [`docs/DECISIONS.md`](docs/DECISIONS.md)
- Progress: [`docs/PROGRESS.md`](docs/PROGRESS.md)
- Setup (Supabase, Vercel): [`docs/SETUP.md`](docs/SETUP.md)

## Development

Requires Node.js 22 and Docker (for the local Supabase).

```bash
npm install
npm run db:start          # local Supabase; copy the printed URL and publishable key into .env.local
npm run dev               # http://localhost:3000
```

| Command                                 | What it does                                               |
| --------------------------------------- | ---------------------------------------------------------- |
| `npm run check`                         | lint, types, unit tests                                    |
| `npm run test:e2e`                      | end-to-end tests (desktop + phone), needs `db:start`       |
| `npm run build && npm run check:bundle` | production build, then scan the browser bundle for secrets |
| `npm run format`                        | format with Prettier                                       |

Local emails (sign-up confirmation, password reset) appear in Mailpit at http://127.0.0.1:54324.
