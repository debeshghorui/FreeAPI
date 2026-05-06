# FreeAPI Meals Listing Interface

A responsive meals and recipes listing interface built with React and Vite.

It fetches meal data from FreeAPI and displays it in a clean, card-based layout with search, category filters, and pagination.

## API Used

- Endpoint: `https://api.freeapi.app/api/v1/public/meals`
- Query param: `page`
- Query param: `limit`

## Features

- Fetch and render meals from API
- Loading skeleton UI while data is being fetched
- Error state with retry button
- Search meals by name, category, area, or tags
- Category chip filters
- Pagination with Previous/Next controls
- Responsive card layout for desktop and mobile
- Quick action links for recipe video and source (when available)

## Tech Stack

- React 19
- Vite 8
- CSS (custom styling, no UI framework)

## Project Structure

```txt
src/
  App.jsx
  App.css
  index.css
  main.jsx
```

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
```

4. Preview production build

```bash
npm run preview
```

## Scripts

- `npm run dev` - run dev server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Notes

- The app currently requests `12` meals per page.
- Filtering and search are applied to the currently loaded page data.
