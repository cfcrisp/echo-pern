/**
 * User routes
 */
const express = require('express');
const { UserModel } = require('../models');
const pool = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const userModel = new UserModel(pool);

/**
 * @route   GET /users
 * @desc    Get all users for current tenant
 * @access  Admin
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await userModel.findByTenantId(req.user.tenant_id);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /users/me
 * @desc    Get current user profile
 * @access  Authenticated
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send sensitive information
    delete user.password;
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /users/:id
 * @desc    Get a user by ID
 * @access  Admin
 */
router.get('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If not same tenant and not super admin, deny access
    if (user.tenant_id !== req.user.tenant_id && !req.user.is_super_admin) {
      return res.status(403).json({ error: 'Not authorized to access this user' });
    }
    
    // Don't send sensitive information
    delete user.password;
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /users/me
 * @desc    Update current user profile
 * @access  Authenticated
 */
router.put('/me', authenticate, async (req, res) => {
  try {
    // Disallow changing critical fields
    const updates = { ...req.body };
    delete updates.email;
    delete updates.tenant_id;
    delete updates.role;
    delete updates.is_admin;
    delete updates.is_super_admin;
    
    const updatedUser = await userModel.update(req.user.id, updates);
    
    // Don't send sensitive information
    delete updatedUser.password;
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   PUT /users/:id
 * @desc    Update a user (admin only)
 * @access  Admin
 */
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If not same tenant and not super admin, deny access
    if (user.tenant_id !== req.user.tenant_id && !req.user.is_super_admin) {
      return res.status(403).json({ error: 'Not authorized to update this user' });
    }
    
    // Regular admins can't modify super admin status
    const updates = { ...req.body };
    if (!req.user.is_super_admin) {
      delete updates.is_super_admin;
    }
    
    const updatedUser = await userModel.update(req.params.id, updates);
    
    // Don't send sensitive information
    delete updatedUser.password;
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   DELETE /users/:id
 * @desc    Delete a user
 * @access  Admin
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If not same tenant and not super admin, deny access
    if (user.tenant_id !== req.user.tenant_id && !req.user.is_super_admin) {
      return res.status(403).json({ error: 'Not authorized to delete this user' });
    }
    
    // Don't allow deleting yourself
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    
    await userModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 