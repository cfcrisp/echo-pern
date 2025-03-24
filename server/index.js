const express = require('express');
const { Server } = require('ws');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.EXPRESS_PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Create WebSocket server
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const msg = message.toString();
    console.log(`Received: ${msg}`);

    // Store message in PostgreSQL
    try {
      await pool.query('INSERT INTO messages (content) VALUES ($1)', [msg]);
    } catch (err) {
      console.error('Database error:', err);
    }

    // Echo the message back to the client
    ws.send(`Echo: ${msg}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Basic HTTP route
app.get('/', (req, res) => {
  res.send('Echo Server is running');
});

// New route to fetch tenants
app.get('/tenants', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tenants');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tenants:', err);
    res.status(500).send('Error fetching tenants');
  }
});
