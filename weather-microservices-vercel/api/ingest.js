require('dotenv').config();
const { fetchOpenMeteo } = require('./_lib/openMeteo');

let cachedWeatherData = null;

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
    const currentWeather = {
      temperature: hourly.temperature_2m ? hourly.temperature_2m[currentHour] : 20,
      humidity: hourly.relative_humidity_2m ? hourly.relative_humidity_2m[currentHour] : 65,
      wind_speed: hourly.windspeed_10m ? hourly.windspeed_10m[currentHour] : 10,
      description: hourly.cloudcover && hourly.cloudcover[currentHour] > 50 ? "Cloudy" : "Clear",
      location: location_name,
      fetched_at: new Date().toISOString()
    };

    // Cache the weather data globally
    cachedWeatherData = currentWeather;
    
    res.status(200).json({ 
      ok: true, 
      data: currentWeather,
      message: "Weather data updated successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
