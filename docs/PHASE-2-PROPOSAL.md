# Phase 2 proposal: subjects and material

**Status:** proposal, waiting for the owner's answers. Nothing in here is built yet. Written 2026-10-01 while Phase 1 waits for review.

Phase 2 (SPEC 30): database schema with RLS and RLS tests, subjects (create, rename, archive, delete), adding material (pasted text, .txt, PDF, Word), private file storage, text extraction, chunking, full-text search, and viewing the original material. No AI yet, so no AI costs.

The first part is plain language. The technical details (tables, columns, policies) are in the appendix at the end.

---

## 1. What you'll be able to do after Phase 2

- **Subjects:** create a subject (name, optional description), rename it, archive it (hidden but kept), bring it back, or delete it for good.
- **Add material to a subject:**
  - paste or type text, with a title;
  - upload `.txt`, PDF or Word (`.docx`) files, several at once, up to 20 MB each.
- **See progress while a file is processed:** "Uploading", then "Reading", then "Ready". If something goes wrong: a clear message and a "Try again" button. The original file is kept.
- **Clear messages** for scanned PDFs ("This PDF seems to be a scan. Study can't read scanned pages yet."), password-protected files, empty files, wrong file types, and full subjects.
- **View the original:** pasted text exactly as you typed it; PDF and Word files open or download as the original file. There is also a text view that shows the passages Study read, with page numbers. That text view is what the "from your material" labels will open in later phases.
- **Search inside a subject's material** (used behind the scenes by Ask Study and the AI features later; in Phase 2 you'll see it as a simple search box on the Material tab so it can be tested).

## 2. How it works (and why)

### Uploading

1. You pick files. The browser checks size and type straight away, so you don't wait for an upload that will be refused.
2. Study creates a record for each file and a one-time upload link.
3. The browser uploads the file **straight to Supabase Storage**, into a private folder that only your account can access.
4. Study reads the file on the server, splits the text into passages, and saves them.

Why not upload through Vercel? Vercel only accepts 4.5 MB per request, and files can be up to 20 MB. Uploading straight to Supabase avoids that limit and is faster. Supabase's free plan allows files up to 50 MB.

### Reading the files

- **Text and .txt:** read as-is. Older Dutch files with odd characters (Windows encoding) are handled.
- **PDF:** read page by page with `unpdf`, a PDF reader built for servers like Vercel's. Pages with (almost) no text are treated as scanned.
- **Word:** read with `mammoth`, which keeps headings. That matters: headings become the "chapter > section" path of each passage, which makes search and later citations much better.
- The real file type is checked from the file's contents, not just its name.

### Splitting into passages ("chunks")

The text is cut along natural boundaries: headings first, then paragraphs, never in the middle of a sentence. Each passage is roughly 150 to 300 words and remembers its heading path and page numbers. This is plain code with unit tests, no AI.

### Search

Postgres full-text search with Dutch and English word forms: searching "koopkracht" also finds "koopkrachten", "inflation" finds "inflationary". Each passage's language is detected automatically; headings count more than body text. The search sits behind an interface, so vector search can be added later without touching the rest (SPEC 1).

### Privacy and security

- Every table has Row Level Security: the database itself refuses to show or change anyone else's rows, even if the app had a bug.
- Files live in a private bucket; each account can only reach its own folder.
- No "master key" (service role) is used for any of this; the server acts with your own login.
- **RLS tests with two real test accounts** check that account A can't read, change or delete anything of account B, including by guessing IDs, and that logged-out requests get nothing. These run automatically.

### Deleting

Deleting a subject first deletes its files from storage, then everything in the database (material, passages, and later cards, quizzes and progress). If deleting the files fails, nothing is deleted and you get a message, so nothing is left half-deleted.

### Your originals are never changed

Pasted text and uploaded files can't be edited or overwritten, only renamed or deleted (SPEC 3.1). The database enforces this too. To change pasted text, you add it again and delete the old one.

