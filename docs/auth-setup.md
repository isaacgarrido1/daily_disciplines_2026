# Supabase authentication

## Environment variables

Set these in **Vercel** (Project → Settings → Environment Variables) and in a local **`.env.local`** (never commit secrets).

The app can **build** on Vercel even if these are missing (no eager `getSupabaseUrl()` at import time). **Runtime** still needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for login, middleware, and `/api/missions`; without them you’ll get redirects, empty auth, or HTTP 503 from missions.

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project URL from Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | `anon` `public` key (safe to expose in the browser) |
| `SUPABASE_URL` | Optional | Server-only mirror of the URL if you prefer not to use `NEXT_PUBLIC_*` on the server |
| `SUPABASE_ANON_KEY` | Optional | Server-only mirror of the anon key |
| `NEXT_PUBLIC_SITE_URL` | Recommended on Vercel | Public site origin without a trailing slash (e.g. `https://your-domain.com`). Sign-up uses this for `emailRedirectTo` so confirmation links match **Authentication → URL configuration**. If unset, the server derives the origin from request headers. |

The app resolves URL/key with **`NEXT_PUBLIC_*` first**, then `SUPABASE_*`. The **browser bundle** only includes `NEXT_PUBLIC_*`, so you must set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the client and middleware.

## Database

1. Open **Supabase → SQL → New query**.
2. Paste and run `supabase/migrations/001_profiles.sql`.
3. Confirm **Authentication → URL configuration** includes your site URL and redirect URLs, e.g.:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`

## How the auth flow works

1. **Middleware** (`middleware.ts`) runs on each matched request. It creates a Supabase server client that reads/writes **HTTP-only cookies** (via `@supabase/ssr`), calls `getUser()` to refresh the session, then:
   - If there is **no user** and the path is **not** public (`/login`, `/signup`, `/auth/*`), it **redirects to `/login`** with `?redirect=…`.
   - If there **is a user** and the path is `/login` or `/signup`, it **redirects to `/`**.

2. **Browser client** (`lib/supabase/client.ts`) uses `createBrowserClient` from `@supabase/ssr`. Session state is **not** stored in `localStorage` manually; the library syncs with cookies.

3. **AuthProvider** (`components/AuthProvider.tsx`) subscribes to `onAuthStateChange` and loads the row from **`profiles`** for the signed-in user so the UI can show name/email.

4. **AppProvider** syncs the existing local dashboard state: when a Supabase session exists, it sets **`currentUserId`** to `auth.users.id` and merges a `User` entry so the rest of the app keeps working.

5. **Email confirmation** (if enabled in Supabase): sign-up runs on **`POST /api/auth/signup`**, which sets `emailRedirectTo` to `{origin}/auth/callback` using **`NEXT_PUBLIC_SITE_URL`** or the request’s public host. After the user clicks the link, they hit **`/auth/callback`** with a `code`; the route exchanges it for a session and sets cookies.

6. **Sign out** calls `supabase.auth.signOut()`; middleware then treats the user as logged out.

## Security notes

- Passwords are **never** stored in app code; Supabase Auth hashes them.
- **`profiles`** uses **RLS** so users can only read/update their own row.
- Use the **anon** key in the client; reserve the **service role** key for trusted server-only jobs (not committed to the repo).
