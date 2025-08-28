const { getDb } = require('./_lib/mongo');
const { fetchOpenMeteo } = require('./_lib/openMeteo');

module.exports = async (req, res) => {
  try {
    const lat = parseFloat(process.env.LAT || '13.7563');
    const lon = parseFloat(process.env.LON || '100.5018');
    const timezone = process.env.TIMEZONE || process.env.TZ || 'Asia/Bangkok';
    const location_name = process.env.LOCATION_NAME || 'Bangkok, TH';

    const { url, json } = await fetchOpenMeteo({ lat, lon, timezone });

    const hourly = json.hourly || {};
    const length = (hourly.time && hourly.time.length) || 0;
    const rows = [];

    for (let i = 0; i < length; i++) {
      rows.push({
        time: hourly.time[i],
        temperature_2m: hourly.temperature_2m ? hourly.temperature_2m[i] : null,
        relative_humidity_2m: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[i] : null,
        precipitation: hourly.precipitation ? hourly.precipitation[i] : null,
        cloudcover: hourly.cloudcover ? hourly.cloudcover[i] : null,
        windspeed_10m: hourly.windspeed_10m ? hourly.windspeed_10m[i] : null,
      });
    }

    const doc = {
      provider: 'open-meteo',
      provider_url: url,
      location: { name: location_name, latitude: lat, longitude: lon, timezone },
      fetched_at: new Date(),
      hourly: rows
    };

    const db = await getDb();
    const result = await db.collection('weather_readings').insertOne(doc);
    res.status(200).json({ ok: true, insertedId: result.insertedId, count: rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
