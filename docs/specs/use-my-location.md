# Spec: "Use my location" button

Status: ready-for-agent (published locally in lieu of an issue-tracker entry)

## Problem Statement

To track the weather where they are, a user must already know their latitude and longitude and type both into the coordinate form. Nobody knows their own coordinates offhand, so the most common location a user wants — "right here" — is the hardest one to add. The friction is worst for first-time users whose location list is empty.

## Solution

A "Use my location" button in the sidebar beside "Add Location". One click asks the browser for the user's position, and the app does the rest automatically: it verifies the position is within Singapore, checks whether a nearby location is already saved (selecting it if so), and otherwise creates the location — with the backend resolving the nearest forecast area and building the weather snapshot exactly as it does for manually entered coordinates. Clear inline messages cover the cases where the position can't be used: outside Singapore, permission denied, or no position fix.

## User Stories

1. As a weather tracker user, I want a "Use my location" button next to "Add Location", so that I can add my current position without knowing my coordinates.
2. As a weather tracker user, I want the button to do everything in one click with no confirmation step, so that adding my location is as fast as possible.
3. As a weather tracker user, I want my position matched to the nearest Singapore forecast area, so that the weather shown is the official forecast for where I am.
4. As a weather tracker user, I want the newly added location to become the selected location, so that I immediately see its weather without an extra click.
5. As a weather tracker user, I want the button to show progress ("Locating…", then "Adding…"), so that I know the app is working during the multi-second permission-and-fetch flow.
6. As a weather tracker user, I want the button disabled while a request is in flight, so that an impatient double-click can't create duplicate locations.
7. As a weather tracker user, I want a repeat click near an already-saved location to select that location instead of erroring or duplicating, so that the button behaves idempotently.
8. As a weather tracker user outside Singapore, I want a friendly "you don't appear to be in Singapore" message, so that I understand why my location can't be added rather than seeing a raw validation error.
9. As a weather tracker user who blocked location access, I want a message telling me access is blocked and where to re-enable it, so that I know the fix is in my browser settings — and I don't want the app to re-prompt me.
10. As a weather tracker user whose device can't get a position fix, I want a message suggesting I retry or enter coordinates manually, so that I have a path forward.
11. As a weather tracker user, I want the location request to give up after a bounded time, so that a click never hangs indefinitely.
12. As a weather tracker user, I want geolocation failures shown inline in the sidebar in the same style as the coordinate form's errors, so that errors appear where I acted.
13. As a weather tracker user on a browser or origin where geolocation is unavailable, I want the button rendered disabled with an explanation, so that I'm never invited to click something that must fail.
14. As a weather tracker user, I want the manual coordinate form to remain available unchanged, so that I can still add any location, not just my current one.
15. As a weather tracker user, I want a coarse (city-block) position rather than a battery-hungry high-accuracy fix, so that the result is fast — precision beyond the forecast-area grid is wasted anyway.
16. As a developer, I want the geofence, proximity-dedup, and error-mapping rules in one pure decision function, so that the feature's logic is unit-testable without browser APIs.
17. As a product owner, I want location creation via this button to flow through the existing create action, so that the existing interaction-logging events still record the behavior.

## Implementation Decisions

- Frontend-only. The existing location-create endpoint already validates Singapore bounds, performs nearest-neighbor forecast-area matching, and stores the weather snapshot; the button submits raw GPS coordinates through the existing store create action. No API, schema, or backend changes.
- Browser position is requested once per click via the Geolocation API's single-shot call with coarse accuracy, a 10-second timeout, and a cached-position tolerance of 60 seconds. No continuous watching.
- Geofence check happens client-side before any network call, mirroring the backend's Singapore bounds (lat 1.1–1.5, lon 103.6–104.1), so the user gets friendly copy instead of a 422.
- Proximity dedup happens client-side before any network call: if a saved location lies within ~1 km of the fix, select it and skip creation. Backend duplicate detection is exact-equality on coordinates and cannot fire on jittery GPS readings, so the frontend owns this rule. Distance uses the same squared-Euclidean convention as the backend's nearest-neighbor matching — no geospatial library.
- The flow is fully automatic (no preview/confirm). Progress is conveyed on the button itself: idle → "Locating…" → "Adding…", disabled throughout the in-flight period.
- Failure copy is distinct per cause: permission denied ("blocked — enable in browser settings", never re-prompted) versus position unavailable/timeout ("couldn't get your position — retry or enter coordinates manually"). Errors render inline in the sidebar, reusing the coordinate form's error styling.
- Feature detection at render: if the Geolocation API is absent or the context is not secure, the button renders disabled with a tooltip explaining why. Supported target is Chromium/Firefox on the dev `.localhost` origin (a trustworthy origin in those browsers) and any HTTPS/localhost origin.
- All new decision logic (geofence, proximity dedup, error mapping) lives in one pure function: input is the position-or-error plus the saved-locations list; output is one of `out-of-bounds`, `select-existing (id)`, `create (lat, lon)`, or a typed failure. The Geolocation API call itself stays as thin untested glue. This function is the feature's single new seam.
- No new interaction-logging events. The reused create action already emits the existing create-submitted/created/failed events.

## Testing Decisions

- A good test exercises external behavior through a public interface and never asserts on implementation details. Prior art: the backend locations API suite, which drives the real Express app with an injected fake weather client and asserts only on HTTP responses.
- The unit under test is the pure decision function — the feature's single seam. Cases: coordinates on and beyond each geofence boundary; a fix inside/outside the ~1 km dedup radius of saved locations; mapping of each geolocation error code to its user-facing failure type; the create outcome carrying raw (unrounded) coordinates.
- Plain Vitest, matching the repo's existing test runner. No DOM, no component rendering, no new frontend test infrastructure.

## Out of Scope

- Safari support and any non-trustworthy origin (LAN-IP access, production served over plain HTTP). No TLS provisioning story.
- A preview/confirm step before creation.
- New geolocation-specific interaction-logging events.
- Component-level frontend test infrastructure (DOM rendering, Testing Library).
- Continuous location tracking, reverse geocoding for display names, and any backend changes.

## Further Notes

- The developer may not physically be in Singapore, so the happy path cannot be exercised from a real position. Use the browser dev tools' sensor/location override with a Singapore coordinate to walk the full flow end-to-end.
- Permission denial is persistent per origin in Chromium/Firefox; the "blocked" state will survive reloads until the user changes the site setting, which is why the copy points at browser settings rather than offering a retry.
- This spec was produced from a `/grill-me` interview followed by `/to-spec`; publication to the GitHub issue tracker was intentionally skipped at the user's request, and this document stands in for the `ready-for-agent` issue.
