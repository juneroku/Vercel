# Weather Micro-services on Vercel (Open‑Meteo + MongoDB)

A tiny micro-services web app that automatically retrieves weather data from the **Open‑Meteo** public API, saves it to **MongoDB (Atlas)**, and displays the latest data on a pretty dashboard. Built to deploy on **Vercel**.

## Architecture (micro-services)
- **/api/ingest** – serverless function that fetches weather from Open‑Meteo and **inserts** into MongoDB.
- **/api/weather** – serverless function that **reads** the latest record(s) from MongoDB.
- **/api/health** – simple health check for monitoring.
- **Static UI (`index.html`)** – dashboard (Tailwind + Chart.js) that calls `/api/weather`.
- **vercel.json (cron)** – runs `/api/ingest` **hourly** in production via Vercel Cron.

> You can think of each serverless function as a small service: an **ingestor**, a **reader**, and a **health** endpoint.

## Deploy (Vercel)
1. Create a new **MongoDB Atlas** cluster (free tier is fine). Get the **connection string** (e.g., `mongodb+srv://...`).
2. Create a new **Vercel** project and import this folder.
3. In **Vercel → Project Settings → Environment Variables**, set:
   - `MONGODB_URI` = your Atlas Connection String
   - `DB_NAME` = `weatherdb` (or your preferred name)
   - `LOCATION_NAME` = `Bangkok, TH` (or any)
   - `LAT` = `13.7563`
   - `LON` = `100.5018`
   - `TIMEZONE` = `Asia/Bangkok`
4. Deploy. Vercel will serve `index.html` and the serverless functions. The **cron** in `vercel.json` will call `/api/ingest` **every hour** automatically.
5. (Optional) Trigger an initial load by calling `https://<your-app>.vercel.app/api/ingest` once after deploy.

## Local Dev
```bash
npm install
# Use vercel dev if you have the Vercel CLI
# vercel dev

# Or test functions quickly with curl once deployed:
# curl https://<your-app>.vercel.app/api/ingest
# curl https://<your-app>.vercel.app/api/weather?limit=1
```

## Data Model
Each run of `/api/ingest` stores a document in the `weather_readings` collection like:
```jsonc
{
  "provider": "open-meteo",
  "location": { "name": "Bangkok, TH", "latitude": 13.7563, "longitude": 100.5018, "timezone": "Asia/Bangkok" },
  "fetched_at": "2025-08-28T13:00:00.000Z",
  "hourly": [
    {"time": "2025-08-28T08:00:00Z", "temperature_2m": 29.4, "relative_humidity_2m": 70, "precipitation": 0, "cloudcover": 40, "windspeed_10m": 3.2},
    ...
  ]
}
```

## Notes
- The **Open‑Meteo** API is free and does not require an API key. We request hourly series and store it raw-ish for flexibility.
- If you want more variables, add them in `api/_lib/openMeteo.js` under the `hourly=` parameter.
- For multiple locations, you can create **multiple projects** or extend `/api/ingest` to loop over a list.

Enjoy! 🚀
