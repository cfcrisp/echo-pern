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
  
  /**
   * Override validateForCreate to add comment-specific validation
   * @param {Object} data - Comment data
   * @returns {Promise<Object>} Validated comment data
   */
  async validateForCreate(data) {
    // Call parent validation first
    const baseValidated = await super.validateForCreate(data);
    
    // Comment-specific validation
    if (!baseValidated.content) {
      throw new Error('content is required for comments');
    }
    
    if (!baseValidated.user_id) {
      throw new Error('user_id is required for comments');
    }
    
    if (!baseValidated.entity_type || !baseValidated.entity_id) {
      throw new Error('entity_type and entity_id are required for comments');
    }
    
    if (!['idea', 'feedback', 'initiative'].includes(baseValidated.entity_type)) {
      throw new Error('invalid entity_type: must be one of idea, feedback, initiative');
    }
    
    return baseValidated;
  }

  /**
   * Find comments with full query options support
   * @param {String} tenantId - The tenant ID
   * @param {Object} options - Query options (sort, order, limit, offset, filters)
   * @returns {Promise<Array>} Array of comments with user information
   */
  async findByTenantWithOptions(tenantId, options = {}) {
    const {
      sort = 'created_at',
      order = 'desc',
      limit = 50,
      offset = 0,
      filters = {}
    } = options;
    
    // Build the query with user information
    let query = `
      SELECT c.*, u.email, u.name, u.role
      FROM ${this.tableName} c
      JOIN users u ON c.user_id = u.id
    `;
    
    // Join to the entities to filter by tenant
    let joinClause = '';
    if (filters.entity_type === 'idea') {
      joinClause = 'JOIN ideas i ON c.entity_id = i.id AND c.entity_type = \'idea\'';
      query += ` ${joinClause} WHERE i.tenant_id = $1`;
    } else if (filters.entity_type === 'feedback') {
      joinClause = 'JOIN feedback f ON c.entity_id = f.id AND c.entity_type = \'feedback\'';
      query += ` ${joinClause} WHERE f.tenant_id = $1`;
    } else if (filters.entity_type === 'initiative') {
      joinClause = 'JOIN initiatives ini ON c.entity_id = ini.id AND c.entity_type = \'initiative\'';
      query += ` ${joinClause} WHERE ini.tenant_id = $1`;
    } else {
      // If no specific entity type, join to all possible entities
      query += `
        LEFT JOIN ideas i ON c.entity_id = i.id AND c.entity_type = 'idea'
        LEFT JOIN feedback f ON c.entity_id = f.id AND c.entity_type = 'feedback'
        LEFT JOIN initiatives ini ON c.entity_id = ini.id AND c.entity_type = 'initiative'
        WHERE (i.tenant_id = $1 OR f.tenant_id = $1 OR ini.tenant_id = $1)
      `;
    }
    
    const values = [tenantId];
    let paramIndex = 2;
    
    // Add specific entity filters if present
    if (filters.entity_type && filters.entity_id) {
      query += ` AND c.entity_type = $${paramIndex} AND c.entity_id = $${paramIndex + 1}`;
      values.push(filters.entity_type, filters.entity_id);
      paramIndex += 2;
    } else if (filters.entity_type) {
      query += ` AND c.entity_type = $${paramIndex}`;
      values.push(filters.entity_type);
      paramIndex++;
    }
    
    // Filter by user if specified
    if (filters.user_id) {
      query += ` AND c.user_id = $${paramIndex}`;
      values.push(filters.user_id);
      paramIndex++;
    }
    
    // Handle text search in content
    if (filters.search) {
      query += ` AND (c.content ILIKE $${paramIndex})`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    // Apply sorting - default is created_at desc (newest first)
    query += ` ORDER BY c.${sort} ${order}`;
    
    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);
    
    const result = await this.pool.query(query, values);
    return result.rows;
  }
}

module.exports = {
  CommentModel
}; 