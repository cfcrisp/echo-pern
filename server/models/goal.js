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
    // Get the user's tenant_id first, as goals are associated with tenants, not users directly
    try {
      const userQuery = `
        SELECT tenant_id FROM users WHERE id = $1 LIMIT 1
      `;
      const userResult = await this.pool.query(userQuery, [userId]);
      
      if (!userResult.rows.length) {
        return [];
      }
      
      const tenantId = userResult.rows[0].tenant_id;
      return this.findByTenant(tenantId);
    } catch (error) {
      console.error('Error in findByUserId:', error);
      return [];
    }
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
   * Override validateForCreate to add goal-specific validation
   * @param {Object} data - Goal data
   * @returns {Promise<Object>} Validated goal data
   */
  async validateForCreate(data) {
    // Call parent validation first
    const baseValidated = await super.validateForCreate(data);
    
    // Goal-specific validation
    if (!baseValidated.title) {
      throw new Error('title is required for goals');
    }
    
    if (!baseValidated.status) {
      throw new Error('status is required for goals');
    }
    
    if (!['active', 'planned', 'completed'].includes(baseValidated.status)) {
      throw new Error('invalid status: must be one of active, planned, completed');
    }
    
    // Ensure description is not null or undefined
    if (baseValidated.description === null || baseValidated.description === undefined) {
      baseValidated.description = '';
    }
    
    return baseValidated;
  }

  /**
   * Find goals with full query options support
   * @param {String} tenantId - The tenant ID
   * @param {Object} options - Query options (sort, order, limit, offset, filters)
   * @returns {Promise<Array>} Array of goals
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
      const conditions = ['g.tenant_id = $1'];
      const values = [tenantId];
      let paramIndex = 2;
      
      // Add filters
      if (filters.status) {
        conditions.push(`g.status = $${paramIndex}`);
        values.push(filters.status);
        paramIndex++;
      }
      
      // Filter by target date range if provided
      if (filters.start_date) {
        conditions.push(`g.target_date >= $${paramIndex}`);
        values.push(filters.start_date);
        paramIndex++;
      }
      
      if (filters.end_date) {
        conditions.push(`g.target_date <= $${paramIndex}`);
        values.push(filters.end_date);
        paramIndex++;
      }
      
      // Handle search if present
      if (filters.search) {
        conditions.push(`(g.title ILIKE $${paramIndex} OR g.description ILIKE $${paramIndex})`);
        values.push(`%${filters.search}%`);
        paramIndex++;
      }
      
      // Ensure the sort field exists
      const safeSort = ['created_at', 'updated_at', 'title', 'status', 'target_date'].includes(sort) 
        ? sort 
        : 'created_at';
      
      // Build the query with initiative counts
      const query = `
        SELECT g.*, COUNT(i.id) as initiative_count
        FROM ${this.tableName} g
        LEFT JOIN initiatives i ON g.id = i.goal_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY g.id
        ORDER BY g.${safeSort} ${order}
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

  /**
   * Find goals by tenant ID (alias for findByTenant)
   * @param {String} tenantId - The tenant ID
   * @param {String} status - Optional filter by status
   * @returns {Promise<Array>} Array of goals
   */
  async findByTenantId(tenantId, status = null) {
    return this.findByTenant(tenantId, status);
  }

  /**
   * Create a new goal with validation
   * @param {Object} goalData - Goal data
   * @returns {Promise<Object>} The created goal
   */
  async createGoal(goalData) {
    // This method is kept for backward compatibility
    // but delegates to the standard create method
    return this.create(goalData);
  }
}

module.exports = {
  GoalModel
}; 