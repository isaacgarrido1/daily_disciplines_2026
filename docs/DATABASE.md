# Database setup (Vercel Postgres / Neon)

When `DATABASE_URL` (or `POSTGRES_URL`) is set, the app syncs **groups**, **weekly goals**, and **encouragements** across devices. Without it, those are stored only in the browser (leader and members won’t see each other’s data).

**Dependency:** The app uses `@neondatabase/serverless`. After cloning or pulling, run `npm install` so the package is installed.

## 1. Create the database

1. Open [Vercel Dashboard](https://vercel.com/dashboard) → your project.
2. Go to **Storage** (or **Integrations** / **Marketplace**).
3. Add **Postgres** (Neon is the recommended integration).
4. Create the database and connect it to this project. Vercel will inject environment variables (e.g. `DATABASE_URL`).

## 2. Add env locally

Copy the connection string from Vercel into your local `.env.local`:

```bash
# From Vercel: Storage → your Postgres → .env.local tab (or Environment Variables)
DATABASE_URL=postgresql://...
```

Or use the Vercel CLI:

```bash
vercel env pull .env.local
```

## 3. Create tables

Run the schema once so the app can read/write. In **Vercel Dashboard → Storage → your Postgres → Query**, paste and run the contents of:

**`scripts/schema.sql`**

Or from your machine (if you have `psql` and the URL):

```bash
psql "$DATABASE_URL" -f scripts/schema.sql
```

## 4. Deploy

Redeploy so production uses the same `DATABASE_URL`. If you connected the database to the project in step 1, production already has the variable; otherwise add it under **Settings → Environment Variables**.

---

After this, when a **leader** creates a group or sets weekly goals, and a **member** joins with the code (even in another browser or incognito), the member will see the same goals and encouragements.
