# Architecture

## Data Flow

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

## Weather Snapshot Pattern

Weather data is not fetched on every page load. When a location is created or refreshed, `SingaporeWeatherClient` fires 10+ parallel requests to `data.gov.sg` and merges them into a single `WeatherSnapshot`. This snapshot is stored in SQLite alongside the location. On refresh, new values are merged with cached values so a transient API failure does not erase previously-known fields.

## Nearest-Neighbor Matching

`SingaporeWeatherClient` maps a lat/lon to the closest forecast area or weather station using squared Euclidean distance — no external geospatial library.

## Key Source Files

| Purpose                       | File                                                                  |
| ----------------------------- | --------------------------------------------------------------------- |
| API routes                    | [backend/src/routes/locations.ts](../backend/src/routes/locations.ts) |
| Weather API client            | [backend/src/weather.ts](../backend/src/weather.ts)                   |
| Database access layer         | [backend/src/db.ts](../backend/src/db.ts)                             |
| SQLite schema                 | [backend/src/schema.ts](../backend/src/schema.ts)                     |
| Express app + Vite middleware | [backend/src/server.ts](../backend/src/server.ts)                     |
| Global frontend state         | [frontend/src/state/store.tsx](../frontend/src/state/store.tsx)       |
| Frontend API calls            | [frontend/src/api.ts](../frontend/src/api.ts)                         |
