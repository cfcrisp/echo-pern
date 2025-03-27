/**
 * Initiative routes
 */
const express = require('express');
const { InitiativeModel } = require('../models');
const pool = require('../config/database');
const { authenticate, authorizeInitiativeAccess } = require('../middleware/auth');
const { createEntityHandler, listEntityHandler, getEntityByIdHandler } = require('../utils/requestHandlers');

const router = express.Router();
const initiativeModel = new InitiativeModel(pool);

/**
 * @route   GET /initiatives/:id
 * @desc    Get an initiative by ID
 * @access  Members of the tenant or admin
 */
router.get('/:id', authenticate, authorizeInitiativeAccess, getEntityByIdHandler(initiativeModel));

/**
 * @route   PUT /initiatives/:id
 * @desc    Update an initiative
 * @access  Members of the tenant or admin
 */
router.put('/:id', authenticate, authorizeInitiativeAccess, async (req, res) => {
  try {
    const initiative = await initiativeModel.findById(req.params.id);
    
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    
    // Ensure user belongs to the same tenant as the initiative
    // (authorizeInitiativeAccess middleware has already checked this,
    // but we'll verify again for data integrity)
    if (initiative.tenant_id !== req.user.tenant_id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to update this initiative' });
    }
    
    const updatedInitiative = await initiativeModel.update(req.params.id, req.body);
    res.json(updatedInitiative);
  } catch (error) {
    console.error('Error updating initiative:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /initiatives/:id
 * @desc    Delete an initiative
 * @access  Members of the tenant or admin
 */
router.delete('/:id', authenticate, authorizeInitiativeAccess, async (req, res) => {
  try {
    const initiative = await initiativeModel.findById(req.params.id);
    
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    
    // Ensure user belongs to the same tenant as the initiative
    // (authorizeInitiativeAccess middleware has already checked this,
    // but we'll verify again for data integrity)
    if (initiative.tenant_id !== req.user.tenant_id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to delete this initiative' });
    }
    
    await initiativeModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting initiative:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Preprocess function for initiative creation to ensure tenant association
 */
const preprocessInitiative = async (data, req) => {
  console.log('Preprocessing initiative data:', data);
  
  // Always ensure tenant_id is set correctly from the authenticated user
  return {
    ...data,
    tenant_id: req.user.tenant_id
  };
};

/**
 * @route   POST /initiatives
 * @desc    Create a new initiative
 * @access  Authenticated users within a tenant
 */
router.post('/', authenticate, createEntityHandler(
  initiativeModel, 
  ['title', 'status', 'priority'],
  preprocessInitiative
));

/**
 * @route   GET /initiatives
 * @desc    Get all initiatives for the current tenant
 * @access  Authenticated
 */
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('GET /initiatives request received with:');
    console.log('User:', req.user ? `ID: ${req.user.id}, Tenant: ${req.user.tenant_id}` : 'No user');
    console.log('Tenant ID from request:', req.tenantId);
    
    // Use the standard handler as a function
    const handler = listEntityHandler(
      initiativeModel,
      'findByTenantWithOptions',
      {
        allowedFilters: ['status', 'priority', 'goal_id', 'search'],
        defaultSort: 'created_at',
        defaultOrder: 'desc'
      }
    );
    
    // Call the handler manually
    await handler(req, res);
  } catch (error) {
    console.error('Error in GET /initiatives:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router; 