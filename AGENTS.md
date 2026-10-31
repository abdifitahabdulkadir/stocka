# stocka

Inventory management app built with React, Vite and Tailwind CSS.

## Commands

- `pnpm dev` - start the Vite dev server (port `$PORT`, default 8443)
- `pnpm build` - production build
- `pnpm preview` - preview the production build
- `pnpm format` - format with oxfmt

## Project Structure

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx`
- `src/App.tsx` - app shell and routing between pages
- `src/pages/` - one component per screen (`auth/` holds the auth flows)
- `src/components/` - shared layout (`Sidebar`, `TopBar`) and `ui/` primitives
- `src/data/mockData.ts` - mock data used by the pages
- `src/index.css` - global CSS and the Tailwind v4 import
- `vite.config.ts` - React and Tailwind plugins plus the `@` alias for `src`
- `.mise.toml` - Node.js and pnpm versions

## Dependencies

- React 19, Tailwind CSS v4 (via `@tailwindcss/vite`), Vite 8, TypeScript 5.7
- `lucide-react` for icons, `recharts` for charts
- Package manager: pnpm

## Styling

Use Tailwind utility classes in JSX. Global CSS and Tailwind v4 theme customization go in `src/index.css`; no Tailwind or PostCSS config file is needed.

## Code quality

- Use double quotes for strings containing apostrophes, or escape them in single-quoted strings.
- Export components as default exports.
