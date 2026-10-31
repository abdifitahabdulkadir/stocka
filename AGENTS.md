# stocka

Inventory management app built with React, Vite and Tailwind CSS.

## Commands

- `pnpm dev` - start the Vite dev server (port `$PORT`, default 8443)
- `pnpm build` - production build
- `pnpm preview` - preview the production build
- `pnpm format` - format with oxfmt
- `pnpm db:setup` - create the database tables (needs `DATABASE_URL` in `.env`, see `.env.example`)
- `pnpm db:seed` - optional demo data for an empty database

## Project Structure

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx`
- `src/App.tsx` - app shell and routing between pages
- `src/pages/` - one component per screen (`auth/` holds the auth flows)
- `src/components/` - shared layout (`Sidebar`, `TopBar`) and `ui/` primitives
- `server/app.ts` - Express app: mounts the routers in `server/routes/` (all `/api` routes need a session except `auth`); `server/crud.ts` is the generic list/get/create/update/delete router; `server/auth.ts` has password hashing, sessions and `requireAuth`/`requireAdmin`; `server/http.ts` has validation and error handling
- `api/index.ts` - Vercel entry point, re-exports the Express app (`vercel.json` rewrites `/api/*` to it); in dev, `vite.config.ts` mounts the same app
- `db/schema.sql` - Neon Postgres schema (`users`, `sessions`)
- `src/lib/api.ts` - fetch helpers and the `useApi` data hook; `src/lib/auth.ts` - auth calls; `src/lib/UserContext.tsx` - signed-in user
- `src/index.css` - global CSS and the Tailwind v4 import
- `vite.config.ts` - React and Tailwind plugins plus the `@` alias for `src`
- `.mise.toml` - Node.js and pnpm versions

## Dependencies

- React 19, Tailwind CSS v4 (via `@tailwindcss/vite`), Vite 8, TypeScript 5.7
- `lucide-react` for icons, `recharts` for charts
- Express for the API, Neon Postgres via `@neondatabase/serverless`; email/password auth with cookie sessions stored in the DB
- Package manager: pnpm

## Auth and data

- The first account is created on a setup screen and is the admin; sign-up is then closed (set `ALLOW_SIGNUP=true` to reopen it). Admins create other users in User Management.
- Roles: `admin` (everything) and `staff` (everything except users and settings). Enforce roles in the API, not only the UI.
- Stock changes (orders, stock in/out, receiving a purchase order) are single SQL statements, so stock and records change together or not at all. Keep new stock-affecting code that way.

## Styling

Use Tailwind utility classes in JSX. Global CSS and Tailwind v4 theme customization go in `src/index.css`; no Tailwind or PostCSS config file is needed.

## Code quality

- Use double quotes for strings containing apostrophes, or escape them in single-quoted strings.
- Export components as default exports.
