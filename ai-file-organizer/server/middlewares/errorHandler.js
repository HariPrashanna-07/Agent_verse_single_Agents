const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`API Error: ${err.message}`, err);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;
