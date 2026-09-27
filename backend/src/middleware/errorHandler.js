const config = require('../config');

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (config.nodeEnv === 'development') {
    console.error(`[Error] ${statusCode} — ${message}`);
    if (statusCode === 500) {
      console.error(err.stack);
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && statusCode === 500 && { stack: err.stack }),
  });
};

module.exports = errorHandler;
