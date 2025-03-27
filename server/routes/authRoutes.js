/**
 * Authentication routes
 */
const express = require('express');
const { UserModel } = require('../models');
const pool = require('../config/database');
const { authenticate } = require('../middleware/auth');
const authService = require('../services/authService');

const router = express.Router();
const userModel = new UserModel(pool);

/**
 * @route   POST /auth/register
 * @desc    Register a new user with automatic tenant assignment based on email domain
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', { 
      body: req.body,
      headers: {
        host: req.get('host'),
        origin: req.get('origin'),
        'content-type': req.get('content-type')
      }
    });
    
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      console.log('Registration failed: Email and password are required');
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const user = await authService.registerUser(email, password, name);
    console.log('User registered successfully:', { email, userId: user.id });
    
    // Create a token for the user
    const token = authService.generateToken(user.id);
    
    res.status(201).json({
      token,
      id: user.id,
      email: user.email,
      name: user.name,
      tenant_id: user.tenant_id,
      role: user.role
    });
  } catch (error) {
    console.error('Error registering user:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('Tenant not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('Invalid email format')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('Cannot create tenant using public email domain')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /auth/register-admin
 * @desc    Register a new admin user (typically for a new tenant)
 * @access  Public (but should be secured in production)
 */
router.post('/register-admin', async (req, res) => {
  try {
    const { email, password, tenantId, name } = req.body;
    
    if (!email || !password || !tenantId) {
      return res.status(400).json({ error: 'Email, password, and tenantId are required' });
    }
    
    const user = await authService.registerAdminUser(tenantId, email, password, name);
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      tenant_id: user.tenant_id,
      role: user.role
    });
  } catch (error) {
    console.error('Error registering admin user:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message.includes('Tenant not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /auth/login
 * @desc    Authenticate user with automatic tenant determination based on email domain
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { user, token } = await authService.loginUser(email, password);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant_id: user.tenant_id,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    
    if (error.message.includes('Invalid credentials')) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    if (error.message.includes('Tenant not found') || 
        error.message.includes('No tenant found for this email domain')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('Invalid email format')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   GET /auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send sensitive information
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    
    if (error.message.includes('incorrect')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const resetToken = await authService.forgotPassword(email);
    
    // In a real application, you would send an email with the reset link
    // For testing, return the token
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent',
      token: resetToken // Remove this in production
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    
    // Don't reveal if a user exists or not
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent' 
    });
  }
});

/**
 * @route   POST /auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    await authService.resetPassword(token, newPassword);
    
    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    
    if (error.message.includes('expired') || error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 