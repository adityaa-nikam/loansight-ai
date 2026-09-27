const healthCheck = (req, res) => {
  res.json({
    success: true,
    service: 'loanlens-api',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};

module.exports = { healthCheck };