## 3. Free-plan capacity (for your testing)

Checked 2026-10-01:

| Limit                  | Free plan          | What it means while you test                                                          |
| ---------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| Supabase database      | 500 MB             | Text passages take little space. Roughly 150 subjects filled to the proposed maximum. |
| Supabase file storage  | 1 GB               | About 50 files of the maximum 20 MB, or hundreds of normal PDFs.                      |
| Supabase max file size | 50 MB              | Our 20 MB limit fits.                                                                 |
| Vercel request size    | 4.5 MB             | Why files go straight to Supabase.                                                    |
| Vercel processing time | 5 minutes per step | Plenty to read a large PDF. The AI analysis in Phase 3 will run in steps.             |

More than enough for testing. Before real users arrive, we'd move to Supabase Pro (8 GB database, 100 GB storage, daily backups); that's already on the launch list.

## 4. Questions for you

Answer like last time ("all recommendations" works).

**Q1. The database design.** The tables are in the appendix. The main points: every piece of data belongs to one account and one subject; originals can't be changed; deleting a subject deletes everything in it. Also: your language setting and the age confirmation move from where they're temporarily stored now into a proper `profiles` table.

- Approve as proposed **(recommended)**, or tell me what to change.

**Q2. How much material per subject?** (all adjustable later)

- **A) Up to 50 items and 1,000,000 characters per subject (about 400 pages of text), and up to 50 subjects per account (recommended).** Enough for a full course; protects the free plan's space.
- B) Higher limits (for example 2,000,000 characters). Fills the free plan faster.

**Q3. PDFs where only some pages are scans** (for example a text PDF with a few photographed pages):

- **A) Use the readable pages and say which pages were skipped (recommended).** You still get most of your material.
- B) Refuse the whole file. Simpler, but frustrating.

**Q4. An exam date on a subject?** Not in the spec, so I'm asking.

- **A) Yes, optional (recommended).** Costs almost nothing now. Later it lets "what should I do next" put an exam that's coming up first, and we can say "Your exam is in 3 days".
- B) No, not in v1.

**Q5. Deleting a subject:**

- **A) A confirmation window that says exactly what will be deleted, with a red "Delete for good" button (recommended).**
- B) Also type the subject's name to confirm. Safer, but more hassle.

**Q6. Tabs inside a subject that aren't built yet** (Learn, Ask):

- **A) Show them with a short "This comes in a later version" (recommended).** You can already judge the structure.
- B) Hide them until they work.

**Q7. How database changes reach your Supabase project.** Every phase adds tables, and pasting SQL by hand gets error-prone.

- **A) Automatic (recommended).** A GitHub Action applies the changes to your Supabase project whenever I push. One-time setup of about 5 minutes: you add two secrets in GitHub (I'll give exact steps). You never paste SQL again.
- B) You paste the SQL in Supabase's SQL Editor each phase, following my steps.

### Things I'll decide myself (logged in DECISIONS.md)

- Up to 10 files per upload at once.
- The same file uploaded twice to one subject: warn and skip the copy.
- Language of each passage is detected automatically (Dutch, English, other).
- Upload links expire after 2 hours; downloads of your originals use links that expire after 10 minutes.

---

## Appendix: technical design

All tables live in the `public` schema, created through migrations in `supabase/migrations`. Every user-owned table has RLS enabled with policies of the form `user_id = (select auth.uid())`. Timestamps are `timestamptz`, ids are `uuid default gen_random_uuid()`. `user_id` columns default to `auth.uid()` and reference `auth.users(id) on delete cascade`, so deleting an account (Phase 7) removes everything.

### Consistency across user and subject

Child rows carry both `user_id` and `subject_id`. That keeps every RLS policy a cheap single-column check and makes citation validation (SPEC 3.3: "belongs to that user and subject") one query. To stop the two from ever disagreeing, child tables use **composite foreign keys**, e.g. `(subject_id, user_id) references subjects (id, user_id)`. A row can't point at another user's subject even if someone forges an id.

