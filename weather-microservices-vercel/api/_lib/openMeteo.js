async function fetchOpenMeteo({ lat, lon, timezone }) {
  const base = 'https://api.open-meteo.com/v1/forecast';
  const u = new URL(base);
  u.searchParams.set('latitude', lat);
  u.searchParams.set('longitude', lon);
  u.searchParams.set('timezone', timezone || 'UTC');
  // Request a few common hourly variables
  u.searchParams.set('hourly', 'temperature_2m,relative_humidity_2m,precipitation,cloudcover,windspeed_10m');
  // 2 days gives enough context to slice next 24h from "now"
  u.searchParams.set('forecast_days', '2');

  const res = await fetch(u.toString(), { headers: { 'accept': 'application/json' } });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Open-Meteo error ${res.status}: ${t}`);
  }
  const json = await res.json();
  return { url: u.toString(), json };
}

module.exports = { fetchOpenMeteo };
