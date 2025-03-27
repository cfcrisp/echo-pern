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
const { attachDbContext } = require('./middleware/dbContext');
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
const ideaRoutes = require('./routes/ideaRoutes');
const customerRoutes = require('./routes/customerRoutes');

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  exposedHeaders: ['X-Tenant-ID'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Manual cookie parser - improved version
app.use((req, res, next) => {
  req.cookies = {};
  const cookieHeader = req.headers.cookie;
  
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts[1].trim();
        req.cookies[key] = value;
        
        // Special handling for tenant_id cookie
        if (key === 'tenant_id' && !req.tenantId) {
          req.tenantId = value;
        }
      }
    });
    
    // Only log cookie info in development mode
    if (process.env.NODE_ENV === 'development' && req.cookies.tenant_id) {
      console.log(`Cookie tenant_id: ${req.cookies.tenant_id}`);
    }
  }
  next();
});

// Debugging middleware to log request details
app.use((req, res, next) => {
  // Only log the first line with method and URL, no need for verbose headers
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Only log important headers
  const importantHeaders = {
    'authorization': req.headers.authorization ? 'Present' : 'Missing',
    'x-tenant-id': req.headers['x-tenant-id'] || 'None'
  };
  
  // Only log these if in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth:', importantHeaders.authorization);
    console.log('Tenant:', importantHeaders['x-tenant-id']);
    
    // Log body for POST/PUT but limit size
    if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
      const { password, ...safeBody } = req.body;
      console.log('Body:', JSON.stringify(safeBody).substring(0, 200));
    }
  }
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Debug endpoint for development
app.get('/debug/goals', async (req, res) => {
  try {
    const tenantId = req.query.tenant_id || 'b6fe3d49-d56b-4645-b885-03bb73b723af';
    console.log(`Debug goals request for tenant: ${tenantId}`);
    
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM goals WHERE tenant_id = $1 LIMIT 10',
      [tenantId]
    );
    
    console.log(`Found ${result.rows.length} goals`);
    
    // Check if initiatives table exists and has entries
    const initiativesCheck = await client.query(
      'SELECT COUNT(*) FROM initiatives WHERE tenant_id = $1',
      [tenantId]
    );
    
    client.release();
    
    res.json({
      goals: result.rows,
      initiatives_count: parseInt(initiativesCheck.rows[0].count, 10)
    });
  } catch (err) {
    console.error('Debug endpoint error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Routes
app.use('/auth', authRoutes);
app.use('/setup', setupRoutes);

// Protected routes with tenant identification
app.use(identifyTenant);
// Attach DB context to request
app.use(attachDbContext);
app.use('/tenants', tenantRoutes);
app.use('/users', userRoutes);
app.use('/goals', goalRoutes);
app.use('/initiatives', initiativeRoutes);
app.use('/ideas', ideaRoutes);
app.use('/customers', customerRoutes);
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
