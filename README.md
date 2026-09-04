# TM Architecture Portfolio

A clean, modern architecture portfolio built with React and ReactBits-inspired components.

## Features

- **Beams Background** - Animated beam lines from ReactBits
- **Infinite Spiral** - Draggable spiral with 9+ project elements
- **Staggered Menu** - Semi-transparent milky glass navigation
- **Scroll Expand** - Scroll-triggered expanding gallery
- **Dome Gallery** - 3D dome-style image gallery
- **Morph Slider** - Morphing transitions between slides
- **Accordion Gallery** - Expandable galleries with nested content

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## Project Structure

```
portfolio/
├── public/              # Static assets
│   └── favicon.svg
├── src/
│   ├── components/      # ReactBits-inspired components
│   │   ├── BeamsBackground.tsx
│   │   ├── InfiniteSpiral.tsx
│   │   ├── StaggeredMenu.tsx
│   │   ├── ScrollExpand.tsx
│   │   ├── DomeGallery.tsx
│   │   ├── MorphSlider.tsx
│   │   └── AccordionGallery.tsx
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── .github/workflows/   # GitHub Actions
│   └── deploy.yml       # Deployment workflow
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Deploy

```bash
npm run deploy
```

## Deployment

The portfolio is automatically deployed to GitHub Pages when pushing to the `main` branch.

Live URL: https://catastime.github.io/portfolio/

## Components

### BeamsBackground
Animated beam lines background from ReactBits.

### InfiniteSpiral
- 9 draggable project elements in a spiral layout
- Center TM logo
- Click items to open corresponding component
- Drag to rotate the spiral

### StaggeredMenu
- Semi-transparent milky glass effect
- Staggered animation on open
- Click outside to close

### ScrollExpand
- Scroll-triggered expanding gallery
- Images scale and move based on scroll position

### DomeGallery
- 3D dome-style layout
- Mouse movement controls perspective
- Click images to select

### MorphSlider
- Morphing transitions between slides
- Auto-play with pause control
- Navigation arrows and dots

### AccordionGallery
- Expandable gallery sections
- Staggered image reveal
- Placeholder for nested galleries

## Customization

### Adding Projects

Edit `src/App.tsx` to add more spiral items:

```typescript
const spiralItems = [
  { id: 1, label: 'Project 1', component: 'scroll-expand' },
  // ... add more
]
```

### Adding Components

1. Create new component in `src/components/`
2. Add to component registry in `src/App.tsx`
3. Reference in spiral items

### Theming

Edit `src/index.css` to customize the beams background and milky glass effect.

## ReactBits References

- Background: https://reactbits.dev/backgrounds/beams
- Infinite Spiral: https://reactbits.dev/components/infinite-spiral?animationMode=drag
- Staggered Menu: https://reactbits.dev/components/staggered-menu
- Scroll Expand: https://reactbits.dev/animations/scroll-expand
- Dome Gallery: https://reactbits.dev/components/dome-gallery
- Morph Slider: https://reactbits.dev/components/morph-slider
- Accordion Gallery: https://reactbits.dev/components/accordion-gallery

## License

MIT
