/**
 * Tenant routes
 */
const express = require('express');
const { TenantModel } = require('../models');
const pool = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');
const tenantService = require('../services/tenantService');

const router = express.Router();
const tenantModel = new TenantModel(pool);

/**
 * @route   GET /tenants
 * @desc    Get all tenants (admin only)
 * @access  Admin
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const tenants = await tenantModel.getTenantsWithUserCounts();
    res.json(tenants);
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /tenants/:id
 * @desc    Get a tenant by ID
 * @access  Admin
 */
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const tenant = await tenantModel.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    res.json(tenant);
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /tenants
 * @desc    Create a new tenant
 * @access  Admin
 */
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { domain_name } = req.body;
    
    // Check if domain is restricted
    if (tenantService.isRestrictedDomain(domain_name)) {
      return res.status(400).json({
        error: `Cannot create tenant using public email domain '${domain_name}'. Please use a business or organization domain.`
      });
    }
    
    // Check if domain already exists
    const existingTenant = await tenantModel.findByDomain(req.body.domain_name);
    if (existingTenant) {
      return res.status(400).json({ error: 'Domain name already in use' });
    }
    
    const newTenant = await tenantModel.create(req.body);
    res.status(201).json(newTenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /tenants/:id
 * @desc    Update a tenant
 * @access  Admin
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const tenant = await tenantModel.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Check if updating domain and if it already exists
    if (req.body.domain_name && req.body.domain_name !== tenant.domain_name) {
      const existingTenant = await tenantModel.findByDomain(req.body.domain_name);
      if (existingTenant) {
        return res.status(400).json({ error: 'Domain name already in use' });
      }
    }
    
    const updatedTenant = await tenantModel.update(req.params.id, req.body);
    res.json(updatedTenant);
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /tenants/:id/plan
 * @desc    Update a tenant's plan tier
 * @access  Admin
 */
router.put('/:id/plan', authenticate, requireAdmin, async (req, res) => {
  try {
    const { plan_tier } = req.body;
    
    if (!plan_tier) {
      return res.status(400).json({ error: 'Plan tier is required' });
    }
    
    const tenant = await tenantModel.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const updatedTenant = await tenantModel.updatePlanTier(req.params.id, plan_tier);
    res.json(updatedTenant);
  } catch (error) {
    console.error('Error updating tenant plan:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /tenants/:id
 * @desc    Delete a tenant
 * @access  Admin
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const tenant = await tenantModel.findById(req.params.id);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    await tenantModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 