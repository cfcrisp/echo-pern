/**
 * Customer routes
 */
const express = require('express');
const { CustomerModel } = require('../models');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { createEntityHandler, listEntityHandler, getEntityByIdHandler } = require('../utils/requestHandlers');

const router = express.Router();
const customerModel = new CustomerModel(pool);

/**
 * @route   GET /customers
 * @desc    Get all customers for current tenant
 * @access  Authenticated
 */
router.get('/', authenticate, listEntityHandler(
  customerModel,
  'findByTenantWithOptions',
  {
    allowedFilters: ['status', 'search'],
    defaultSort: 'name',
    defaultOrder: 'asc'
  }
));

/**
 * @route   GET /customers/:id
 * @desc    Get a customer by ID
 * @access  Authenticated
 */
router.get('/:id', authenticate, getEntityByIdHandler(customerModel));

/**
 * @route   POST /customers
 * @desc    Create a new customer
 * @access  Authenticated
 */
router.post('/', authenticate, createEntityHandler(
  customerModel, 
  ['name', 'status']
));

/**
 * @route   PUT /customers/:id
 * @desc    Update a customer
 * @access  Authenticated
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, revenue } = req.body;
    
    // Check if customer exists and belongs to this tenant
    const customer = await customerModel.findById(id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    if (customer.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Process revenue if it's a formatted string
    let processedRevenue = revenue;
    if (revenue && typeof revenue === 'string') {
      // Remove currency symbols, commas, and other non-numeric characters
      const cleanRevenue = revenue.replace(/[^-\d.]/g, '');
      
      // Convert to a numeric value if it's a valid number
      if (!isNaN(parseFloat(cleanRevenue))) {
        processedRevenue = parseFloat(cleanRevenue);
        console.log(`Converted revenue from "${revenue}" to ${processedRevenue}`);
      } else if (revenue.trim() === '') {
        // If it's an empty string after cleaning, set to null
        processedRevenue = null;
      }
    }
    
    // Update the customer
    const updateData = {
      ...(name !== undefined && { name }),
      ...(status !== undefined && { status }),
      ...(revenue !== undefined && { revenue: processedRevenue }),
      updated_at: new Date()
    };
    
    const updatedCustomer = await customerModel.update(id, updateData);
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * @route   DELETE /customers/:id
 * @desc    Delete a customer
 * @access  Authenticated
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if customer exists and belongs to this tenant
    const customer = await customerModel.findById(id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    if (customer.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete the customer
    await customerModel.delete(id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router; 