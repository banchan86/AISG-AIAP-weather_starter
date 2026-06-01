---
name: sg-weather-api
description: Reference for the data.gov.sg Singapore weather APIs consumed by this project. Use when working with any endpoint called from [backend/src/weather.ts](../../../backend/src/weather.ts), debugging a missing/null field in a `WeatherSnapshot`, adding a new endpoint, or interpreting response payloads. Triggers on "data.gov.sg", "Singapore weather API", "two-hr-forecast", "PSI / PM2.5", "UV index", "4-day forecast", "weather station readings", "WeatherProviderError", or any time a field on `WeatherSnapshot` appears wrong/empty.
---

# Singapore weather API reference

Reference for the data.gov.sg endpoints consumed by [`SingaporeWeatherClient`](../../../backend/src/weather.ts). Use this when reasoning about response shapes, why a field is `null`, or what to call for a new feature.

## Hosts

Two hosts are in play. **Do not assume one is a synonym for the other** — they serve different versions and shapes.

| Host | Used for | Notes |
|---|---|---|
| `https://api-open.data.gov.sg` | All `v2/real-time/api/*` endpoints | Default. No key required for light use; pass `WEATHER_API_KEY` via `x-api-key` for higher limits. |
| `https://api.data.gov.sg` | `v1/environment/4-day-weather-forecast` only | Legacy. Different envelope shape (no `data:` wrapper, `items[]` at root). |