### Phase 2 tables

**`profiles`** (one row per account, created by a trigger on sign-up)

| Column                     | Type        | Notes                                         |
| -------------------------- | ----------- | --------------------------------------------- |
| `id`                       | uuid PK     | `references auth.users(id) on delete cascade` |
| `locale`                   | text        | `'nl'` or `'en'`, default `'nl'`              |
| `age_confirmed_at`         | timestamptz | from the sign-up checkbox                     |
| `created_at`, `updated_at` | timestamptz |                                               |

The trigger copies `locale` and `age_confirmed_at` from the sign-up metadata. A backfill creates profiles for accounts that already exist. RLS: a user can read and update only their own row, and can't change `age_confirmed_at`.

**`subjects`**

| Column                     | Type             | Notes                                    |
| -------------------------- | ---------------- | ---------------------------------------- |
| `id`                       | uuid PK          | `unique (id, user_id)` for composite FKs |
| `user_id`                  | uuid             | owner                                    |
| `name`                     | text             | 1 to 120 characters                      |
| `description`              | text null        | up to 500 characters                     |
| `exam_date`                | date null        | only if Q4 = A                           |
| `archived_at`              | timestamptz null | null = active                            |
| `created_at`, `updated_at` | timestamptz      |                                          |

Index: `(user_id, archived_at, updated_at desc)`.

**`study_material`** (one row per pasted text or uploaded file; the original)

| Column                                     | Type        | Notes                                                                |
| ------------------------------------------ | ----------- | -------------------------------------------------------------------- |
| `id`                                       | uuid PK     | `unique (id, user_id)`                                               |
| `user_id`, `subject_id`                    | uuid        | FK `(subject_id, user_id) → subjects(id, user_id) on delete cascade` |
| `title`                                    | text        | 1 to 200 characters, can be renamed                                  |
| `source_type`                              | text        | `paste`, `txt`, `pdf`, `docx`                                        |
| `original_text`                            | text null   | pasted text, exactly as entered                                      |
| `storage_path`                             | text null   | `{user_id}/{subject_id}/{material_id}/original.{ext}`                |
| `file_name`, `mime_type`                   | text null   | as uploaded                                                          |
| `size_bytes`                               | int null    |                                                                      |
| `sha256`                                   | text null   | duplicate detection                                                  |
| `status`                                   | text        | `awaiting_upload`, `processing`, `ready`, `failed`, `scanned`        |
| `error_code`                               | text null   | e.g. `password_protected`, `empty`, `too_large`                      |
| `page_count`, `char_count`                 | int null    |                                                                      |
| `skipped_pages`                            | int[]       | scanned pages that were skipped (Q3 = A)                             |
| `language`                                 | text null   | `nl`, `en`, `mixed`, `unknown`                                       |
| `created_at`, `updated_at`, `processed_at` | timestamptz |                                                                      |

Checks: `paste` requires `original_text`; files require `storage_path`. A trigger rejects any update of `source_type`, `original_text`, `storage_path`, `sha256` after insert (originals are immutable). Indexes: `(subject_id, created_at)`, `(subject_id, sha256)`.

**`material_chunks`** (the passages; written by the server, read by the user)

| Column                                 | Type      | Notes                                                                                   |
| -------------------------------------- | --------- | --------------------------------------------------------------------------------------- |
| `id`                                   | uuid PK   | cited by id in later phases                                                             |
| `user_id`, `subject_id`, `material_id` | uuid      | FK `(material_id, user_id) → study_material(id, user_id) on delete cascade`             |
| `position`                             | int       | order within the material                                                               |
| `heading_path`                         | text[]    | e.g. `{"H2 Koopkracht", "2.3 Reëel inkomen"}`                                           |
| `heading_text`                         | text      | the same headings as one line; Postgres can only index plain text in a generated column |
| `page_start`, `page_end`               | int null  | PDF pages                                                                               |
| `content`                              | text      | the passage text                                                                        |
| `char_count`                           | int       |                                                                                         |
| `text_config`                          | regconfig | `dutch`, `english` or `simple`                                                          |
| `search`                               | tsvector  | generated: headings weight A, content weight B                                          |

