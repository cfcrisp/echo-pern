/**
 * Routes for managing ideas
 */
const express = require('express');
const { IdeaModel, CustomerModel, InitiativeModel } = require('../models');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { createEntityHandler, listEntityHandler, getEntityByIdHandler } = require('../utils/requestHandlers');

const router = express.Router();
const ideaModel = new IdeaModel(pool);
const customerModel = new CustomerModel(pool);
const initiativeModel = new InitiativeModel(pool);

/**
 * @route   GET /ideas
 * @desc    Get all ideas for current tenant
 * @access  Authenticated
 */
router.get('/', authenticate, listEntityHandler(
  ideaModel,
  'findByTenantWithOptions',
  {
    allowedFilters: ['status', 'priority', 'initiative_id', 'customer_id', 'search'],
    defaultSort: 'created_at',
    defaultOrder: 'desc'
  }
));

/**
 * Process a single idea to include customer information
 */
const processIdeaCustomers = async (idea) => {
  if (!idea) return null;
  
  // Get customer associations
  const customerAssociations = await ideaModel.getCustomers(idea.id);
  const customerIds = customerAssociations.map(c => c.customer_id);
  
  // Get customers info
  const customers = await Promise.all(
    customerIds.map(async (customerId) => {
      const customer = await customerModel.findById(customerId);
      return customer ? {
        id: customer.id,
        name: customer.name
      } : null;
    })
  ).then(results => results.filter(c => c !== null));
  
  return { ...idea, customers };
};

/**
 * @route   GET /ideas/:id
 * @desc    Get a specific idea
 * @access  Authenticated
 */
router.get('/:id', authenticate, getEntityByIdHandler(ideaModel, processIdeaCustomers));

/**
 * Custom preprocessor to handle idea creation with customer association
 */
const preprocessIdea = async (ideaData, req) => {
  console.log('Processing idea data (start):', JSON.stringify(ideaData));
  
  // Handle multiple customer IDs if provided
  if (ideaData.customer_ids && Array.isArray(ideaData.customer_ids)) {
    const validCustomerIds = [];
    
    // Validate each customer ID
    for (const customerId of ideaData.customer_ids) {
      if (customerId && customerId.trim() !== '') {
        try {
          // Check if customer exists and belongs to this tenant
          const customer = await customerModel.findById(customerId);
          if (customer && customer.tenant_id === req.tenantId) {
            validCustomerIds.push(customerId);
          } else {
            console.warn(`Invalid customer ID: ${customerId} - not found or wrong tenant`);
          }
        } catch (err) {
          console.error(`Error validating customer ID ${customerId}:`, err);
        }
      }
    }
    
    // Store valid customer IDs for post-processing
    if (validCustomerIds.length > 0) {
      req.customerIds = validCustomerIds;
    }
    
    // Remove customer_ids from ideaData as it's handled separately
    delete ideaData.customer_ids;
  } 
  // For backward compatibility - handle single customer_id
  else if (ideaData.customer_id && ideaData.customer_id.trim() !== '') {
    try {
      // Check if customer exists and belongs to this tenant
      const customer = await customerModel.findById(ideaData.customer_id);
      if (customer && customer.tenant_id === req.tenantId) {
        req.customerIds = [ideaData.customer_id];
      } else {
        console.warn(`Invalid customer ID: ${ideaData.customer_id} - not found or wrong tenant`);
      }
    } catch (err) {
      console.error('Error checking customer:', err);
      throw new Error('Invalid customer ID');
    }
    
    // Remove customer_id from ideaData
    delete ideaData.customer_id;
  }
  
  // Handle initiative ID if provided
  if (ideaData.initiative_id && ideaData.initiative_id !== 'none' && ideaData.initiative_id.trim() !== '') {
    try {
      const initiative = await initiativeModel.findById(ideaData.initiative_id);
      if (!initiative || initiative.tenant_id !== req.tenantId) {
        console.warn(`Invalid initiative ID: ${ideaData.initiative_id} - not found or wrong tenant`);
        delete ideaData.initiative_id; // Remove invalid initiative ID
      }
    } catch (err) {
      console.error('Error checking initiative:', err);
      delete ideaData.initiative_id; // Remove problematic initiative ID
    }
  } else if (ideaData.initiative_id === 'none') {
    delete ideaData.initiative_id; // Remove 'none' placeholder
  }
  
  // Set default values if not provided
  if (!ideaData.status) ideaData.status = 'new';
  if (!ideaData.priority) ideaData.priority = 'medium';
  if (!ideaData.effort) ideaData.effort = 'm';
  if (!ideaData.source) ideaData.source = 'internal';
  
  // Ensure title exists
  if (!ideaData.title) {
    if (ideaData.description) {
      // Use first part of description as title if available
      ideaData.title = ideaData.description.substring(0, 100);
    } else {
      // Use a default title
      ideaData.title = 'New idea ' + new Date().toISOString();
    }
  }
  
  // Ensure description is not null
  if (!ideaData.description) {
    ideaData.description = '';
  }
  
  // Apply tenant ID
  if (req.tenantId) {
    ideaData.tenant_id = req.tenantId;
  }
  
  console.log('Processed idea data (end):', JSON.stringify(ideaData));
  
  return ideaData;
};

