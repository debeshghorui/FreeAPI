# ShopVault - Premium Product Listing Interface

ShopVault is a premium e-commerce product listing interface built with React and Vite. It fetches and displays random product data from FreeAPI in a structured, modern layout with advanced features like filtering, sorting, and pagination.

## ✨ Features

- **Product Grid**: Responsive 3-column grid with animated card entry and hover transformations.
- **Rich Product Cards**: Displays thumbnail, brand, title, description, pricing (current and original), star rating, stock indicator bar, discount, and category badges.
- **Real-time Search**: Search across product titles, brands, and descriptions seamlessly.
- **Dynamic Category Filters**: Filter chips are dynamically generated based on available product categories.
- **Sorting Mechanisms**: Sort products by price (low to high, high to low), rating, or biggest discount.
- **Pagination**: Easy navigation with smooth scroll-to-top functionality.
- **Product Detail Modal**: A full image gallery with navigation arrows and dots, accompanied by detailed product metadata.
- **Robust Loading & Error States**: Features shimmer skeleton cards during data fetching and a friendly empty state when no products match filters.
- **Premium Design**: Dark theme with a purple accent gradient, glassmorphism UI elements, ambient background glow, and micro-animations for an exceptional user experience.

## 🚀 Tech Stack

- **Core**: React 19, Vite
- **Styling**: Vanilla CSS (Custom Design System with CSS variables)
- **Data Source**: [FreeAPI - Random Products Endpoint](https://api.freeapi.app/api/v1/public/randomproducts)
- **Typography**: Inter (Google Fonts)

## 📦 Getting Started

### Prerequisites

Make sure you have Node.js and npm (or pnpm/yarn) installed on your system.

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd "FreeAPI Product Listing Interface"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:5173/`).

## 🛠️ Project Structure

- `src/App.jsx`: Main React component handling state, API fetching, filtering logic, and rendering the UI components (ProductCard, ProductModal, SkeletonGrid).
- `src/App.css`: Component-specific styles for cards, modals, toolbar, pagination, and responsive breakpoints.
- `src/index.css`: Global design system variables (colors, typography, spacing) and base styles including ambient background effects.
- `src/main.jsx`: React entry point.
- `index.html`: Main HTML file with SEO meta tags and font imports.

## 📝 Acknowledgements

- Data provided by [FreeAPI](https://freeapi.app).
- Design inspiration drawn from modern, premium e-commerce platforms and web design trends.
