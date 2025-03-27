/**
 * Main server file
 */
const express = require('express');
const cors = require('cors');
const { Server } = require('ws');
const { PORT, CORS_ORIGIN } = require('./config/environment');
const pool = require('./config/database');
const { initModels } = require('./models');
const { identifyTenant } = require('./middleware/tenant');
const { errorMiddleware } = require('./utils/errorHandler');

// Import routes
const tenantRoutes = require('./routes/tenantRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const goalRoutes = require('./routes/goalRoutes');
const initiativeRoutes = require('./routes/initiativeRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const commentRoutes = require('./routes/commentRoutes');
const setupRoutes = require('./routes/setupRoutes');

// Initialize Express
const app = express();

// Initialize models
const db = initModels(pool);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Parse allowed origins from environment variable
    const allowedOrigins = CORS_ORIGIN === '*' 
      ? '*' 
      : CORS_ORIGIN.split(',');
    
    // Check if origin is allowed
    if (allowedOrigins === '*' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`Origin ${origin} not allowed by CORS`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/auth', authRoutes);
app.use('/setup', setupRoutes);

// Protected routes with tenant identification
app.use(identifyTenant);
app.use('/tenants', tenantRoutes);
app.use('/users', userRoutes);
app.use('/goals', goalRoutes);
app.use('/initiatives', initiativeRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/comments', commentRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Start the server
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
  console.log(`CORS configured to allow origin: ${CORS_ORIGIN}`);
  
  // Test database connection
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (tablesResult.rows.length === 0) {
      console.warn('⚠️ No tables found in database. You may need to run setup.');
    } else {
      console.log(`✅ Found ${tablesResult.rows.length} tables in database`);
    }
    
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err);
    console.error('This may cause API errors. Check your database configuration.');
  }
});

// WebSocket server for real-time updates
const wss = new Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    // Handle WebSocket messages here
    console.log('Received message:', message);
  });
  
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

module.exports = { app, server };
