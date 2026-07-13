# Trip Planner Maps — Totus Secure Notes

Trip Planner uses **no API keys by default**. Pro Lifetime unlocks driving route distance and in-app map preview; free tier includes GPS recording, stop lists, external maps launch, and straight-line estimates.

## What each option means

| Setting | What it does | API key? |
|---------|--------------|----------|
| **Google Maps (app)** | Opens your multi-stop route in the installed Google Maps app for turn-by-turn navigation | No |
| **Apple Maps** (iOS) | Opens the route in Apple Maps | No |
| **In-app map preview** | Shows the planned route on OpenStreetMap tiles inside Totus (Pro, after planning) | No |
| **Driving distance (Pro)** | Geocodes stop addresses and calculates road distance via OpenStreetMap data (Nominatim + OSRM) | No |

## Free vs Pro

- **Free:** GPS mileage recording, up to 50 stops, open a **single** stop in Google/Apple Maps, straight-line km estimate.
- **Pro Monthly:** No ads only — does not unlock driving routes, multi-stop maps, or in-app map.
- **Pro Lifetime:** Driving route distance, geocoding, multi-stop Google Maps routing, and in-app OpenStreetMap preview.

## How routing works (default)

1. **Geocoding:** Stop addresses are sent to [Nominatim](https://nominatim.openstreetmap.org/) (OpenStreetMap) with a Totus user-agent. Requests are rate-limited to ~1 per second.
2. **Routing:** Coordinates are sent to the public [OSRM demo server](https://router.project-osrm.org/) for driving distance and route geometry.
3. **Map preview:** `react-native-maps` displays OpenStreetMap raster tiles — no Google Maps SDK key required.

Addresses go **directly from your phone** to these services; Totus Life does not receive them.

## Advanced routing (optional)

Settings → Trip Planner Pro → **Advanced routing** lets power users optionally supply their own **Google Maps** or **Mapbox** API keys for higher geocoding quotas. This is hidden by default and not required for normal use.

See [GOOGLE_MAPS_API_SETUP.md](./GOOGLE_MAPS_API_SETUP.md) if you choose Google API routing.

## Rate limits and reliability

- Nominatim and OSRM public servers are shared demo infrastructure — fine for individual clinicians planning a daily route, but not guaranteed for high-volume automated use.
- If geocoding fails, verify addresses are complete (street, city, state) and wait a moment before retrying.
- For offline or air-gapped use, rely on GPS recording and straight-line estimates instead.

## Platform notes

- **Android:** Default external maps app is **Google Maps (app)**. Multi-stop routes use `https://www.google.com/maps/dir/?api=1` with `origin`, `destination`, and pipe-separated `waypoints`. In-app preview uses OpenStreetMap tiles (no Google Maps SDK key).
- **iOS:** Default external maps app is **Google Maps (app)**. Choose **Apple Maps** in Settings if you prefer.
  - **Google Maps (app), multi-stop (Pro):** Totus opens `comgooglemaps://` with `saddr`, `daddr` waypoints chained via `+to:`, and `directionsmode=driving`. If the Google Maps app is not installed, falls back to the same `https://www.google.com/maps/dir/` URL used on Android.
  - **Apple Maps:** Opens `maps://` with origin and destination (multi-waypoint chaining is not supported by Apple’s URL scheme).
  - **In-app preview:** Same OpenStreetMap tiles as Android — no Mapbox token or Google Maps SDK key.
- **Info.plist:** iOS builds declare `LSApplicationQueriesSchemes` for `comgooglemaps` and `maps` so the app can detect installed maps apps before opening deep links.

Related: [LOCATION_AND_ADDRESS_SECURITY.md](./LOCATION_AND_ADDRESS_SECURITY.md), [PERMISSIONS.md](./PERMISSIONS.md), [USER_GUIDE.md](./USER_GUIDE.md).
