/**
 * Authentication middleware
 */
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/environment');
const { UserModel } = require('../models');
const pool = require('../config/database');

// Create user model instance
const userModel = new UserModel(pool);

/**
 * Verifies the JWT token in the request header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    // Extract token from header
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user exists
    const user = await userModel.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found' 
      });
    }
    
    // Add user to request object
    req.user = user;
    req.tenantId = user.tenant_id;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired' 
      });
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ 
      error: 'Server error during authentication' 
    });
  }
};

/**
 * Checks if user has admin role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Admin access required' 
    });
  }
  
  next();
};

/**
 * Ensures user belongs to specified tenant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireSameTenant = (req, res, next) => {
  // Get tenant ID from request parameters or query
  const requestedTenantId = req.params.tenantId || req.query.tenantId || req.body.tenantId;
  
  // If no specific tenant is requested, continue
  if (!requestedTenantId) {
    return next();
  }
  
  // Check if user belongs to requested tenant
  if (req.user.tenant_id !== requestedTenantId) {
    return res.status(403).json({
      error: 'Access denied - resources from different tenant'
    });
  }
  
  next();
};

/**
 * Authorizes access to a goal resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authorizeGoalAccess = async (req, res, next) => {
  // If user is an admin, allow access
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // For goals, ensure they belong to user's tenant
  const goalId = req.params.id || req.body.goalId;
  
  // If no goal ID provided, this is likely a list or create endpoint
  // Will be filtered by tenant ID in the controller
  if (!goalId) {
    return next();
  }
  
  try {
    // Use dynamic import to avoid circular dependency
    const { GoalModel } = require('../models');
    const goalModel = new GoalModel(pool);
    
    const goal = await goalModel.findById(goalId);
    
    if (!goal) {
      return res.status(404).json({
        error: 'Goal not found'
      });
    }
    
    // Check if goal belongs to user's tenant
    if (goal.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error authorizing goal access:', error);
    res.status(500).json({
      error: 'Server error during authorization'
    });
  }
};

/**
 * Authorizes access to an initiative resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authorizeInitiativeAccess = async (req, res, next) => {
  // If user is an admin, allow access
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // For initiatives, ensure they belong to user's tenant
  const initiativeId = req.params.id || req.body.initiativeId;
  
  // If no initiative ID provided, this is likely a list or create endpoint
  // Will be filtered by tenant ID in the controller
  if (!initiativeId) {
    return next();
  }
  
  try {
    // Use dynamic import to avoid circular dependency
    const { InitiativeModel } = require('../models');
    const initiativeModel = new InitiativeModel(pool);
    
    const initiative = await initiativeModel.findById(initiativeId);
    
    if (!initiative) {
      return res.status(404).json({
        error: 'Initiative not found'
      });
    }
    
    // Check if initiative belongs to user's tenant
    if (initiative.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error authorizing initiative access:', error);
    res.status(500).json({
      error: 'Server error during authorization'
    });
  }
};

/**
 * Authorizes access to a team resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authorizeTeamAccess = async (req, res, next) => {
  // If user is an admin, allow access
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // For teams, ensure they belong to user's tenant
  const teamId = req.params.id || req.body.teamId;
  
  // If no team ID provided, this is likely a list or create endpoint
  // Will be filtered by tenant ID in the controller
  if (!teamId) {
    return next();
  }
  
  try {
    // Use dynamic import to avoid circular dependency
    const { TeamModel } = require('../models');
    const teamModel = new TeamModel(pool);
    
    const team = await teamModel.findById(teamId);
    
    if (!team) {
      return res.status(404).json({
        error: 'Team not found'
      });
    }
    
    // Check if team belongs to user's tenant
    if (team.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error authorizing team access:', error);
    res.status(500).json({
      error: 'Server error during authorization'
    });
  }
};

/**
 * Authorizes access to a feedback resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authorizeFeedbackAccess = async (req, res, next) => {
  // If user is an admin, allow access
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // For feedback, ensure it belongs to user's tenant
  const feedbackId = req.params.id || req.body.feedbackId;
  
  // If no feedback ID provided, this is likely a list or create endpoint
  // Will be filtered by tenant ID in the controller
  if (!feedbackId) {
    return next();
  }
  
  try {
    // Use dynamic import to avoid circular dependency
    const { FeedbackModel } = require('../models');
    const feedbackModel = new FeedbackModel(pool);
    
    const feedback = await feedbackModel.findById(feedbackId);
    
    if (!feedback) {
      return res.status(404).json({
        error: 'Feedback not found'
      });
    }
    
    // Check if feedback belongs to user's tenant
    if (feedback.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error authorizing feedback access:', error);
    res.status(500).json({
      error: 'Server error during authorization'
    });
  }
};

/**
 * Authorizes access to a comment resource
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authorizeCommentAccess = async (req, res, next) => {
  // If user is an admin, allow access
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // For comments, check if user is the author or the entity belongs to user's tenant
  const commentId = req.params.id || req.body.commentId;
  
  // If no comment ID provided, this is likely a list or create endpoint
  // Comments will be filtered by related entity in the controller
  if (!commentId) {
    return next();
  }
  
  try {
    // Use dynamic import to avoid circular dependency
    const { CommentModel } = require('../models');
    const commentModel = new CommentModel(pool);
    
    const comment = await commentModel.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        error: 'Comment not found'
      });
    }
    
    // Check if user is the author
    if (comment.user_id === req.user.id) {
      return next();
    }
    
    // For comments, we also need to check if the entity they're attached to
    // belongs to the user's tenant
    const entityModel = getEntityModelForComment(comment.entity_type);
    if (!entityModel) {
      return res.status(500).json({
        error: 'Invalid entity type'
      });
    }
    
    const entity = await entityModel.findById(comment.entity_id);
    
    // Entity not found or belongs to different tenant
    if (!entity || entity.tenant_id !== req.user.tenant_id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error authorizing comment access:', error);
    res.status(500).json({
      error: 'Server error during authorization'
    });
  }
};

/**
 * Helper function to get the appropriate model for a comment's entity type
 * @param {String} entityType - Type of entity ('idea', 'feedback', 'initiative')
 * @returns {Object|null} The entity model or null
 */
function getEntityModelForComment(entityType) {
  try {
    const { IdeaModel, FeedbackModel, InitiativeModel } = require('../models');
    
    switch (entityType) {
      case 'idea':
        return new IdeaModel(pool);
      case 'feedback':
        return new FeedbackModel(pool);
      case 'initiative':
        return new InitiativeModel(pool);
      default:
        return null;
    }
  } catch (error) {
    console.error('Error getting entity model:', error);
    return null;
  }
}

module.exports = {
  authenticate,
  requireAdmin,
  requireSameTenant,
  authorizeGoalAccess,
  authorizeInitiativeAccess,
  authorizeTeamAccess,
  authorizeFeedbackAccess,
  authorizeCommentAccess
}; 