# Environment

Copy `.env.example` to `.env` before first run.

| Variable          | Default              | Description                                             |
| ----------------- | -------------------- | ------------------------------------------------------- |
| `WEATHER_API_KEY` | _(none)_             | Optional data.gov.sg API key for higher rate limits     |
| `PORTLESS_PORT`   | `1355`               | Port for the Portless proxy                             |
| `PORTLESS_HTTPS`  | `0`                  | Set to `1` to enable HTTPS (requires certificate trust) |
| `DATABASE_PATH`   | `backend/weather.db` | Path to the SQLite database file                        |
