/**
 * Tenant middleware for multi-tenancy
 */
const { TenantModel } = require('../models');
const pool = require('../config/database');
const tenantService = require('../services/tenantService');

// Create tenant model instance
const tenantModel = new TenantModel(pool);

/**
 * Middleware to determine the current tenant from the domain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const identifyTenant = async (req, res, next) => {
  try {
    // If tenant is already set by auth middleware, proceed
    if (req.tenantId) {
      return next();
    }

    // Get the host from request
    const host = req.get('host').split(':')[0]; // Remove port if present
    
    // Find tenant by domain
    const tenant = await tenantModel.findByDomain(host);
    
    if (!tenant) {
      return res.status(404).json({ 
        error: 'Tenant not found' 
      });
    }
    
    // Set tenant ID in request
    req.tenantId = tenant.id;
    req.tenant = tenant;
    
    next();
  } catch (error) {
    console.error('Tenant identification error:', error);
    res.status(500).json({ 
      error: 'Server error during tenant identification' 
    });
  }
};

/**
 * Middleware to identify tenant based on email in request
 * Useful for public endpoints where tenant needs to be determined
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const identifyTenantFromEmail = async (req, res, next) => {
  try {
    // If tenant is already set, proceed
    if (req.tenantId) {
      return next();
    }
    
    // Get email from request body
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email is required to identify tenant'
      });
    }
    
    try {
      // Get tenant for this email domain
      const tenant = await tenantService.getTenantForEmail(email);
      
      if (!tenant) {
        return res.status(404).json({
          error: 'No tenant found for this email domain'
        });
      }
      
      // Set tenant ID in request
      req.tenantId = tenant.id;
      req.tenant = tenant;
      
      next();
    } catch (error) {
      if (error.message.includes('Invalid email format')) {
        return res.status(400).json({
          error: 'Invalid email format'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Tenant email identification error:', error);
    res.status(500).json({
      error: 'Server error during tenant identification'
    });
  }
};

/**
 * Middleware to restrict access based on tenant plan tier
 * @param {Array} allowedTiers - Array of plan tiers allowed to access
 * @returns {Function} Middleware function
 */
const requirePlanTier = (allowedTiers) => {
  return (req, res, next) => {
    try {
      // Ensure tenant is available
      if (!req.tenant) {
        return res.status(500).json({ 
          error: 'Tenant not identified' 
        });
      }
      
      // Check if tenant's plan tier is in allowed tiers
      if (!allowedTiers.includes(req.tenant.plan_tier)) {
        return res.status(403).json({ 
          error: `This feature requires a plan upgrade (current: ${req.tenant.plan_tier}, required: ${allowedTiers.join(' or ')})` 
        });
      }
      
      next();
    } catch (error) {
      console.error('Plan tier check error:', error);
      res.status(500).json({ 
        error: 'Server error during plan tier check' 
      });
    }
  };
};

module.exports = {
  identifyTenant,
  identifyTenantFromEmail,
  requirePlanTier
}; 