/**
 * Initiative model for mid-level projects
 */
const BaseModel = require('./base');

class InitiativeModel extends BaseModel {
  /**
   * @param {Object} pool - PostgreSQL connection pool
   */
  constructor(pool) {
    super(pool, 'initiatives');
  }
  
  /**
   * Find all initiatives for a tenant
   * @param {String} tenantId - The tenant ID
   * @param {String} status - Optional filter by status
   * @returns {Promise<Array>} Array of initiatives
   */
  async findByTenant(tenantId, status = null) {
    const filter = { tenant_id: tenantId };
    if (status) {
      filter.status = status;
    }
    return this.findAll(filter);
  }
  
  /**
   * Find initiatives by goal
   * @param {String} goalId - The goal ID
   * @returns {Promise<Array>} Array of initiatives
   */
  async findByGoal(goalId) {
    return this.findAll({ goal_id: goalId });
  }
  
  /**
   * Find initiatives by goal ID (alias for findByGoal)
   * @param {String} goalId - The goal ID
   * @returns {Promise<Array>} Array of initiatives
   */
  async findByGoalId(goalId) {
    return this.findByGoal(goalId);
  }
  
  /**
   * Update initiative status
   * @param {String} id - Initiative ID
   * @param {String} status - New status ('active', 'planned', or 'completed')
   * @returns {Promise<Object|null>} The updated initiative or null
   */
  async updateStatus(id, status) {
    if (!['active', 'planned', 'completed'].includes(status)) {
      throw new Error('Invalid status. Must be one of: active, planned, completed');
    }
    
    return this.update(id, { status });
  }
  
  /**
   * Update initiative priority
   * @param {String} id - Initiative ID
   * @param {Number} priority - New priority (1-5)
   * @returns {Promise<Object|null>} The updated initiative or null
   */
  async updatePriority(id, priority) {
    if (priority < 1 || priority > 5) {
      throw new Error('Invalid priority. Must be between 1 and 5');
    }
    
    return this.update(id, { priority });
  }
  
  /**
   * Get initiatives with their idea counts
   * @param {String} tenantId - The tenant ID
   * @returns {Promise<Array>} Array of initiatives with idea counts
   */
  async getInitiativesWithIdeaCounts(tenantId) {
    const query = `
      SELECT i.*, COUNT(id.id) as idea_count
      FROM initiatives i
      LEFT JOIN ideas id ON i.id = id.initiative_id
      WHERE i.tenant_id = $1
      GROUP BY i.id
    `;
    
    const result = await this.pool.query(query, [tenantId]);
    return result.rows;
  }
  
  /**
   * Create a new initiative with validation
   * @param {Object} initiativeData - Initiative data
   * @returns {Promise<Object>} The created initiative
   */
  async createInitiative(initiativeData) {
    // Make sure required fields are present
    if (!initiativeData.tenant_id || !initiativeData.title || !initiativeData.status || !initiativeData.priority) {
      throw new Error('Missing required fields: tenant_id, title, status, and priority are required');
    }
    
    // Validate status
    if (!['active', 'planned', 'completed'].includes(initiativeData.status)) {
      throw new Error('Invalid status. Must be one of: active, planned, completed');
    }
    
    // Validate priority
    if (initiativeData.priority < 1 || initiativeData.priority > 5) {
      throw new Error('Invalid priority. Must be between 1 and 5');
    }
    
    return this.create(initiativeData);
  }
}

module.exports = {
  InitiativeModel
}; 