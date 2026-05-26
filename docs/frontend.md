# Frontend

## State Management

React Context only — no Redux or Zustand. [`store.tsx`](../frontend/src/state/store.tsx) holds the locations array and the selected location ID. All mutations (create/refresh/delete) call the API and then reload state from the server.

## API Layer

All backend calls go through [`frontend/src/api.ts`](../frontend/src/api.ts) using relative `/api/*` paths. No base URL configuration is needed because the frontend and backend share the same Express process.

## Interaction Logging

The frontend posts named user interaction events (e.g. `location_create_submitted`) to `POST /api/logs`. This gives the backend visibility into user behavior without a separate analytics service.

## Theming

Light/dark mode state lives in [`frontend/src/state/theme.tsx`](../frontend/src/state/theme.tsx). Tailwind CSS handles styling via utility classes; config is in [`frontend/tailwind.config.js`](../frontend/tailwind.config.js).
