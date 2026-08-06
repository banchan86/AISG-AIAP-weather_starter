# Plan: "Use my location" button

> Source PRD: [docs/specs/use-my-location.md](../docs/specs/use-my-location.md)

## Architectural decisions

Durable decisions that apply across all phases:

- **Routes**: none added. Location creation flows through the existing `POST /api/locations` endpoint via the store's existing create action; the backend keeps sole ownership of forecast-area matching and weather snapshots. No backend changes in any phase.
- **Schema**: no changes.
- **Key models**: one pure decision function is the feature's single seam. Input: a position-or-error plus the saved-locations list. Output: exactly one of `create (lat, lon)`, `select-existing (id)`, `out-of-bounds`, or a typed failure (`permission-denied` | `position-unavailable`). All new logic (geofence, dedup, error mapping) lives here; the Geolocation API call stays as thin untested glue.
- **Geolocation contract**: single-shot `getCurrentPosition` per click — coarse accuracy, 10-second timeout, 60-second cached-position tolerance. No continuous watching.
- **Constants**: Singapore geofence lat 1.1–1.5, lon 103.6–104.1 (mirrors backend validation); proximity-dedup radius ~1 km; distance by squared-Euclidean, matching the backend's nearest-neighbor convention — no geospatial library.
- **Testing**: plain Vitest against the pure decision function only. No DOM rendering, no new frontend test infrastructure. Tests assert external behavior (outcomes), never implementation details.
- **UI placement**: button sits in the sidebar beside "Add Location"; errors render inline in the sidebar reusing the coordinate form's error styling. The manual coordinate form is never modified.

---

## Phase 1: Happy-path walking skeleton

**User stories**: 1, 2, 3, 4, 15, 17

### What to build

A "Use my location" button beside "Add Location". Clicking it requests a single coarse position fix, passes the result through the (newly created) decision function, and on a `create` outcome submits the raw coordinates through the store's existing create action — so the backend resolves the nearest forecast area, the existing interaction-logging events fire, and the new location becomes selected. No error handling beyond what the store already does; verified end-to-end with the browser dev tools' location override set to a Singapore coordinate.

### Acceptance criteria

- [ ] Button appears beside "Add Location" in the sidebar
- [ ] With a Singapore position override, one click creates the location, shows its nearest forecast area's weather, and selects it — no confirmation step
- [ ] The position request uses coarse accuracy, a 10s timeout, and 60s cache tolerance
- [ ] The decision function exists as a pure function and returns `create` with raw (unrounded) coordinates; Vitest covers this outcome
- [ ] Existing create-submitted/created interaction-log events fire (visible via the logs endpoint)
- [ ] Manual coordinate form still works unchanged

---

## Phase 2: Singapore geofence

**User stories**: 8, 12

### What to build

The decision function gains the `out-of-bounds` outcome: a fix outside lat 1.1–1.5 / lon 103.6–104.1 short-circuits before any network call, and the sidebar shows a friendly "you don't appear to be in Singapore" message inline, styled like the coordinate form's errors — never a raw 422.

### Acceptance criteria

- [ ] A position override outside Singapore (e.g. London) produces the friendly inline message and no API call
- [ ] Error appears in the sidebar with the same styling as the coordinate form's submit error
- [ ] Vitest covers coordinates on and just beyond each geofence boundary
- [ ] A subsequent in-bounds click clears the error and creates normally

---

## Phase 3: Geolocation failures

**User stories**: 9, 10, 11

### What to build

The decision function maps the Geolocation API's error codes to typed failures, and each failure gets distinct inline copy: permission denied → "blocked — enable in browser settings" (never re-prompted); position unavailable or timeout → "couldn't get your position — retry or enter coordinates manually". The 10s timeout guarantees a click never hangs.

### Acceptance criteria

- [ ] Denying the permission prompt shows the "blocked" copy pointing at browser settings
- [ ] A timeout or unavailable position shows the retry/manual-entry copy
- [ ] The two failure modes show visibly different messages
- [ ] No click leaves the UI waiting longer than the 10s timeout
- [ ] Vitest covers the mapping of each geolocation error code to its failure type

---

## Phase 4: Proximity dedup

**User stories**: 7

### What to build

The decision function gains the `select-existing` outcome: when the fix lands within ~1 km of a saved location, that location is selected and no create request is made — repeat clicks from the same spot are idempotent despite GPS jitter.

### Acceptance criteria

- [ ] Clicking twice from the same position override creates one location; the second click selects it
- [ ] A fix clearly farther than 1 km from all saved locations still creates a new one
- [ ] Vitest covers fixes just inside and just outside the dedup radius, and picking the nearest when multiple qualify
- [ ] No API call is made on the `select-existing` path

---

## Phase 5: In-flight feedback

**User stories**: 5, 6

### What to build

The button reflects progress through the multi-second flow: idle → "Locating…" (waiting for the fix) → "Adding…" (create request in flight), and is disabled the whole time so a double-click can't fire a second flow or create duplicates.

### Acceptance criteria

- [ ] Button label changes to "Locating…" immediately on click, then "Adding…" once the fix arrives
- [ ] Button is disabled from click until the flow settles (success or error)
- [ ] Rapid double-click produces exactly one location
- [ ] Button returns to idle state after success and after every failure mode

---

## Phase 6: Feature detection

**User stories**: 13

### What to build

At render time, if the Geolocation API is absent or the context is not secure, the button renders disabled with a tooltip explaining why — the user is never invited to click something that must fail. Supported targets: Chromium/Firefox on the dev `.localhost` origin and any HTTPS/localhost origin.

### Acceptance criteria

- [ ] With geolocation unavailable (or an insecure context), the button is visible but disabled with an explanatory tooltip
- [ ] On the dev `.localhost` origin in Chromium/Firefox the button is enabled
- [ ] Disabled state is decided at render, not after a failed click
