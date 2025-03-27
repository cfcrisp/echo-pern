/**
 * Comment model for user comments on various entities
 */
const BaseModel = require('./base');

class CommentModel extends BaseModel {
  /**
   * @param {Object} pool - PostgreSQL connection pool
   */
  constructor(pool) {
    super(pool, 'comments');
  }
  
  /**
   * Find comments by user
   * @param {String} userId - The user ID
   * @returns {Promise<Array>} Array of comments
   */
  async findByUser(userId) {
    return this.findAll({ user_id: userId });
  }
  
  /**
   * Find comments by entity (idea, feedback, or initiative)
   * @param {String} entityType - The entity type ('idea', 'feedback', or 'initiative')
   * @param {String} entityId - The entity ID
   * @returns {Promise<Array>} Array of comments
   */
  async findByEntity(entityType, entityId) {
    if (!['idea', 'feedback', 'initiative'].includes(entityType)) {
      throw new Error('Invalid entity type. Must be one of: idea, feedback, initiative');
    }
    
    return this.findAll({ entity_type: entityType, entity_id: entityId });
  }
  
  /**
   * Find comments for a feedback (convenience method)
   * @param {String} feedbackId - The feedback ID
   * @returns {Promise<Array>} Array of comments
   */
  async findByFeedbackId(feedbackId) {
    return this.findByEntity('feedback', feedbackId);
  }
  
  /**
   * Get comments with user information
   * @param {String} entityType - The entity type ('idea', 'feedback', or 'initiative')
   * @param {String} entityId - The entity ID
   * @returns {Promise<Array>} Array of comments with user information
   */
  async getCommentsWithUsers(entityType, entityId) {
    if (!['idea', 'feedback', 'initiative'].includes(entityType)) {
      throw new Error('Invalid entity type. Must be one of: idea, feedback, initiative');
    }
    
    const query = `
      SELECT c.*, u.email, u.role
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.entity_type = $1 AND c.entity_id = $2
      ORDER BY c.created_at
    `;
    
    const result = await this.pool.query(query, [entityType, entityId]);
    return result.rows;
  }
  
  /**
   * Create a new comment with validation
   * @param {Object} commentData - Comment data
   * @returns {Promise<Object>} The created comment
   */
  async createComment(commentData) {
    // Make sure required fields are present
    if (!commentData.user_id || !commentData.content || !commentData.entity_type || !commentData.entity_id) {
      throw new Error('Missing required fields: user_id, content, entity_type, and entity_id are required');
    }
    
    // Validate entity type
    if (!['idea', 'feedback', 'initiative'].includes(commentData.entity_type)) {
      throw new Error('Invalid entity type. Must be one of: idea, feedback, initiative');
    }
    
    return this.create(commentData);
  }
}

module.exports = {
  CommentModel
}; 