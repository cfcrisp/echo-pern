/**
 * Tenant middleware for multi-tenancy
 */
const { TenantModel } = require('../models');
const pool = require('../config/database');
const tenantService = require('../services/tenantService');

// Create tenant model instance
const tenantModel = new TenantModel(pool);

/**
 * Extract tenant ID from various sources - headers, cookies, etc.
 * This function tries multiple methods to get the tenant ID
 * @param {Object} req - Express request object
 * @returns {String|null} Tenant ID if found, null otherwise
 */
const extractTenantId = (req) => {
  // Log request details for debugging
  console.log('Extracting tenant ID from request:', {
    path: req.path,
    method: req.method,
    headers: {
      'x-tenant-id': req.headers['x-tenant-id'] || 'not present',
      cookie: req.headers.cookie ? 'Present' : 'Not present'
    }
  });
  
  if (req.headers.cookie) {
    console.log('Cookie header content:', req.headers.cookie);
  }
  
  // Log cookies object for debugging
  if (req.cookies) {
    console.log('Cookies object:', req.cookies);
  } else {
    console.log('No cookies object found in request');
  }
  
  // Try different methods to get tenant ID
  
  // 1. From X-Tenant-ID header
  if (req.headers['x-tenant-id']) {
    console.log('Found tenant ID in header:', req.headers['x-tenant-id']);
    return req.headers['x-tenant-id'];
  }
  
  // 2. From URL query parameter
  if (req.query.tenantId) {
    console.log('Found tenant ID in query parameter:', req.query.tenantId);
    return req.query.tenantId;
  }
  
  // 3. From cookie
  if (req.cookies && req.cookies.tenant_id) {
    console.log('Found tenant ID in cookie:', req.cookies.tenant_id);
    return req.cookies.tenant_id;
  }
  
  // Attempt to parse tenant_id cookie manually if cookies object not populated
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});
    
    if (cookies.tenant_id) {
      console.log('Found tenant ID in manually parsed cookie:', cookies.tenant_id);
      return cookies.tenant_id;
    }
  }
  
  // 4. From body for POST/PUT requests
  if (req.body && req.body.tenant_id) {
    console.log('Found tenant ID in request body:', req.body.tenant_id);
    return req.body.tenant_id;
  }
  
  // 5. From user object (if authenticated)
  if (req.user && req.user.tenant_id) {
    console.log('Found tenant ID in user object:', req.user.tenant_id);
    return req.user.tenant_id;
  }
  
  // 6. Check if it's directly set on the request object
  if (req.tenantId) {
    console.log('Found tenant ID already set on request object:', req.tenantId);
    return req.tenantId;
  }
  
  console.log('No tenant ID found in request');
  return null;
};

/**
 * Middleware to determine the current tenant from the domain
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const identifyTenant = async (req, res, next) => {
  try {
    const isDevMode = process.env.NODE_ENV === 'development';
    
    // If tenant is already set by auth middleware, proceed
    if (req.tenantId) {
      if (isDevMode) {
        console.log(`TENANT: Using existing ID ${req.tenantId.substring(0, 8)}`);
      }
      return next();
    }

    if (isDevMode) {
      console.log(`TENANT: Identifying for ${req.method} ${req.path}`);
    }

    // First, try to extract tenant ID from various sources
    const extractedTenantId = extractTenantId(req);
    
    if (extractedTenantId) {
      try {
        const tenant = await tenantModel.findById(extractedTenantId);
        
        if (tenant) {
          if (isDevMode) {
            console.log(`TENANT: Verified ${tenant.id.substring(0, 8)}`);
          }
          req.tenantId = tenant.id;
          req.tenant = tenant;
          return next();
        }
      } catch (err) {
        if (isDevMode) {
          console.error(`TENANT: Error finding ID ${extractedTenantId.substring(0, 8)}`);
        }
      }
    }

    // Try to find tenant by domain if no tenant ID found
    try {
      const host = req.get('host')?.split(':')[0] || 'localhost'; // Remove port if present
      
      if (isDevMode) {
        console.log(`TENANT: Looking up by domain ${host}`);
      }
      
      let tenant = await tenantModel.findByDomain(host);
      
      if (tenant) {
        if (isDevMode) {
          console.log(`TENANT: Found by domain ${tenant.id.substring(0, 8)}`);
        }
        req.tenantId = tenant.id;
        req.tenant = tenant;
        return next();
      }
    } catch (err) {
      if (isDevMode) {
        console.error('TENANT: Error finding by domain');
      }
    }
    
    // Hard-code tenant ID for development if needed
    if (isDevMode) {
      const developmentTenantId = 'b6fe3d49-d56b-4645-b885-03bb73b723af';
      if (isDevMode) {
        console.log(`TENANT: Using development ID ${developmentTenantId.substring(0, 8)}`);
      }
      req.tenantId = developmentTenantId;
      next();
      return;
    }
    
    // For these specific endpoints, return empty data instead of error
    const emptyDataEndpoints = ['/ideas', '/feedback', '/customers', '/goals', '/initiatives'];
    const path = req.path.split('?')[0]; // Remove query params
    
    // Check if this is a GET request to one of the empty data endpoints
    if (req.method === 'GET' && emptyDataEndpoints.includes(path)) {
      if (isDevMode) {
        console.log(`TENANT: Returning empty array for ${path}`);
      }
      return res.json([]);
    }
    
    return res.status(404).json({ 
      error: 'Tenant not found',
      message: 'Could not identify tenant for this request'
    });
  } catch (error) {
    console.error('TENANT: Identification error:', error);
    res.status(500).json({ 
      error: 'Server error during tenant identification',
      details: error.message 
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
  requirePlanTier,
  extractTenantId
}; 