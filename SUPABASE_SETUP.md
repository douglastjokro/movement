# Supabase setup (one-time, ~5 minutes)

The app now uses [Supabase](https://supabase.com) for auth + storage instead of
Google Drive. You need to spin up a free Supabase project, run a small SQL
script, and add two env vars to Vercel. Then sign in and use **Import JSON** to
restore your old workout data.

## 1. Create a Supabase project

1. Go to https://supabase.com and sign in.
2. Click **New Project**. Give it any name (e.g. `movement`). Region: pick the
   one closest to you. Set a database password (save it somewhere — you
   won't need it for this app but Supabase requires it).
3. Wait ~1 minute for the project to provision.

## 2. Run the schema

1. In your new project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/schema.sql` from this repo, copy the whole contents, paste
   into the editor, click **Run**. You should see "Success. No rows returned."

## 3. Enable Google sign-in

1. Sidebar → **Authentication** → **Providers** → find **Google**.
2. Toggle it on. You can use Supabase's built-in OAuth (no setup) for local
   testing, or provide your own Google OAuth client ID/secret if you want a
   branded flow. The simple default is fine for personal use.
3. Save.

## 4. Add Site URL to auth settings

1. Sidebar → **Authentication** → **URL Configuration**.
2. **Site URL**: your deployed Vercel URL (e.g. `https://movement.vercel.app`).
   For local dev you can temporarily set `http://localhost:5173`.
3. **Redirect URLs**: add both the production URL and `http://localhost:5173`
   on separate lines.
4. Save.

## 5. Get your project URL and anon key

1. Sidebar → **Project Settings** → **API**.
2. Copy **Project URL** (starts with `https://`).
3. Copy **anon public** key (very long string). This is safe to expose on the
   frontend — row-level security protects the data.

## 6. Set env vars on Vercel

1. Open your Vercel project → **Settings** → **Environment Variables**.
2. Add:
   - `VITE_SUPABASE_URL` = the Project URL from step 5
   - `VITE_SUPABASE_ANON_KEY` = the anon public key from step 5
3. Redeploy (Deployments tab → three dots on latest → Redeploy).

## 7. Sign in and import your old data

1. Open your deployed site. Click **Sign In with Google**.
2. After you sign in, you'll see an **Import JSON** button next to Sign Out.
3. Click it, pick your old `movement-workout-data.json` file (the one from
   Drive), confirm the import. Your exercises, programs, and workout history
   all load at once.
4. The app auto-saves to Supabase 2 seconds after any change. You can now
   sign in from any browser or device and your data will be there.

## Local development

```bash
cp .env.example .env
# edit .env and paste your Supabase URL + anon key
npm install
npm run dev
```
