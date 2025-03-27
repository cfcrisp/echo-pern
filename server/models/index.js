/**
 * Database models for the application
 */
const { TenantModel } = require('./tenant');
const { UserModel } = require('./user');
const { GoalModel } = require('./goal');
const { InitiativeModel } = require('./initiative');
const { CustomerModel } = require('./customer');
const { IdeaModel } = require('./idea');
const { FeedbackModel } = require('./feedback');
const { CommentModel } = require('./comment');

/**
 * Creates and initializes all database models with the provided connection pool
 * @param {Object} pool - PostgreSQL connection pool
 * @returns {Object} All database models
 */
function initModels(pool) {
  return {
    tenants: new TenantModel(pool),
    users: new UserModel(pool),
    goals: new GoalModel(pool),
    initiatives: new InitiativeModel(pool),
    customers: new CustomerModel(pool),
    ideas: new IdeaModel(pool),
    feedback: new FeedbackModel(pool),
    comments: new CommentModel(pool)
  };
}

module.exports = {
  TenantModel,
  UserModel,
  GoalModel,
  InitiativeModel,
  CustomerModel,
  IdeaModel,
  FeedbackModel,
  CommentModel,
  initModels
}; 