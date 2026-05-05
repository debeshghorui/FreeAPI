# FreeAPI YouTube Videos Listing UI

A cinematic YouTube-style browsing interface for the FreeAPI public videos endpoint, built with React and Vite.

## Features

- **Responsive Grid Layout** – Featured video spotlight with a responsive grid of additional videos
- **Pagination Controls** – Navigate between pages with Previous/Next buttons
- **Video Metadata** – Display thumbnails, titles, descriptions, view counts, likes, and comments
- **Duration Formatting** – ISO 8601 duration parsing for readable video lengths
- **Loading States** – Skeleton cards for smooth loading experiences
- **Error Handling** – Graceful error messaging for API failures
- **Mobile Optimized** – Responsive design that adapts to all screen sizes

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- pnpm (or npm/yarn)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Visit `http://localhost:5173` to see the app in development mode.

### Build

```bash
pnpm build
```

### Lint

```bash
pnpm lint
```

## API

This project uses the [FreeAPI](https://freeapi.app) public YouTube videos endpoint:
- **Base URL:** `https://api.freeapi.app/api/v1/public/youtube/videos`
- **Supports pagination** via `?page=<number>` query parameter
- **Returns:** Video metadata including snippets, durations, and statistics

## Technology Stack

- **React 19** – UI framework
- **Vite** – Build tool with HMR
- **CSS Grid & Flexbox** – Layout and styling
- **Modern JavaScript** – ES2020+ features

## Project Structure

```
src/
  App.jsx       – Main component with pagination logic
  App.css       – Styling for all components
  main.jsx      – React entry point
  index.css     – Global styles
```

## License

Built for Web Dev Cohort 2026
