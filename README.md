# Portfolio

Personal portfolio of Tim Moedeker — architecture and art projects, presented in a digital sketchbook.

**Live:** [timmkr.space](https://timmkr.space)

## Concept

This site is a sketchbook: two stacks of physical paper A4 pages on a digital cutting mat, flipped through spread by spread. A projects overlay gives the masonry-grid overview and jumps straight to any work.

## Architecture

- **`src/App.tsx`** — all content: every page, spread and gallery is defined here as data.
- **`src/components/Sketchbook.jsx`** — the book engine: page stacks, turning, spread layout.
- **`src/components/`** — building blocks: `Dither` (animated background), `Dock` (navigation), `Masonry` (projects overlay grid), `CuttingMat` (cm-ruler backdrop), `ScrollSequence` (mobile intro), `DecryptedText`, `PixelIcons`.
- **`src/paths.ts`** — a single `BASE` constant for all asset paths.

Stack: Vite · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · three.js

## Content

The book holds the CV and Works 01–08 — Master Thesis, Bachelor Thesis, Film Photography, Apartment in VR, Atelier Anthrazit, H-Block Exhibition Booth, Tanz-Gallery Lee-Keun Reimagined, Cascades: Campus Hamburg.

## Assets

- **`public/`** — one folder per project, plus `CV.pdf`, fonts and textures. Roughly 1 GB of images and video.
- **`scripts/`** — Python generators for preview images and the CV PDF, font sources and a few diagnostic scripts.

## Workflow

Everything lands on `main`; a push builds and deploys via GitHub Actions. Backup branches (`backup/YYYY-MM-DD`) snapshot the repo along the way.
