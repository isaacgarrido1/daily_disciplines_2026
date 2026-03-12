# Database setup (Vercel Postgres / Neon)

When `DATABASE_URL` (or `POSTGRES_URL`) is set, the app uses **Neon** for groups (create + join). Without it, groups are in-memory only (single server instance; lost on restart).

**Dependency:** The app uses `@neondatabase/serverless`. Run `npm install` after clone/pull.

---

## Quick go-live (you already have Neon in Vercel)

1. **Get your connection string**  
   Vercel Dashboard → your project → **Storage** → your Postgres (Neon) → **.env.local** tab or **Connection string**. Copy the value (e.g. `POSTGRES_URL` or `DATABASE_URL`).

2. **Set env in Vercel**  
   Project → **Settings** → **Environment Variables**. Add:
   - **Name:** `DATABASE_URL`  
   - **Value:** paste the connection string (same one Neon/Vercel shows).  
   Add for **Production** (and Preview if you want). Save.

3. **Create tables**  
   In Vercel → **Storage** → your Postgres → **Query**, paste and run the full contents of **`scripts/schema.sql`** (creates `groups`, `weekly_missions`, `comments`). Run once.

4. **Deploy**  
   Push to your connected repo or trigger a new deployment. Production will use `DATABASE_URL`; create group and join-by-code will use Neon.

**Local dev:** Copy the same connection string into `.env.local` as `DATABASE_URL=postgresql://...` so create/join use Neon locally too (or leave unset to use in-memory).

---

## Full setup from scratch

### 1. Create the database

1. [Vercel Dashboard](https://vercel.com/dashboard) → your project.
2. **Storage** (or **Integrations** / **Marketplace**) → **Postgres** (Neon).
3. Create the database and connect it to this project. Vercel will add env vars (e.g. `POSTGRES_URL` or `DATABASE_URL`).

### 2. Add env locally

In `.env.local`:

```bash
DATABASE_URL=postgresql://...   # from Vercel Storage → Postgres → connection string
```

Or: `vercel env pull .env.local`

### 3. Create tables

In **Vercel → Storage → your Postgres → Query**, run **`scripts/schema.sql`**.

Or locally: `psql "$DATABASE_URL" -f scripts/schema.sql`

### 4. Deploy

Redeploy so production has `DATABASE_URL`. If the DB was connected to the project in step 1, it’s usually already set; otherwise add it under **Settings → Environment Variables**.
