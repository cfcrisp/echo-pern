/**
 * Feedback routes
 */
const express = require('express');
const { FeedbackModel, CommentModel } = require('../models');
const pool = require('../config/database');
const { authenticate, authorizeFeedbackAccess } = require('../middleware/auth');
const { createEntityHandler, listEntityHandler, getEntityByIdHandler } = require('../utils/requestHandlers');

const router = express.Router();
const feedbackModel = new FeedbackModel(pool);
const commentModel = new CommentModel(pool);

// Process feedback with comments
const processFeedbackComments = async (feedback) => {
  if (!feedback) return null;
  
  try {
    // Get associated customers
    const customers = await feedbackModel.getCustomers(feedback.id);
    
    // Get associated initiatives
    const initiatives = await feedbackModel.getInitiatives(feedback.id);
    
    // Get comments
    const comments = await commentModel.findByEntity('feedback', feedback.id);
    
    return {
      ...feedback,
      customers,
      initiatives,
      comments
    };
  } catch (error) {
    console.error('Error processing feedback comments:', error);
    return feedback;
  }
};

/**
 * @route   GET /feedback
 * @desc    Get all feedback for current tenant
 * @access  Authenticated
 */
router.get('/', authenticate, listEntityHandler(
  feedbackModel,
  'findByTenantWithOptions',
  {
    allowedFilters: ['sentiment', 'search'],
    defaultSort: 'created_at',
    defaultOrder: 'desc'
  }
));

/**
 * @route   GET /feedback/:id
 * @desc    Get a feedback by ID
 * @access  Members of the tenant or admin
 */
router.get('/:id', authenticate, authorizeFeedbackAccess, getEntityByIdHandler(
  feedbackModel, 
  processFeedbackComments
));

// Pre-process feedback data before creation
const preprocessFeedback = async (req, data) => {
  // Ensure tenant ID is set
  if (req.user && req.user.tenant_id) {
    data.tenant_id = req.user.tenant_id;
  }

  // Handle content/title relationship
  if (data.content && !data.title) {
    data.title = data.content;
  }
  delete data.content;

  // Store customer/initiative IDs for post-processing
  if (data.customer_id) {
    req.customerId = data.customer_id;
    delete data.customer_id;
  }

  if (data.customer_ids) {
    req.customerIds = data.customer_ids;
    delete data.customer_ids;
  }

  if (data.initiative_id) {
    req.initiativeId = data.initiative_id;
    delete data.initiative_id;
  }

  if (data.initiative_ids) {
    req.initiativeIds = data.initiative_ids;
    delete data.initiative_ids;
  }

  // Only allow specific fields
  const validFeedbackData = {
    title: data.title,
    description: data.description || null,
    sentiment: data.sentiment || null,
    tenant_id: data.tenant_id
  };

  return validFeedbackData;
};

// Post-process feedback after creation
const postProcessFeedbackCreate = async (req, feedback) => {
  try {
    // Handle customer associations
    if (req.customerId) {
      await feedbackModel.addCustomer(feedback.id, req.customerId);
    }
    
    if (req.customerIds && Array.isArray(req.customerIds)) {
      for (const customerId of req.customerIds) {
        await feedbackModel.addCustomer(feedback.id, customerId);
      }
    }
    
    // Handle initiative associations
    if (req.initiativeId) {
      await feedbackModel.addInitiative(feedback.id, req.initiativeId);
    }
    
    if (req.initiativeIds && Array.isArray(req.initiativeIds)) {
      for (const initiativeId of req.initiativeIds) {
        await feedbackModel.addInitiative(feedback.id, initiativeId);
      }
    }
    
    // Return feedback with full details
    return await processFeedbackComments(feedback);
  } catch (error) {
    console.error('Error in post-processing feedback:', error);
    return feedback;
  }
};

/**
 * @route   POST /feedback
 * @desc    Create a new feedback
 * @access  Authenticated users within a tenant
 */
router.post(
  '/',
  authenticate,
  createEntityHandler(
    feedbackModel, 
    'feedback',
    {
      preprocessor: preprocessFeedback,
      postprocessor: postProcessFeedbackCreate
    }
  )
);

/**
 * @route   PUT /feedback/:id
 * @desc    Update feedback
 * @access  Members of the tenant or admin
 */
router.put('/:id', authenticate, authorizeFeedbackAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { user, body } = req;
    
    // Get existing feedback
    const feedback = await feedbackModel.findById(id);
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // Check permissions - tenant members or admins only
    if (!user.is_admin && user.tenant_id !== feedback.tenant_id) {
      return res.status(403).json({ error: 'Not authorized to update this feedback' });
    }
    
    // Extract fields that aren't directly part of feedback table
    const { 
      customer_id, customer_ids, 
      initiative_id, initiative_ids,
      content, 
      ...updateData 
    } = body;
    
    // Create safe update object with only valid fields
    const safeUpdateData = {
      title: updateData.title,
      description: updateData.description,
      sentiment: updateData.sentiment
    };
    
    // Remove undefined values
    Object.keys(safeUpdateData).forEach(key => {
      if (safeUpdateData[key] === undefined) {
        delete safeUpdateData[key];
      }
    });
    
    // Update feedback
    const updatedFeedback = await feedbackModel.update(id, safeUpdateData);
    
    // Handle customer associations if provided
    if (customer_id || (customer_ids && Array.isArray(customer_ids))) {
      try {
        // Remove existing customer associations
        await feedbackModel.removeAllCustomers(id);
        
        // Add new customer associations
        if (customer_id) {
          await feedbackModel.addCustomer(id, customer_id);
        }
        
        if (customer_ids && Array.isArray(customer_ids)) {
          for (const cId of customer_ids) {
            await feedbackModel.addCustomer(id, cId);
          }
        }
      } catch (error) {
        console.error('Error updating customer associations:', error);
        // Continue processing even if this part fails
      }
    }
    
    // Handle initiative associations if provided
    if (initiative_id || (initiative_ids && Array.isArray(initiative_ids))) {
      try {
        // Remove existing initiative associations
        await feedbackModel.removeAllInitiatives(id);
        
        // Add new initiative associations
        if (initiative_id) {
          await feedbackModel.addInitiative(id, initiative_id);
        }
        
        if (initiative_ids && Array.isArray(initiative_ids)) {
          for (const iId of initiative_ids) {
            await feedbackModel.addInitiative(id, iId);
          }
        }
      } catch (error) {
        console.error('Error updating initiative associations:', error);
        // Continue processing even if this part fails
      }
    }
    
    // Return updated feedback with full details
    const processedFeedback = await processFeedbackComments(updatedFeedback);
    return res.status(200).json(processedFeedback);
  } catch (error) {
    console.error('Error updating feedback:', error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

/**
 * @route   DELETE /feedback/:id
 * @desc    Delete feedback
 * @access  Members of the tenant or admin
 */
router.delete('/:id', authenticate, authorizeFeedbackAccess, async (req, res) => {
  try {
    const feedback = await feedbackModel.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    // Only users in the same tenant can delete feedback
    if (feedback.tenant_id !== req.user.tenant_id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to delete this feedback' });
    }
    
    await feedbackModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /feedback/:id/comments
 * @desc    Add a comment to feedback
 * @access  Members of the tenant or admin
 */
router.post('/:id/comments', authenticate, authorizeFeedbackAccess, async (req, res) => {
  try {
    const feedback = await feedbackModel.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }
    
    const commentData = {
      ...req.body,
      entity_type: 'feedback',
      entity_id: req.params.id,
      user_id: req.user.id
    };
    
    if (!commentData.content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const newComment = await commentModel.create(commentData);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;