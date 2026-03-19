# CrownCast

CrownCast is a mobile-first weather and beauty utility app that translates daily weather conditions into practical hairstyle decisions for Black women.

## Stack

- React + Vite + TypeScript
- OpenWeather API
- Google Places API (Text Search)

## Features

- Daily hair risk assessment based on humidity, rain, and wind
- Personalized hair profile and style preferences with local persistence
- 3-day style planner
- Beauty supply locator with product search and filters
- Hair Emergency mode with weather-aware shopping guidance
- Saved stores list for quick access
- Mock fallback data when APIs are unavailable

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Set:

- `OPENWEATHER_API_KEY`
- `GOOGLE_MAPS_API_KEY`

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Dependency Installation Troubleshooting

If `npm install` fails due to registry restrictions:

```bash
npm config get registry
npm config set registry https://registry.npmjs.org/
npm cache clean --force
npm install
```

If you are behind a company VPN/proxy, you may need to disable it temporarily.