The code splits these as [`apiBaseUrl()`](../../../backend/src/weather.ts#L384) vs [`legacyApiBaseUrl()`](../../../backend/src/weather.ts#L388).

## Endpoint catalog

All v2 endpoints return `{ code, errorMsg, data: { ... } }`. A non-zero `code` means failure — the client throws [`WeatherProviderError`](../../../backend/src/weather.ts#L1) in that case. The legacy v1 endpoint returns `{ items: [...] }` at the root with no `code`.

| Endpoint | Host | Returns | Maps to `WeatherSnapshot` field |
|---|---|---|---|
| `GET /v2/real-time/api/two-hr-forecast` | open | `data.area_metadata[]`, `data.items[].forecasts[]` | `condition`, `area`, `valid_period_text`, `observed_at` |
| `GET /v2/real-time/api/air-temperature` | open | `data.stations[]`, `data.readings[0].data[]` (°C) | `temperature_c` |
| `GET /v2/real-time/api/relative-humidity` | open | same shape as air-temperature (%) | `humidity_percent` |
| `GET /v2/real-time/api/rainfall` | open | same shape (mm over last 5 min) | `rainfall_mm` |
| `GET /v2/real-time/api/wind-speed` | open | same shape (knots) | `wind_speed_knots` |
| `GET /v2/real-time/api/wind-direction` | open | same shape (degrees, 0=N) | `wind_direction_degrees` |
| `GET /v2/real-time/api/uv` | open | `data.records[0].index[0].value` | `uv_index` |
| `GET /v2/real-time/api/psi` | open | `data.regionMetadata[]`, `data.items[0].readings.psi_twenty_four_hourly[region]` | `psi_twenty_four_hourly`, `air_quality_region` |
| `GET /v2/real-time/api/pm25` | open | `data.items[0].readings.pm25_one_hourly[region]` | `pm25_one_hourly` |
| `GET /v2/real-time/api/twenty-four-hr-forecast` | open | `data.records[0].general.temperature.{low,high}`, `periods[]` | `forecast_low_c`, `forecast_high_c`, `forecast_periods` |
| `GET /v1/environment/4-day-weather-forecast` | legacy | `items[0].forecasts[]` with `date`, `forecast`, `temperature.{low,high}` | `daily_forecast` |

The README's "External API Reference" table lists 24-hour at `/v1/environment/24-hour-weather-forecast`. The code uses the **v2** path `/v2/real-time/api/twenty-four-hr-forecast` — trust the code.

## Response shape quirks

**`data` wrapper, sometimes.** The two-hour forecast payload has been seen in two shapes — `data.area_metadata` / `data.items`, or `area_metadata` / `items` at the root. [`snapshotFromPayload`](../../../backend/src/weather.ts#L434) handles both with `payload.data ?? payload`.

**`label_location` vs `labelLocation`.** Forecast areas (two-hr-forecast) use `label_location` (snake_case). PSI/PM2.5 region metadata uses `labelLocation` (camelCase). Don't unify them — they come from the API that way.

**Readings without a value.** A `stations[]` entry may not appear in `readings[0].data[]`. The client filters to stations that *have* a value before computing the nearest station (see [`nearestStation`](../../../backend/src/weather.ts#L575)), so the "nearest" can shift when stations drop offline.

**PSI is regional, not point.** PSI and PM2.5 only have five values: `north`, `south`, `east`, `west`, `central`. The client picks the nearest region's value. If `air_quality_region` is `null`, the nearest-region lookup failed and both PSI and PM2.5 will be `null` too.

**24-hour forecast regions.** The 24-hour endpoint does **not** include `regionMetadata` — the client falls back to [`defaultRegions()`](../../../backend/src/weather.ts#L620), hardcoded SG region centroids. If the API ever stops returning the same five region keys (`west/north/central/south/east`), `forecast_periods` will go empty.

**4-day forecast is on the legacy host.** It's the only call to `api.data.gov.sg` (no `-open`). Different envelope: no `code`, no `data` wrapper, just `items[]`.

**Timestamps.** Two fields appear inconsistently: `update_timestamp` (snake) on forecast items, `updatedTimestamp` (camel) on UV/PSI/24h records. Both are ISO 8601 with `+08:00`.

## Error & rate-limit behavior

[`fetchJson`](../../../backend/src/weather.ts#L392) handles HTTP failures explicitly:

- **HTTP 429** — returns stale cached data if available, otherwise throws `WeatherProviderError('rate limit reached')`. Adding `WEATHER_API_KEY` raises the limit.
- **HTTP 401/403** — throws "rejected request (check API key)". Usually only fires when a bad key is set.
- **Other non-2xx** — throws with the status code.
- **Network error / abort** — wrapped into `WeatherProviderError('Unable to reach weather provider')`. Original error is swallowed.
- **Timeout** — `AbortController` fires at `options.timeoutMs ?? 8000` ms.

Inside [`getCurrentWeather`](../../../backend/src/weather.ts#L191), each sub-call is wrapped in `.catch(() => null/empty)` so one failing endpoint does not blank the whole snapshot. **This means a thrown `WeatherProviderError` from a single endpoint silently turns into a `null` field.** When debugging a missing field, log inside the catch — the surface API will not tell you which sub-call failed.

## Cache

In-memory, per-URL, 60-second TTL (`cacheTtlMs = 60_000`). Survives only within one Node process. On 429, stale entries are returned past TTL as a fallback. The cache is **not** keyed by lat/lon — only by URL — because the raw API responses are location-independent; lat/lon is applied client-side via nearest-neighbor.

## Nearest-neighbor distance

All "nearest X to lat/lon" lookups use squared Euclidean distance on raw lat/lon, not haversine. This is acceptable inside Singapore (~50 km box) but would break for larger regions. Three implementations exist — keep them in sync if you change one:

- [`nearestAreaName`](../../../backend/src/weather.ts#L533) — forecast areas (uses `label_location`)
- [`nearestRegionName`](../../../backend/src/weather.ts#L554) — PSI/PM2.5/24-hr regions (uses `labelLocation`)
- [`nearestStation`](../../../backend/src/weather.ts#L575) — weather stations, filtered to those with a current reading

## Adding a new endpoint

1. Add a typed `*Payload` interface near the top of [backend/src/weather.ts](../../../backend/src/weather.ts) mirroring the API's shape with all fields optional — the API is loose.
2. Add a `fetch*` method on `SingaporeWeatherClient` that calls `this.fetchJson<YourPayload>(...)` and check `payload.code !== 0`.
3. Use `numberOrNull(...)` to coerce string/number value fields — readings often come back as strings.
4. Add the field to the [`WeatherSnapshot`](../../../backend/src/weather.ts#L152) interface (use `| null` — assume failure).
5. Add the call to the `Promise.all` block in [`getCurrentWeather`](../../../backend/src/weather.ts#L192) with a `.catch(() => /* null-shaped fallback */)`.
6. If the field is persisted, add a column in [backend/src/schema.ts](../../../backend/src/schema.ts) and run `npm run db:generate` then `npm run db:migrate`.
