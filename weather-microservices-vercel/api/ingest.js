const { fetchOpenMeteo } = require('./_lib/openMeteo');

let cachedWeatherData = null;

module.exports = async (req, res) => {
  try {
    const lat = 13.7563;  // Bangkok coordinates
    const lon = 100.5018;
    const timezone = 'Asia/Bangkok';
    const location_name = 'Bangkok, TH';

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
