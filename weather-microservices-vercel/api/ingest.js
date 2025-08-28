const { fetchOpenMeteo } = require('./_lib/openMeteo');
require('dotenv').config();

module.exports = async (req, res) => {
  try {
    // Get environment variables with Bangkok defaults
    const lat = parseFloat(process.env.LAT || '13.7563');
    const lon = parseFloat(process.env.LON || '100.5018');
    const timezone = process.env.TIMEZONE || 'Asia/Bangkok';
    const location_name = process.env.LOCATION_NAME || 'Bangkok, TH';
    
    // Debug logging
    console.log('Environment variables:', {
      LAT: process.env.LAT,
      LON: process.env.LON,
      TIMEZONE: process.env.TIMEZONE,
      LOCATION_NAME: process.env.LOCATION_NAME
    });

    const { url, json } = await fetchOpenMeteo({ lat, lon, timezone });

    const hourly = json.hourly || {};
    const currentHour = new Date().getHours();
    
    // Get current weather
    // Process hourly data for next 24 hours
    const next24Hours = [];
    const now = new Date();
    const currentHourIndex = now.getHours();
    
    for (let i = 0; i < 24; i++) {
      const hourIndex = (currentHourIndex + i) % 24;
      if (hourly.time && hourly.time.length > hourIndex) {
        next24Hours.push({
          time: hourly.time[hourIndex],
          temperature: hourly.temperature_2m ? hourly.temperature_2m[hourIndex] : null,
          humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[hourIndex] : null,
          wind_speed: hourly.windspeed_10m ? hourly.windspeed_10m[hourIndex] : null
        });
      }
    }

    const weatherData = {
      current: {
        temperature: hourly.temperature_2m ? hourly.temperature_2m[currentHourIndex] : null,
        humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[currentHourIndex] : null,
        wind_speed: hourly.windspeed_10m ? hourly.windspeed_10m[currentHourIndex] : null,
        description: hourly.cloudcover && hourly.cloudcover[currentHourIndex] > 50 ? "Cloudy" : "Clear"
      },
      location: location_name,
      fetched_at: now.toISOString(),
      forecast: next24Hours
    };
    
    res.status(200).json({ 
      ok: true, 
      data: weatherData,
      message: "Weather data fetched successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
