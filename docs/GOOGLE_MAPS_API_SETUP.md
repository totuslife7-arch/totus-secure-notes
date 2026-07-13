# Google Maps API Setup (Advanced, Optional)

> **Most users do not need this.** Trip Planner Pro works without any API keys using OpenStreetMap (Nominatim + OSRM). See [TRIP_MAPS.md](./TRIP_MAPS.md).

Optional Google Maps credentials are for **Advanced routing** in Settings → Trip Planner Pro when you want Google's geocoding/directions instead of the default OSRM service.

## What the app calls (advanced mode only)

| Feature | Google API |
|---------|------------|
| Convert stop addresses to coordinates | **Geocoding API** |
| Calculate driving route distance and polyline | **Directions API** |

The app does **not** call Places, Distance Matrix, Roads, Routes, Route Optimization, Maps JavaScript, or Static Maps APIs.

## Enable advanced Google routing

1. Create a restricted API key in [Google Cloud Console](https://console.cloud.google.com/apis/library).
2. Enable **Geocoding API** and **Directions API**.
3. Restrict the key to those APIs and your app fingerprint (package `com.totuslife.TotusSecureNotes`).
4. In Totus: **Settings → Trip Planner Pro → Advanced routing → Google Maps API**.
5. Paste the key and tap **Save API key**.

The key is stored in device SecureStore. Addresses are sent directly from the phone to Google; they do not pass through Totus servers.

## Common errors

| Message | Likely cause |
|---------|--------------|
| `Google Maps route planning was denied` | API key restriction mismatch, billing disabled, or APIs not enabled |
| `Could not geocode` | Address not found or Geocoding API unavailable for the key |
| `quota was exceeded` | Google Cloud quota/billing limit reached |

Related: [TRIP_MAPS.md](./TRIP_MAPS.md), [LOCATION_AND_ADDRESS_SECURITY.md](./LOCATION_AND_ADDRESS_SECURITY.md).
