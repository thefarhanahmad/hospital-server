const logger = {
  info: (message) => console.log(`[INFO] ${message}`),
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  debug: (message) => process.env.NODE_ENV === 'development' && console.log(`[DEBUG] ${message}`)
};

module.exports = logger;