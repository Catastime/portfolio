# Portfolio

Personal portfolio site, hosted on GitHub Pages.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- Framer Motion (animations for reactbits.dev components)
- lucide-react (icons)
- Deployed via the GitHub Actions artifact-based Pages workflow

## Commands

```bash
npm install      # install deps
npm run dev     # local dev server (http://localhost:5379)
npm run build    # type-check + production build to dist/
npm run preview  # preview the production build locally
```

## Structure

```
src/
  App.tsx        # root component — compose reactbits.dev components here
  main.tsx       # entry point
  index.css      # Tailwind import + global styles
  components/    # add reactbits.dev components here
public/
  favicon.svg
.github/workflows/deploy.yml   # auto-deploys main -> GitHub Pages
```

## Adding reactbits.dev components

1. Copy the component source from [reactbits.dev](https://reactbits.dev) into `src/components/`.
2. Import it in `App.tsx` (or wherever it's used) via the `@` alias, e.g. `import ComponentName from '@/components/ComponentName'`.
3. Most reactbits components rely on `framer-motion` (already installed). Some use `gsap`, `three`, or `ogl` — install those on demand.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds and deploys to GitHub Pages at `https://catastime.github.io/portfolio/`.

The `base` path is set to `/portfolio/` in `vite.config.ts` to match the project-page URL.
