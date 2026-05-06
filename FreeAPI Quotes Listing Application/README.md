# FreeAPI Quotes Listing Application

A modern React + Vite application that displays inspirational quotes fetched from the FreeAPI. Browse through paginated quotes, search by content/author/tags, and discover featured quotes with a clean, responsive interface.

## Features

- 📖 **Quote Listing** - Browse quotes with pagination (12 quotes per page)
- 🔍 **Search Functionality** - Filter quotes by content, author, or tags
- ⭐ **Featured Quote** - Display highlighted quote on each page
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **Fast Performance** - Built with React 19 and Vite for optimal speed
- 🛡️ **Error Handling** - Graceful error messages and loading states
- 🔄 **Real-time Updates** - Smooth data fetching with abort controls

## Tech Stack

- **React 19.2.5** - UI library
- **Vite 8.0.10** - Build tool and dev server
- **ESLint** - Code quality and linting
- **CSS3** - Styling

## Installation

1. Clone the repository:
```bash
git clone https://github.com/debeshghorui/FreeAPI.git
cd "FreeAPI Quotes Listing Application"
```

2. Install dependencies:
```bash
pnpm install
```

## Development

Start the development server with hot module replacement:
```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

## Build

Create an optimized production build:
```bash
pnpm build
```

## Preview

Preview the production build locally:
```bash
pnpm preview
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

## API

This application uses the [FreeAPI](https://api.freeapi.app) public quotes endpoint:
- Endpoint: `https://api.freeapi.app/api/v1/public/quotes`
- No authentication required
- Supports pagination with page and limit parameters

## Project Structure

```
src/
  ├── App.jsx       - Main application component
  ├── App.css       - Application styles
  ├── main.jsx      - Entry point
  ├── index.css     - Global styles
  └── assets/       - Static assets
```

## Future Enhancements

- Add quote favorites/bookmarking
- Implement quote sharing functionality
- Add more filtering options
- Implement dark mode

## License

This project is part of the WebDev Cohort 26 curriculum.
