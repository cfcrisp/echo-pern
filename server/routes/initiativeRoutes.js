/**
 * Initiative routes
 */
const express = require('express');
const { InitiativeModel } = require('../models');
const pool = require('../config/database');
const { authenticate, authorizeInitiativeAccess } = require('../middleware/auth');

const router = express.Router();
const initiativeModel = new InitiativeModel(pool);

/**
 * @route   GET /initiatives/:id
 * @desc    Get an initiative by ID
 * @access  Initiative owner, goal owner, team members, or tenant admin
 */
router.get('/:id', authenticate, authorizeInitiativeAccess, async (req, res) => {
  try {
    const initiative = await initiativeModel.findById(req.params.id);
    
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    
    res.json(initiative);
  } catch (error) {
    console.error('Error fetching initiative:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /initiatives/:id
 * @desc    Update an initiative
 * @access  Initiative owner, goal owner, or tenant admin
 */
router.put('/:id', authenticate, authorizeInitiativeAccess, async (req, res) => {
  try {
    const initiative = await initiativeModel.findById(req.params.id);
    
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    
    // Only the initiative/goal owner or admin can update
    if (initiative.user_id !== req.user.id && !req.user.is_admin) {
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
 * @access  Initiative owner, goal owner, or tenant admin
 */
router.delete('/:id', authenticate, authorizeInitiativeAccess, async (req, res) => {
  try {
    const initiative = await initiativeModel.findById(req.params.id);
    
    if (!initiative) {
      return res.status(404).json({ error: 'Initiative not found' });
    }
    
    // Only the initiative/goal owner or admin can delete
    if (initiative.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({ error: 'Not authorized to delete this initiative' });
    }
    
    await initiativeModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting initiative:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 