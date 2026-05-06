# FreeAPI Random Users UI

A React + Vite project that fetches and displays random user profiles from FreeAPI in a clean card-based interface.

## API Endpoint

`https://api.freeapi.app/api/v1/public/randomusers`

The app reads users from `response.data.data` and pagination metadata from:

- `response.data.page`
- `response.data.totalPages`
- `response.data.totalItems`

## Features

- Fetches live user data from FreeAPI
- Responsive profile cards with:
  - Name and username
  - Email
  - Location
  - Age
  - Registration date
  - Gender and nationality
- Loading and error states with retry support
- "Load Random Page" button
- Bottom pagination controls:
  - Previous / Next
  - Numbered pages
  - Ellipsis for long page ranges

## Tech Stack

- React 19
- Vite 8
- Plain CSS (custom theme, typography, and animations)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run in development

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Run lint checks

```bash
npm run lint
```

## Project Structure

- `src/App.jsx` - data fetching, state handling, UI rendering, pagination logic
- `src/App.css` - component-level styles for hero, cards, and pagination
- `src/index.css` - global theme, typography, and base styles
