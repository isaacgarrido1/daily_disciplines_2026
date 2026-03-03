# Next.js App Router – File Types Reference

Quick reference for all special files in the `app/` directory (Next.js 15/16). Folder names become URL segments; these files control behavior and UI.

| File | Purpose |
|------|--------|
| **`page.tsx`** | The route’s UI. Makes the path publicly accessible. Export a default component. |
| **`layout.tsx`** | Shared UI that wraps child segments. Persists across navigation and keeps state. |
| **`template.tsx`** | Like layout but re-mounts on navigation (new instance per navigation). |
| **`loading.tsx`** | Loading UI for the segment (wrapped in React Suspense automatically). |
| **`error.tsx`** | Error boundary for the segment. Must be a Client Component (`'use client'`). Receives `error` and `reset` props. |
| **`not-found.tsx`** | Rendered when the segment or a child calls `notFound()`. Used for 404s. |
| **`route.ts`** | API route (Route Handler). Export GET, POST, PUT, PATCH, DELETE, etc. |
| **`default.tsx`** | Fallback UI for parallel routes when the active slot has no match. |
| **`global-error.tsx`** | Root-level error boundary (replaces root layout when it catches an error). Must be Client Component and define its own `<html>` and `<body>`. |

## Route Handlers (`route.ts`)

- Export named functions: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.
- GET is cached by default; other methods are dynamic by default.

## Notes

- **Server Components** by default. Add `'use client'` at the top for Client Components.
- **One route per segment**: Don’t put both `page.tsx` and `route.ts` in the same folder for the same route path.
- **Dynamic segments**: Use folders like `[slug]` or `[...slug]` for dynamic routes.

## Vercel

- No `vercel.json` needed for standard Next.js; Vercel auto-detects the framework.
- Use `build`: `next build` and `start`: `next start` in `package.json` (you already have these).
