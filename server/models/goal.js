/**
 * Goal model for top-level objectives
 */
const BaseModel = require('./base');

class GoalModel extends BaseModel {
  /**
   * @param {Object} pool - PostgreSQL connection pool
   */
  constructor(pool) {
    super(pool, 'goals');
  }
  
  /**
   * Find all goals for a tenant
   * @param {String} tenantId - The tenant ID
   * @param {String} status - Optional filter by status
   * @returns {Promise<Array>} Array of goals
   */
  async findByTenant(tenantId, status = null) {
    const filter = { tenant_id: tenantId };
    if (status) {
      filter.status = status;
    }
    return this.findAll(filter);
  }
  
  /**
   * Find all goals for a user
   * @param {String} userId - The user ID
   * @returns {Promise<Array>} Array of goals
   */
  async findByUserId(userId) {
    // For now, this is a simple implementation assuming user_id is stored in goals
    // In a real app, this might need to be expanded based on your specific data model
    return this.findAll({ user_id: userId });
  }

  /**
   * Find all goals for a team
   * @param {String} teamId - The team ID
   * @returns {Promise<Array>} Array of goals
   */
  async findByTeamId(teamId) {
    // This is a placeholder implementation
    // In a real app, this would be implemented based on your specific data model
    // and how teams are associated with goals
    const query = `
      SELECT g.*
      FROM goals g
      WHERE g.team_id = $1
      ORDER BY g.created_at DESC
    `;
    
    const result = await this.pool.query(query, [teamId]);
    return result.rows;
  }
  
  /**
   * Update goal status
   * @param {String} id - Goal ID
   * @param {String} status - New status ('active', 'planned', or 'completed')
   * @returns {Promise<Object|null>} The updated goal or null
   */
  async updateStatus(id, status) {
    if (!['active', 'planned', 'completed'].includes(status)) {
      throw new Error('Invalid status. Must be one of: active, planned, completed');
    }
    
    return this.update(id, { status });
  }
  
  /**
   * Get goals with their initiative counts
   * @param {String} tenantId - The tenant ID
   * @returns {Promise<Array>} Array of goals with initiative counts
   */
  async getGoalsWithInitiativeCounts(tenantId) {
    const query = `
      SELECT g.*, COUNT(i.id) as initiative_count
      FROM goals g
      LEFT JOIN initiatives i ON g.id = i.goal_id
      WHERE g.tenant_id = $1
      GROUP BY g.id
    `;
    
    const result = await this.pool.query(query, [tenantId]);
    return result.rows;
  }
  
  /**
   * Create a new goal with validation
   * @param {Object} goalData - Goal data
   * @returns {Promise<Object>} The created goal
   */
  async createGoal(goalData) {
    // Make sure required fields are present
    if (!goalData.tenant_id || !goalData.title || !goalData.status) {
      throw new Error('Missing required fields: tenant_id, title, and status are required');
    }
    
    // Validate status
    if (!['active', 'planned', 'completed'].includes(goalData.status)) {
      throw new Error('Invalid status. Must be one of: active, planned, completed');
    }
    
    return this.create(goalData);
  }
}

module.exports = {
  GoalModel
}; 