# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Singapore weather tracker: save locations, fetch live snapshots from data.gov.sg, display forecasts. Node/Express backend + React/Vite frontend in a single monorepo.

## Commands

```bash
npm run dev          # Start dev server → http://weather-starter.localhost:1355
npm run build        # Build frontend (Vite) + compile backend TypeScript
npm test             # Run Vitest once
npm run test:watch   # Vitest watch mode
npm run db:generate  # Regenerate migrations after editing backend/src/schema.ts
npm run db:migrate   # Apply pending migrations
npm run reset        # Delete backend/weather.db (start fresh)
npm run doctor       # Health check: /health + /api/locations
npm run start        # Run compiled production server (port 3000)
```

## Architecture

Single Express process serves both the REST API (`/api/*`) and the React SPA. In dev, Vite runs as Express middleware — there is no separate frontend port. The dev script uses Portless to proxy a random local port to a stable `.localhost` URL, so no port configuration is needed on the frontend.

See [docs/architecture.md](docs/architecture.md) for data flow, the weather snapshot pattern, and key source files.

## Further Reading

- [docs/architecture.md](docs/architecture.md) — Data flow, weather snapshot pattern, nearest-neighbor matching, key source files
- [docs/database.md](docs/database.md) — Schema, migration workflow, JSON columns
- [docs/frontend.md](docs/frontend.md) — State management, API layer, interaction logging
- [docs/environment.md](docs/environment.md) — Environment variables and `.env` setup
