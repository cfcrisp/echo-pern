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
   * Find initiatives by tenant ID (alias for findByTenant)
   * @param {String} tenantId - The tenant ID
   * @param {String} status - Optional filter by status
   * @returns {Promise<Array>} Array of initiatives
   */
  async findByTenantId(tenantId, status = null) {
    return this.findByTenant(tenantId, status);
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
   * Override validateForCreate to add initiative-specific validation
   * @param {Object} data - Initiative data
   * @returns {Promise<Object>} Validated initiative data
   */
  async validateForCreate(data) {
    // Call parent validation first
    const baseValidated = await super.validateForCreate(data);
    
    // Initiative-specific validation
    if (!baseValidated.title) {
      throw new Error('title is required for initiatives');
    }
    
    if (!baseValidated.status) {
      throw new Error('status is required for initiatives');
    }
    
    if (!['active', 'planned', 'completed'].includes(baseValidated.status)) {
      throw new Error('invalid status: must be one of active, planned, completed');
    }
    
    if (baseValidated.priority === undefined || baseValidated.priority === null) {
      throw new Error('priority is required for initiatives');
    }
    
    if (baseValidated.priority < 1 || baseValidated.priority > 5) {
      throw new Error('invalid priority: must be between 1 and 5');
    }
    
    // Ensure description is not null or undefined
    if (baseValidated.description === null || baseValidated.description === undefined) {
      baseValidated.description = '';
    }
    
    return baseValidated;
  }
  
  /**
   * Create a new initiative with validation
   * @param {Object} initiativeData - Initiative data
   * @returns {Promise<Object>} The created initiative
   */
  async createInitiative(initiativeData) {
    // This method is kept for backward compatibility
    // but delegates to the standard create method
    return this.create(initiativeData);
  }
  
  /**
   * Find initiatives with full query options support
   * @param {String} tenantId - The tenant ID
   * @param {Object} options - Query options (sort, order, limit, offset, filters)
   * @returns {Promise<Array>} Array of initiatives
   */
  async findByTenantWithOptions(tenantId, options = {}) {
    try {
      console.log('findByTenantWithOptions called with tenantId:', tenantId);
      console.log('Options:', JSON.stringify(options));
      
      const {
        sort = 'created_at',
        order = 'desc',
        limit = 50,
        offset = 0,
        filters = {}
      } = options;
      
      // Build the WHERE clause
      const conditions = ['tenant_id = $1'];
      const values = [tenantId];
      let paramIndex = 2;
      
      // Add filters
      if (filters.status) {
        conditions.push(`status = $${paramIndex}`);
        values.push(filters.status);
        paramIndex++;
      }
      
      if (filters.priority) {
        conditions.push(`priority = $${paramIndex}`);
        values.push(filters.priority);
        paramIndex++;
      }
      
      if (filters.goal_id) {
        conditions.push(`goal_id = $${paramIndex}`);
        values.push(filters.goal_id);
        paramIndex++;
      }
      
      // Handle search if present
      if (filters.search) {
        conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
        values.push(`%${filters.search}%`);
        paramIndex++;
      }
      
      // Ensure the sort field exists
      const safeSort = ['created_at', 'updated_at', 'title', 'status', 'priority'].includes(sort) 
        ? sort 
        : 'created_at';
      
      // Build the query
      const query = `
        SELECT *
        FROM ${this.tableName}
        WHERE ${conditions.join(' AND ')}
        ORDER BY ${safeSort} ${order}
        LIMIT $${paramIndex}
        OFFSET $${paramIndex + 1}
      `;
      
      console.log('Executing query:', query);
      console.log('With values:', values);
      
      values.push(limit, offset);
      
      const result = await this.pool.query(query, values);
      console.log(`Query returned ${result.rows.length} rows`);
      return result.rows;
    } catch (error) {
      console.error('Error in findByTenantWithOptions:', error);
      throw error;
    }
  }
}

module.exports = {
  InitiativeModel
}; 