# Database

SQLite file at `backend/weather.db`, accessed via Drizzle ORM.

## Schema

Single table: `locations`. Unique constraint on `(latitude, longitude)` prevents duplicate coordinates. Complex weather fields (forecast periods, daily forecasts) are stored as JSON columns.

Schema source: [backend/src/schema.ts](../backend/src/schema.ts)

## Migration Workflow

1. Edit `backend/src/schema.ts`
2. `npm run db:generate` — generates SQL migration files in `backend/drizzle/`
3. `npm run db:migrate` — applies pending migrations to `backend/weather.db`

Never edit the generated files in `backend/drizzle/` by hand.
