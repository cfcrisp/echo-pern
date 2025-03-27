/**
 * Goal routes
 */
const express = require('express');
const { GoalModel, InitiativeModel } = require('../models');
const pool = require('../config/database');
const { authenticate, authorizeGoalAccess } = require('../middleware/auth');
const { createEntityHandler, listEntityHandler, getEntityByIdHandler } = require('../utils/requestHandlers');

const router = express.Router();
const goalModel = new GoalModel(pool);
const initiativeModel = new InitiativeModel(pool);

/**
 * @route   GET /goals
 * @desc    Get all goals for current tenant
 * @access  Authenticated
 */
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('GET /goals request received with:');
    console.log('User:', req.user ? `ID: ${req.user.id}, Tenant: ${req.user.tenant_id}` : 'No user');
    console.log('Tenant ID from request:', req.tenantId);
    
    // Use the standard handler as a function
    const handler = listEntityHandler(
      goalModel,
      'findByTenantWithOptions',
      {
        allowedFilters: ['status', 'start_date', 'end_date', 'search'],
        defaultSort: 'created_at',
        defaultOrder: 'desc'
      }
    );
    
    // Call the handler manually
    await handler(req, res);
  } catch (error) {
    console.error('Error in GET /goals:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

/**
 * @route   GET /goals/team/:teamId
 * @desc    Get all goals for a team
 * @access  Team members
 */
router.get('/team/:teamId', authenticate, async (req, res) => {
  try {
    // Authorization for team access should be handled by middleware
    const goals = await goalModel.findByTeamId(req.params.teamId);
    res.json(goals);
  } catch (error) {
    console.error('Error fetching team goals:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Custom post-processor for goal details to include initiatives
 */
const includeInitiatives = async (goal, req) => {
  const initiatives = await initiativeModel.findByGoalId(goal.id);
  return {
    ...goal,
    initiatives
  };
};

/**
 * @route   GET /goals/:id
 * @desc    Get a goal by ID
 * @access  Members of the tenant or admin
 */
router.get('/:id', authenticate, authorizeGoalAccess, getEntityByIdHandler(
  goalModel, 
  includeInitiatives
));

/**
 * Preprocess function for goal creation to ensure tenant association
 */
const preprocessGoal = async (data, req) => {
  console.log('Preprocessing goal data:', data);
  
  // Always ensure tenant_id is set correctly from the authenticated user
  return {
    ...data,
    tenant_id: req.user.tenant_id
  };
};

/**
 * @route   POST /goals
 * @desc    Create a new goal
 * @access  Authenticated users within a tenant
 */
router.post('/', authenticate, createEntityHandler(
  goalModel, 
  ['title', 'status'],
  preprocessGoal
));

/**
 * @route   PUT /goals/:id
 * @desc    Update a goal
 * @access  Members of the tenant or admin
 */
router.put('/:id', authenticate, authorizeGoalAccess, async (req, res) => {
  try {
    const goal = await goalModel.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Only users in the same tenant can update goals
    if (goal.tenant_id !== req.user.tenant_id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to update this goal' });
    }
    
    const updatedGoal = await goalModel.update(req.params.id, req.body);
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /goals/:id
 * @desc    Delete a goal
 * @access  Members of the tenant or admin
 */
router.delete('/:id', authenticate, authorizeGoalAccess, async (req, res) => {
  try {
    const goal = await goalModel.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Only users in the same tenant can delete goals
    if (goal.tenant_id !== req.user.tenant_id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to delete this goal' });
    }
    
    await goalModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /goals/:id/initiatives
 * @desc    Add an initiative to a goal
 * @access  Members of the tenant or admin
 */
router.post('/:id/initiatives', authenticate, authorizeGoalAccess, async (req, res) => {
  try {
    const goal = await goalModel.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Only users in the same tenant can add initiatives to goals
    if (goal.tenant_id !== req.user.tenant_id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to add initiatives to this goal' });
    }
    
    const initiativeData = {
      ...req.body,
      goal_id: req.params.id,
      tenant_id: req.user.tenant_id
    };
    
    // Validate required fields
    if (!initiativeData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newInitiative = await initiativeModel.create(initiativeData);
    res.status(201).json(newInitiative);
  } catch (error) {
    console.error('Error creating initiative:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 