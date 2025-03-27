/**
 * Setup routes for initial system configuration
 */
const express = require('express');
const { TenantModel } = require('../models');
const pool = require('../config/database');
const authService = require('../services/authService');
const tenantService = require('../services/tenantService');
const { NODE_ENV } = require('../config/environment');

const router = express.Router();
const tenantModel = new TenantModel(pool);

/**
 * @route   POST /setup/initialize
 * @desc    Create the first tenant and admin user
 * @access  Public (but should be secured or disabled in production)
 */
router.post('/initialize', async (req, res) => {
  try {
    // Only allow this endpoint in development or test environments,
    // unless the system has an override flag in the request
    if (NODE_ENV === 'production' && !req.body.override_production) {
      return res.status(403).json({ 
        error: 'This endpoint is disabled in production mode'
      });
    }
    
    const { domain_name, plan_tier, admin_email, admin_password, admin_name } = req.body;
    
    if (!domain_name || !admin_email || !admin_password) {
      return res.status(400).json({ 
        error: 'Domain name, admin email, and admin password are required'
      });
    }
    
    // Check if domain is restricted
    if (tenantService.isRestrictedDomain(domain_name)) {
      return res.status(400).json({
        error: `Cannot create tenant using public email domain '${domain_name}'. Please use a business or organization domain.`
      });
    }
    
    // Check if any tenants already exist
    const tenantCount = await tenantModel.count();
    if (tenantCount > 0) {
      return res.status(400).json({ 
        error: 'System is already initialized'
      });
    }
    
    // Create the first tenant
    const tenant = await tenantModel.create({
      domain_name,
      plan_tier: plan_tier || 'basic'
    });
    
    // Create the admin user
    const adminUser = await authService.registerAdminUser(
      tenant.id,
      admin_email,
      admin_password,
      admin_name
    );
    
    res.status(201).json({
      message: 'System initialized successfully',
      tenant: {
        id: tenant.id,
        domain_name: tenant.domain_name,
        plan_tier: tenant.plan_tier
      },
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Error initializing system:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 