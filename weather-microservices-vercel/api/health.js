module.exports = async (_req, res) => {
  res.status(200).json({ ok: true, status: 'healthy', time: new Date().toISOString() });
};
