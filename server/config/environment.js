/**
 * Environment configuration
 */
require('dotenv').config();

module.exports = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.EXPRESS_PORT || 3000,
  
  // Database configuration
  DB_USER: process.env.DB_USER,
  DB_HOST: process.env.DB_HOST,
  DB_DATABASE: process.env.DB_DATABASE,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_PORT: process.env.DB_PORT,
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  
  // Other configurations
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
}; 