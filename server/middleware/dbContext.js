/**
 * Database context middleware
 * Attaches database models to the request object
 */
const { initModels } = require('../models');
const pool = require('../config/database');

/**
 * Middleware to attach DB models to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const attachDbContext = (req, res, next) => {
  // Initialize models with database connection pool
  req.db = initModels(pool);
  
  // Add user ID if available from auth
  if (req.user) {
    req.userId = req.user.id;
  }
  
  next();
};

module.exports = {
  attachDbContext
}; 