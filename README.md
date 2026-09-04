# TM Architecture Portfolio

A modern, animated architecture portfolio built with React, TypeScript, and Tailwind CSS. Hosted on GitHub Pages.

## Features

- **Dark Theme**: Fully dark-themed design with custom color schemes
- **Animations**: Smooth animations using Framer Motion (ReactBits-inspired)
- **Responsive**: Fully responsive design for all screen sizes
- **Modern UI**: Glass cards, gradient text, and custom animations
- **Project Showcase**: Multiple layout options for displaying projects
- **Contact Form**: Interactive contact form with validation

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## Project Structure

```
portfolio/
├── public/              # Static assets
│   └── favicon.svg
├── src/
│   ├── components/      # Reusable components
│   │   ├── HeroSection.tsx
│   │   ├── ProjectGrid.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── AboutSection.tsx
│   │   └── ContactSection.tsx
│   ├── pages/           # Page components
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── .github/workflows/   # GitHub Actions
│   └── deploy.yml       # Deployment workflow
├── scripts/            # Backup scripts
│   └── backup.sh        # Backup script
├── package.json
├── vite.config.ts
├── tailwind.config.js
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

## Backups

Run the backup script to create version backups:

```bash
./scripts/backup.sh
```

This keeps the last 2 versions as requested.

## Customization

### Adding Projects

Edit `src/components/ProjectGrid.tsx` to add your projects:

```typescript
const projects = [
  {
    id: 1,
    title: 'Your Project',
    category: 'Category',
    image: 'your-image-url',
    description: 'Project description',
    tags: ['tag1', 'tag2'],
  },
  // ... more projects
]
```

### Theming

Edit `tailwind.config.js` to customize colors and animations.

### Content

Update content in the respective component files:
- `HeroSection.tsx` - Hero section content
- `AboutSection.tsx` - About section content
- `ContactSection.tsx` - Contact information
- `Footer.tsx` - Footer links and info

## Ideas for Project Display

Here are some ideas for showcasing projects on the front page:

1. **Masonry Grid**: Staggered grid layout for visual interest
2. **Carousel**: Rotating featured projects
3. **3D Cards**: Cards with depth and hover effects
4. **Category Tabs**: Filter projects by category
5. **Timeline**: Show project evolution over time
6. **Interactive Map**: Show project locations on a map
7. **Video Backgrounds**: Use video backgrounds for featured projects
8. **Before/After**: Comparison sliders for renovations
9. **Virtual Tours**: Embed 360° tours
10. **Testimonials**: Client testimonials alongside projects

## License

MIT