Indexes: GIN on `search`, `(material_id, position)`, `(subject_id)`. RLS: select for the owner; insert and delete for the owner (the server writes with the user's own session); no update.

Verified on local Postgres 17 (2026-10-01): the generated `search` column with a per-row `regconfig` works, Dutch stemming matches "koopkracht" to "koopkrachten" with headings ranked higher, and the composite foreign key rejects a row whose `user_id` doesn't own the subject.

**Search function:** `search_material(p_subject_id uuid, p_query text, p_limit int default 8)`, `security invoker` so RLS applies. Builds `websearch_to_tsquery` in Dutch, English and simple, ranks with `ts_rank_cd`, returns chunk id, material id, heading path, pages and a highlighted snippet.

**Storage:** private bucket `material`, file size limit 20 MB, allowed types `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`. Policies on `storage.objects` for this bucket: select, insert and delete only when the first folder of the path equals `auth.uid()`. No update policy, so originals can't be overwritten.

**Keep-alive:** `health_check()` from Phase 1 stays.

### Later phases (sketch, detailed and approved in their own phase)

Same pattern everywhere: `user_id` + `subject_id`, composite FKs, RLS, cascade deletes.

| Table               | Phase | Holds                                                                                        |
| ------------------- | ----- | -------------------------------------------------------------------------------------------- |
| `topics`            | 3     | topics and subtopics per subject, renamable and mergeable, with the chunk ids they came from |
| `summaries`         | 3     | saved summaries per type, with cited chunk ids                                               |
| `ai_usage`          | 3     | every AI call: feature, model, tokens, cost estimate, success; powers limits                 |
| `flashcards`        | 4     | cards (generated or manual), scheduling state, cited chunk ids                               |
| `flashcard_reviews` | 4     | review history (grade, time)                                                                 |
| `quiz_questions`    | 4     | saved questions with answers and cited chunk ids                                             |
| `quiz_attempts`     | 4     | answers, correctness, feedback                                                               |
| `learning_sessions` | 5     | resumable session state (saved after every step)                                             |
| `topic_progress`    | 5     | mastery per topic                                                                            |
| `ask_messages`      | 6     | Ask Study conversation per subject, with source labels                                       |

Phase 3 may need one extra table for the extracted definitions, key facts and exam questions (or they live inside `topics`). That gets decided and explained in Phase 3.

### Processing flow (Phase 2)

1. `createMaterial` (server action): validates title, type and size, checks the subject's limits, inserts `study_material` with status `awaiting_upload`, returns a signed upload URL (`createSignedUploadUrl`, 2 hours).
2. The browser uploads to Storage with that URL and shows progress.
3. `processMaterial` (server action): downloads the file with the user's session, checks the real type (magic bytes) and the SHA-256, extracts, chunks, detects language, inserts chunks, sets status `ready` (or `failed` / `scanned` with an `error_code`). It can be retried; a retry first deletes any chunks from a failed attempt.
4. Pasted text skips steps 2 and 3's download: it is chunked straight away.

### Tests in Phase 2

- Unit: chunking (headings, paragraphs, sentence boundaries, page numbers), language detection, file-type sniffing, scanned-page detection, limit checks.
- RLS: two real users on local Supabase, every table and the storage bucket; manipulated ids; anonymous access.
- End-to-end (desktop and phone): create, rename, archive and delete subjects; paste text; upload txt, PDF and Word; a scanned PDF; an empty file; a too-large file; view the original; search.
