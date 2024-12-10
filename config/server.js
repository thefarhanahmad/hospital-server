require('dotenv').config();
const logger = require('../utils/logger');

const config = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  isProduction: process.env.NODE_ENV === 'production'
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

module.exports = config;