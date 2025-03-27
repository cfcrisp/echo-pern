/**
 * Goal routes
 */
const express = require('express');
const { GoalModel, InitiativeModel } = require('../models');
const pool = require('../config/database');
const { authenticate, authorizeGoalAccess } = require('../middleware/auth');

const router = express.Router();
const goalModel = new GoalModel(pool);
const initiativeModel = new InitiativeModel(pool);

/**
 * @route   GET /goals
 * @desc    Get all goals for current user
 * @access  Authenticated
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const goals = await goalModel.findByUserId(req.user.id);
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Server error' });
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
 * @route   GET /goals/:id
 * @desc    Get a goal by ID
 * @access  Goal owner, team members, or tenant admin
 */
router.get('/:id', authenticate, authorizeGoalAccess, async (req, res) => {
  try {
    const goal = await goalModel.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Get initiatives for this goal
    const initiatives = await initiativeModel.findByGoalId(req.params.id);
    
    // Combine goal with initiatives
    const fullGoal = {
      ...goal,
      initiatives
    };
    
    res.json(fullGoal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /goals
 * @desc    Create a new goal
 * @access  Authenticated
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const goalData = {
      ...req.body,
      user_id: req.user.id,
      tenant_id: req.user.tenant_id
    };
    
    // Validate required fields
    if (!goalData.title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const newGoal = await goalModel.create(goalData);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /goals/:id
 * @desc    Update a goal
 * @access  Goal owner or tenant admin
 */
router.put('/:id', authenticate, authorizeGoalAccess, async (req, res) => {
  try {
    const goal = await goalModel.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Only the goal owner or admin can update
    if (goal.user_id !== req.user.id && !req.user.is_admin) {
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
 * @access  Goal owner or tenant admin
 */
router.delete('/:id', authenticate, authorizeGoalAccess, async (req, res) => {
  try {
    const goal = await goalModel.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Only the goal owner or admin can delete
    if (goal.user_id !== req.user.id && !req.user.is_admin) {
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
 * @access  Goal owner or tenant admin
 */
router.post('/:id/initiatives', authenticate, authorizeGoalAccess, async (req, res) => {
  try {
    const goal = await goalModel.findById(req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Only the goal owner or admin can add initiatives
    if (goal.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to add initiatives to this goal' });
    }
    
    const initiativeData = {
      ...req.body,
      goal_id: req.params.id,
      user_id: req.user.id
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