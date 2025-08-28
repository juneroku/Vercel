// Get access to the shared cached weather data
const { cachedWeatherData } = require('./ingest');

module.exports = async (req, res) => {
  try {
    if (!cachedWeatherData) {
      return res.status(404).json({
        ok: false,
        error: "No weather data available. Please run /api/ingest first to fetch the latest weather data."
      });
    }
    
    res.setHeader('content-type', 'application/json');
    res.status(200).json({ 
      ok: true, 
      data: cachedWeatherData
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
