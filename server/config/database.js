/**
 * Database configuration for PostgreSQL
 */
const { Pool } = require('pg');
require('dotenv').config();

// Log database connection parameters (excluding password)
console.log('Database configuration:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  // Not logging password for security
});

// Create a new connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on PostgreSQL client', err);
  process.exit(-1);
});

// Verify connection
(async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connection successful');
    client.release();
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
  }
})();

module.exports = pool; 