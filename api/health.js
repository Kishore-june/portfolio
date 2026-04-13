module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    status: 'ok',
    email: !!(process.env.GMAIL_USER && process.env.GMAIL_PASS),
    ai:    !!process.env.OPENROUTER_API_KEY,
    ts:    new Date().toISOString()
  });
};
