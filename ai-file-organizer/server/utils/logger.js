const logger = {
  info: (msg, data = '') => console.log(`[INFO] [${new Date().toISOString()}] ${msg}`, data ? JSON.stringify(data) : ''),
  warn: (msg, data = '') => console.warn(`[WARN] [${new Date().toISOString()}] ${msg}`, data ? JSON.stringify(data) : ''),
  error: (msg, error = '') => console.error(`[ERROR] [${new Date().toISOString()}] ${msg}`, error?.stack || error || '')
};

module.exports = logger;
