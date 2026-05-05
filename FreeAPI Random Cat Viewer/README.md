# Random Cat Viewer 🐱

A beautiful, responsive web application that fetches and displays random cat breeds dynamically using the [FreeAPI](https://api.freeapi.app/).

## 📸 Overview

Discover a new feline friend with every click! The Random Cat Viewer provides an elegant interface to explore different cat breeds, complete with detailed statistics, origin information, and high-quality images.

### ✨ Features
- **Dynamic Data Fetching**: Retrieves random cat profiles from FreeAPI.
- **Rich User Interface**:
  - Deep dark background with animated glassmorphism blobs.
  - Gradient typography for a premium feel.
  - Smooth image loading states with skeleton shimmers.
  - Animated progress bars for personality statistics (Affection, Intelligence, Energy, etc.).
- **Interactive Elements**:
  - "New Random Cat" button with shimmer effect.
  - Live discovery counter tracking how many cats you've viewed.
  - Direct links to Wikipedia and Vet Info for further reading.
- **Responsive Design**: Adapts seamlessly to mobile and desktop screens.

## 🛠️ Technology Stack
- **Framework**: React (via Vite)
- **Styling**: Vanilla CSS with modern CSS variables, gradients, and custom animations.
- **API**: FreeAPI (`https://api.freeapi.app/api/v1/public/cats/cat/random`)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository or download the project files.
2. Navigate to the project directory:
   ```bash
   cd "FreeAPI Random Cat Viewer"
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

### Running the App Locally

Start the Vite development server:
```bash
npm run dev
# or
pnpm run dev
```

The app will be available at `http://localhost:5173/`.

## 🎨 Design Decisions
- **Dark Mode First**: Enhances visual appeal and makes the colorful cat images pop.
- **Micro-interactions**: Hover effects on tags and buttons, loading spinners, and stat bar animations make the application feel alive and responsive.
- **Typography**: Uses `Playfair Display` for a striking header and `Inter` for clean, readable UI text.
