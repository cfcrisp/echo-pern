/**
 * Goal service
 */
const { GoalModel, InitiativeModel } = require('../models');
const pool = require('../config/database');

// Create model instances
const goalModel = new GoalModel(pool);
const initiativeModel = new InitiativeModel(pool);

/**
 * Get all goals for a tenant with initiative counts
 * @param {String} tenantId - Tenant ID
 * @param {String} status - Optional filter by status
 * @returns {Promise<Array>} Array of goals with initiative counts
 */
async function getGoals(tenantId, status = null) {
  return goalModel.getGoalsWithInitiativeCounts(tenantId);
}

/**
 * Get a goal by ID with its initiatives
 * @param {String} goalId - Goal ID
 * @returns {Promise<Object>} Goal with initiatives
 */
async function getGoalWithInitiatives(goalId) {
  const goal = await goalModel.findById(goalId);
  
  if (!goal) {
    throw new Error('Goal not found');
  }
  
  const initiatives = await initiativeModel.findByGoal(goalId);
  
  return {
    ...goal,
    initiatives
  };
}

/**
 * Create a new goal
 * @param {String} tenantId - Tenant ID
 * @param {String} title - Goal title
 * @param {String} description - Goal description (optional)
 * @param {String} status - Goal status ('active', 'planned', or 'completed')
 * @param {Date} targetDate - Goal target date (optional)
 * @returns {Promise<Object>} The created goal
 */
async function createGoal(tenantId, title, description = null, status = 'active', targetDate = null) {
  return goalModel.createGoal({
    tenant_id: tenantId,
    title,
    description,
    status,
    target_date: targetDate
  });
}

/**
 * Update a goal
 * @param {String} goalId - Goal ID
 * @param {Object} updates - Object with properties to update
 * @returns {Promise<Object>} The updated goal
 */
async function updateGoal(goalId, updates) {
  const goal = await goalModel.findById(goalId);
  
  if (!goal) {
    throw new Error('Goal not found');
  }
  
  // Validate status if provided
  if (updates.status && !['active', 'planned', 'completed'].includes(updates.status)) {
    throw new Error('Invalid status. Must be one of: active, planned, completed');
  }
  
  return goalModel.update(goalId, updates);
}

/**
 * Delete a goal
 * @param {String} goalId - Goal ID
 * @returns {Promise<Boolean>} True if successful
 */
async function deleteGoal(goalId) {
  return goalModel.delete(goalId);
}

module.exports = {
  getGoals,
  getGoalWithInitiatives,
  createGoal,
  updateGoal,
  deleteGoal
}; 