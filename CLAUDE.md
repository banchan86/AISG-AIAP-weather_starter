# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start dev server at http://weather-starter.localhost:1355

# Build & Production
npm run build        # Build frontend (Vite) + compile backend TypeScript
npm run start        # Run production server on port 3000

# Testing
npm test             # Run Vitest once (backend/src/**/*.test.ts)
npm run test:watch   # Run Vitest in watch mode

# Database
npm run db:generate  # Generate Drizzle migrations after schema changes (edit backend/src/schema.ts first)
npm run db:migrate   # Apply pending migrations to SQLite

# Utilities
npm run doctor       # Health check: verifies /health and /api/locations
npm run reset        # Delete backend/weather.db and reset the database
```

## Architecture

This is a monorepo (two workspaces: `frontend/`, `backend/`) with a **single Express server** that handles both the REST API and the React SPA. In development, Vite runs as Express middleware (no separate frontend dev server, no CORS issues). In production, Express serves the compiled Vite output from `frontend/dist/`.

The dev script uses [Portless](https://portless.dev) to expose the server at a stable `.localhost` domain (`http://weather-starter.localhost:1355`) rather than a fixed port. This allows tsx to pick a random free port while Portless proxies it.

### Data Flow

```
Browser (React 18 SPA)
    ↓  relative /api/* fetch calls
Express.js
    ├── /api/locations*  →  Drizzle ORM  →  SQLite (backend/weather.db)
    │                            ↓ on create/refresh
    │                  SingaporeWeatherClient (backend/src/weather.ts)
    │                            ↓ parallel Promise.all
    │                  data.gov.sg APIs (temp, humidity, rainfall, wind, UV, PSI, forecasts)
    │
    └── /*  →  Vite middleware (dev) or static frontend/dist/ (prod)
```

### Weather Snapshot Pattern

Weather data is **not** fetched on every page load. When a location is created or refreshed, `SingaporeWeatherClient` fires 10+ parallel requests to `data.gov.sg` and merges them into a single `WeatherSnapshot`. This snapshot is stored in SQLite alongside the location. On refresh, new values are merged with cached values so a transient API failure doesn't erase previously-known fields.

The client also does **nearest-neighbor matching** (squared Euclidean distance, no external library) to map a lat/lon to the closest forecast area or weather station.

### Key Source Files

| Purpose | File |
|---|---|
| API routes | [backend/src/routes/locations.ts](backend/src/routes/locations.ts) |
| Weather API client | [backend/src/weather.ts](backend/src/weather.ts) |
| Database access layer | [backend/src/db.ts](backend/src/db.ts) |
| SQLite schema | [backend/src/schema.ts](backend/src/schema.ts) |
| Global frontend state | [frontend/src/state/store.tsx](frontend/src/state/store.tsx) |
| Frontend API calls | [frontend/src/api.ts](frontend/src/api.ts) |
| Theme state | [frontend/src/state/theme.tsx](frontend/src/state/theme.tsx) |

### Frontend State

State management uses React Context only (no Redux/Zustand). `store.tsx` holds the locations array and the selected location ID. All mutations (create/refresh/delete) call the API then reload from the server.

The frontend also posts user interaction events to `POST /api/logs` (e.g., `location_create_submitted`), giving the backend visibility into user behavior.

### Database Schema

Single table `locations` in SQLite. A unique constraint on `(latitude, longitude)` prevents duplicate coordinates. Complex weather fields (forecast periods, daily forecasts) are stored as JSON columns. After changing `backend/src/schema.ts`, always run `db:generate` then `db:migrate`.

## Environment

Copy `.env.example` to `.env` before first run. Key variables:

- `WEATHER_API_KEY` — optional data.gov.sg API key for higher rate limits
- `PORTLESS_PORT` — proxy port (default `1355`)
- `DATABASE_PATH` — SQLite file path (default `backend/weather.db`)
