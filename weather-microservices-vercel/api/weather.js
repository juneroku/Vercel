const { fetchOpenMeteo } = require('./_lib/openMeteo');
require('dotenv').config();

module.exports = async (req, res) => {
  try {
    const lat = parseFloat(process.env.LAT || '13.7563');
    const lon = parseFloat(process.env.LON || '100.5018');
    const timezone = process.env.TIMEZONE || 'Asia/Bangkok';
    const location_name = process.env.LOCATION_NAME || 'Bangkok, TH';

    const { json } = await fetchOpenMeteo({ lat, lon, timezone });
    const hourly = json.hourly || {};
    
    // Get current hour data
    const now = new Date();
    const currentHourIndex = now.getHours();
    
    const weatherData = {
      current: {
        temperature: hourly.temperature_2m ? hourly.temperature_2m[currentHourIndex] : null,
        humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[currentHourIndex] : null,
        wind_speed: hourly.windspeed_10m ? hourly.windspeed_10m[currentHourIndex] : null,
        description: hourly.cloudcover && hourly.cloudcover[currentHourIndex] > 50 ? "Cloudy" : "Clear"
      },
      location: location_name,
      fetched_at: now.toISOString()
    };

    res.setHeader('content-type', 'application/json');
    res.status(200).json({ 
      ok: true, 
      data: weatherData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
