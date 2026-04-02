# TrendWise – Frontend

React + Vite frontend for TrendWise, a resource for parents & teachers to understand youth culture online.

## Tech Stack

- **React 18** – UI library
- **Vite 5** – build tool & dev server
- **React Router v6** – client-side routing
- **CSS Modules** – scoped component styles

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Start dev server (proxies /api → http://localhost:8000)
npm run dev
```

The app runs on **http://localhost:3000**.

## Mock Data

By default `VITE_USE_MOCK=true` in `.env`, so the app renders with local mock data — no backend needed to start developing. Set `VITE_USE_MOCK=false` when your Python backend is running.

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── Navbar.jsx
│   ├── ArticleCard.jsx
│   ├── FilterBar.jsx
│   └── Footer.jsx
├── hooks/
│   └── useArticles.js # Data-fetching hook
├── pages/
│   ├── Home.jsx
│   ├── About.jsx
│   └── ArticlePage.jsx
├── services/
│   ├── api.js         # All API calls (connects to Python backend)
│   └── mockData.js    # Dev mock data
├── App.jsx            # Routes
├── main.jsx           # Entry point
└── index.css          # Global styles & design tokens
```

## Connecting to the Python Backend

All API calls in `src/services/api.js` target `/api/*`. Vite proxies these to `http://localhost:8000` during development (see `vite.config.js`).

### Expected API shape

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/articles` | Paginated articles. Accepts `?category=`, `?platform=`, `?search=`, `?page=`, `?limit=` |
| `GET` | `/api/articles/:slug` | Single article |
| `GET` | `/api/articles/trending` | Top N trending articles |
| `GET` | `/api/search?q=` | Full-text search |
| `GET` | `/api/categories` | Available categories |
| `GET` | `/api/platforms` | Available platforms |

Articles should have this shape:

```json
{
  "id": 1,
  "slug": "understanding-rizz",
  "title": "Understanding \"Rizz\"",
  "excerpt": "Learn what rizz means...",
  "category": "Slang",
  "platform": "TikTok",
  "tags": ["TikTok", "Slang"],
  "readTime": 4,
  "publishedAt": "2026-03-04",
  "imageUrl": "https://..."
}
```

## Build for Production

```bash
npm run build
# Output is in /dist
```
