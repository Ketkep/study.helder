# Setup guide

Step-by-step instructions for the things the owner does by hand. Written for Windows and PowerShell. Nothing here needs to be done more than once.

Order: **1. Supabase → 2. Vercel → 3. Supabase URL settings → 4. Test.**

---

## 1. Create the Supabase project (free)

1. Go to <https://supabase.com> and sign in (or sign up) with your GitHub account.
2. Click **New project**.
   - **Organization:** your personal organization (create one if asked, plan **Free**).
   - **Project name:** `study-helderlabs`
   - **Database password:** click **Generate a password** and save it in your password manager. You won't need it day to day.
   - **Region:** **Central EU (Frankfurt)**. This keeps data in the EU.
   - Click **Create new project** and wait about two minutes.
3. Copy the two values the app needs (keep this tab open, you need them in step 2):
   - Left menu **Project Settings** (gear icon) → **Data API**: copy the **Project URL** (looks like `https://abcdefgh.supabase.co`).
   - **Project Settings** → **API Keys**: copy the **Publishable key** (starts with `sb_publishable_`). **Do not** copy the secret key; the app doesn't need it yet.
4. Create the small keep-alive function:
   - Left menu **SQL Editor** → **New query**.
   - Open `supabase/migrations/20260930120000_health_check.sql` in the GitHub repository, copy all of it, paste it into the editor and click **Run**. You should see "Success. No rows returned".
5. Auth settings (left menu **Authentication**):
   - **Sign In / Providers** → **Email**: make sure **Confirm email** is on, and set **Minimum password length** to `8`. Click **Save**.
   - **Emails** → **Templates**: **skip this, change nothing.** On the free plan Supabase only lets you edit templates once you set up your own email sender (SMTP). The app works with Supabase's default emails: they are in English and say "Confirm your email address" / "Reset your password". Study's own Dutch/English emails get switched on together with Resend, before other people sign up.

> While only you test, Supabase's built-in email sends at most **2 emails per hour**, and only to members of your Supabase team (that's you). If an email doesn't arrive, wait a bit before trying again. Before anyone else signs up, we'll set up Resend (see `docs/PROGRESS.md`).

## 2. Connect the GitHub repository to Vercel (free Hobby plan)

1. Go to <https://vercel.com> and sign in with **Continue with GitHub**. Choose the **Hobby** plan if asked.
2. Click **Add New…** → **Project**.
3. Find `study.helder` in the list and click **Import**. If it isn't listed, click **Adjust GitHub App Permissions** and give Vercel access to that repository.
4. On the configure screen:
   - **Framework Preset:** Next.js (detected automatically).
   - Open **Environment Variables** and add these three:

     | Name                                   | Value                             |
     | -------------------------------------- | --------------------------------- |
     | `NEXT_PUBLIC_SUPABASE_URL`             | the Project URL from step 1.3     |
     | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | the publishable key from step 1.3 |
     | `CRON_SECRET`                          | a random string, see below        |

     To make a random string, open **PowerShell** and run:

     ```powershell
     -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 40 | ForEach-Object { [char]$_ })
     ```

     Copy the output as the value of `CRON_SECRET`.

   - Leave `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` out for now.
5. Click **Deploy**.
6. **Where to find the app.** The repository has no `main` branch yet, so Vercel uses the working branch `claude/study-helderlabs-setup-qplao1` as the **production** branch. Every push Claude makes to it deploys automatically.
   - Open the project → **Overview**. Once a deployment is ready, the **Production Deployment** box shows a screenshot and a **Visit** button. That address (it ends in `.vercel.app`) is the link you review after each phase.
   - You'll find the same address under **Domains** in the left menu.
   - It's reachable for anyone who has the link, but it isn't listed in search engines, and only you can confirm accounts while Supabase's built-in email is used.
7. **Check the environment variables.** Left menu **Environment Variables**: the three variables above must be there, with **All Environments** ticked. If you add or change one later, go to **Deployments**, click **⋯** next to the newest deployment → **Redeploy**, because variables only apply to new deployments.

## 3. Tell Supabase which web addresses may receive login links

Email links only work for addresses on Supabase's allow list.

1. Supabase → **Authentication** → **URL Configuration**.
2. **Site URL:** your production address from step 2.6, e.g. `https://study-helder.vercel.app` (copy it exactly from Vercel's **Domains** page, starting with `https://`). We change this to `https://study.helderlabs.com` at launch.
3. **Redirect URLs** → **Add URL**, add these three:
   - your production address followed by `/**`, e.g. `https://study-helder.vercel.app/**`
   - `https://*-casreumerman305-1026s-projects.vercel.app/**` (covers Vercel's other addresses for your project)
   - `http://localhost:3000/**`
4. Click **Save**.

## 4. Test it

On your production address from step 2.6:

1. Click **Begin met leren**, create an account with **your own email address** (the one you used for Supabase), tick the age box.
2. Open the email ("Confirm your email address") **in the same browser** and click **Confirm email address**. You should land on your dashboard. (If you open it in another browser or on your phone, your account still gets confirmed; you'll see a green message and just log in.)
3. Try **Uitloggen**, log in again, change the language in **Instellingen**, and try **Wachtwoord vergeten?**.
4. The design system page is at `/nl/styleguide`. It disappears once Study launches on `study.helderlabs.com`.

If something doesn't work, tell me what you did and what you saw (a screenshot helps).

---

## Later (not needed now)

- **CAPTCHA (before launch):** create a free Cloudflare account → **Turnstile** → add a widget for your domain. Put the **site key** in Vercel as `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and the **secret key** in Supabase → **Authentication** → **Attack Protection** → **Enable CAPTCHA protection** (provider Turnstile). I'll give exact steps when we get there.
- **Resend (before other people sign up):** custom email sender on `helderlabs.com`.
- **Domain (Phase 8):** connecting `study.helderlabs.com`.

## Running it on your own PC (optional)

Only if you ever want to. Needs Node.js 22 (<https://nodejs.org>, LTS installer) and Docker Desktop (for the local database).

```powershell
git clone https://github.com/Ketkep/study.helder.git
cd study.helder
npm install
npx supabase start
# Copy the "API URL" and "Publishable key" it prints into a new file .env.local (see .env.example)
npm run dev
```

Then open <http://localhost:3000>. Emails sent locally show up at <http://127.0.0.1:54324>.