/**
 * Custom postprocessor to handle customer association after idea creation
 */
const postprocessIdea = async (idea, req) => {
  // Associate with customers if provided
  if (req.customerIds && req.customerIds.length > 0 && idea) {
    for (const customerId of req.customerIds) {
      try {
        await ideaModel.addCustomer(idea.id, customerId);
        console.log(`Associated idea ${idea.id} with customer ${customerId}`);
      } catch (err) {
        console.error(`Error associating idea with customer ${customerId}:`, err);
        // Continue with other customers even if one fails
      }
    }
    
    // Get customer names for the first customer in the response
    const firstCustomer = await customerModel.findById(req.customerIds[0]);
    if (firstCustomer) {
      idea.customer_id = firstCustomer.id;
      idea.customer_name = firstCustomer.name;
      
      // Add a count of total customers if there are multiple
      if (req.customerIds.length > 1) {
        idea.customer_name += ` (+${req.customerIds.length - 1} more)`;
      }
    }
  }
  
  return idea;
};

/**
 * @route   POST /ideas
 * @desc    Create a new idea
 * @access  Authenticated
 */
router.post('/', authenticate, createEntityHandler(
  ideaModel,
  'ideas',
  {
    preprocessor: preprocessIdea,
    postprocessor: postprocessIdea
  }
));

/**
 * @route   PUT /ideas/:id
 * @desc    Update an idea
 * @access  Authenticated user in same tenant
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      status, 
      priority, 
      effort, 
      customer_id,
      customer_ids,
      initiative_id 
    } = req.body;
    
    // Check if idea exists and belongs to this tenant
    const existingIdea = await ideaModel.findById(id);
    
    if (!existingIdea) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    if (existingIdea.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Process customer IDs - prefer customer_ids array over single customer_id
    let customerIds = [];
    if (customer_ids && Array.isArray(customer_ids)) {
      // Use the array of customer IDs
      for (const cid of customer_ids) {
        if (cid && cid.trim() !== '') {
          // Validate customer existence and tenant
          const customer = await customerModel.findById(cid);
          if (customer && customer.tenant_id === req.user.tenant_id) {
            customerIds.push(cid);
          }
        }
      }
    } else if (customer_id) {
      // For backward compatibility
      const customer = await customerModel.findById(customer_id);
      if (customer && customer.tenant_id === req.user.tenant_id) {
        customerIds.push(customer_id);
      } else {
        return res.status(400).json({ error: 'Invalid customer ID' });
      }
    }
    
    // Check initiative ID if provided
    if (initiative_id && initiative_id !== 'none') {
      const initiative = await initiativeModel.findById(initiative_id);
      if (!initiative || initiative.tenant_id !== req.user.tenant_id) {
        return res.status(400).json({ error: 'Invalid initiative ID' });
      }
    }
    
    // Update the idea
    const updateData = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(effort && { effort }),
      ...(initiative_id && initiative_id !== 'none' && { initiative_id }),
      updated_at: new Date()
    };
    
    // Remove initiative_id if it's set to 'none'
    if (initiative_id === 'none') {
      updateData.initiative_id = null;
    }
    
    const updatedIdea = await ideaModel.update(id, updateData);
    
    // Update customer associations if provided
    if (customerIds.length > 0 && updatedIdea) {
      // Clear existing associations
      const currentCustomers = await ideaModel.getCustomers(id);
      for (const assoc of currentCustomers) {
        await ideaModel.removeCustomer(id, assoc.customer_id);
      }
      
      // Add new associations
      for (const cid of customerIds) {
        await ideaModel.addCustomer(id, cid);
      }
      
      // Get first customer name for response
      const customer = await customerModel.findById(customerIds[0]);
      if (customer) {
        updatedIdea.customer_id = customer.id;
        updatedIdea.customer_name = customer.name;
        
        // Add a count of total customers if there are multiple
        if (customerIds.length > 1) {
          updatedIdea.customer_name += ` (+${customerIds.length - 1} more)`;
        }
      }
    }
    
    res.json(updatedIdea);
  } catch (error) {
    console.error('Error updating idea:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * @route   DELETE /ideas/:id
 * @desc    Delete an idea
 * @access  Authenticated user in same tenant
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if idea exists and belongs to this tenant
    const idea = await ideaModel.findById(id);
    
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }
    
    if (idea.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Delete the idea
    await ideaModel.delete(id);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting idea:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

module.exports = router; 