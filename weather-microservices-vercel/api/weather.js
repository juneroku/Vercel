const { getDb } = require('./_lib/mongo');

module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const limit = Math.max(1, Math.min(50, parseInt(url.searchParams.get('limit') || '1', 10)));
    const db = await getDb();
    const docs = await db
      .collection('weather_readings')
      .find({})
      .sort({ fetched_at: -1 })
      .limit(limit)
      .toArray();

    res.setHeader('content-type', 'application/json');
    res.status(200).end(JSON.stringify({ ok: true, docs }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
};
