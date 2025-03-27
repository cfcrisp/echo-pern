/**
 * Idea model for managing idea data
 */
const BaseModel = require('./base');

class IdeaModel extends BaseModel {
  /**
   * @param {Object} pool - PostgreSQL connection pool
   */
  constructor(pool) {
    super(pool, 'ideas');
  }
  
  /**
   * Find all ideas for a tenant
   * @param {String} tenantId - The tenant ID
   * @param {String} status - Optional filter by status
   * @returns {Promise<Array>} Array of ideas
   */
  async findByTenant(tenantId, status = null) {
    const filter = { tenant_id: tenantId };
    if (status) {
      filter.status = status;
    }
    return this.findAll(filter);
  }
  
  /**
   * Find ideas by initiative
   * @param {String} initiativeId - The initiative ID
   * @returns {Promise<Array>} Array of ideas
   */
  async findByInitiative(initiativeId) {
    return this.findAll({ initiative_id: initiativeId });
  }
  
  /**
   * Update idea status
   * @param {String} id - Idea ID
   * @param {String} status - New status ('new', 'planned', 'completed', or 'rejected')
   * @returns {Promise<Object|null>} The updated idea or null
   */
  async updateStatus(id, status) {
    if (!['new', 'planned', 'completed', 'rejected'].includes(status)) {
      throw new Error('Invalid status. Must be one of: new, planned, completed, rejected');
    }
    
    return this.update(id, { status });
  }
  
  /**
   * Get customers associated with an idea
   * @param {String} ideaId - Idea ID
   * @returns {Promise<Array>} Array of customer associations
   */
  async getCustomers(ideaId) {
    const query = `
      SELECT customer_id
      FROM ideas_customers
      WHERE idea_id = $1
    `;
    
    const result = await this.pool.query(query, [ideaId]);
    return result.rows;
  }
  
  /**
   * Associate an idea with a customer
   * @param {String} ideaId - Idea ID
   * @param {String} customerId - Customer ID
   * @returns {Promise<Boolean>} True if successful
   */
  async addCustomer(ideaId, customerId) {
    const query = `
      INSERT INTO ideas_customers (idea_id, customer_id)
      VALUES ($1, $2)
      ON CONFLICT (idea_id, customer_id) DO NOTHING
      RETURNING idea_id
    `;
    
    const result = await this.pool.query(query, [ideaId, customerId]);
    return result.rowCount > 0;
  }
  
  /**
   * Remove association between an idea and a customer
   * @param {String} ideaId - Idea ID
   * @param {String} customerId - Customer ID
   * @returns {Promise<Boolean>} True if successful
   */
  async removeCustomer(ideaId, customerId) {
    const query = `
      DELETE FROM ideas_customers
      WHERE idea_id = $1 AND customer_id = $2
      RETURNING idea_id
    `;
    
    const result = await this.pool.query(query, [ideaId, customerId]);
    return result.rowCount > 0;
  }

  /**
   * Override validateForCreate to add idea-specific validation
   * @param {Object} data - Idea data
   * @returns {Promise<Object>} Validated idea data
   */
  async validateForCreate(data) {
    // Call parent validation first
    const baseValidated = await super.validateForCreate(data);
    
    // Idea-specific validation
    if (!baseValidated.title) {
      throw new Error('title is required for ideas');
    }
    
    if (!baseValidated.priority) {
      throw new Error('priority is required for ideas');
    }
    
    if (!['urgent', 'high', 'medium', 'low'].includes(baseValidated.priority)) {
      throw new Error('invalid priority: must be one of urgent, high, medium, low');
    }
    
    if (!baseValidated.effort) {
      throw new Error('effort is required for ideas');
    }
    
    if (!['xs', 's', 'm', 'l', 'xl'].includes(baseValidated.effort)) {
      throw new Error('invalid effort: must be one of xs, s, m, l, xl');
    }
    
    if (!baseValidated.status) {
      throw new Error('status is required for ideas');
    }
    
    if (!['new', 'planned', 'completed', 'rejected'].includes(baseValidated.status)) {
      throw new Error('invalid status: must be one of new, planned, completed, rejected');
    }
    
    // Ensure source is set
    if (!baseValidated.source) {
      baseValidated.source = 'internal';
    }
    
    // Ensure description is not null or undefined
    if (baseValidated.description === null || baseValidated.description === undefined) {
      baseValidated.description = '';
    }
    
    return baseValidated;
  }

  /**
   * Find ideas with full query options support
   * @param {String} tenantId - The tenant ID
   * @param {Object} options - Query options (sort, order, limit, offset, filters)
   * @returns {Promise<Array>} Array of ideas with customer info
   */
  async findByTenantWithOptions(tenantId, options = {}) {
    const {
      sort = 'created_at',
      order = 'desc',
      limit = 50,
      offset = 0,
      filters = {}
    } = options;
    
    // Build the base query
    let query = `
      SELECT i.*, 
             c.id as customer_id, 
             c.name as customer_name,
             COUNT(DISTINCT com.id) as comment_count
      FROM ${this.tableName} i
      LEFT JOIN ideas_customers ic ON i.id = ic.idea_id
      LEFT JOIN customers c ON ic.customer_id = c.id
      LEFT JOIN comments com ON com.entity_id = i.id AND com.entity_type = 'idea'
      WHERE i.tenant_id = $1
    `;
    
    const values = [tenantId];
    let paramIndex = 2;
    
    // Add filters
    if (filters.status) {
      query += ` AND i.status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }
    
    if (filters.priority) {
      query += ` AND i.priority = $${paramIndex}`;
      values.push(filters.priority);
      paramIndex++;
    }
    
    if (filters.initiative_id) {
      query += ` AND i.initiative_id = $${paramIndex}`;
      values.push(filters.initiative_id);
      paramIndex++;
    }
    
    if (filters.customer_id) {
      query += ` AND ic.customer_id = $${paramIndex}`;
      values.push(filters.customer_id);
      paramIndex++;
    }
    
    // Handle search
    if (filters.search) {
      query += ` AND (i.title ILIKE $${paramIndex} OR i.description ILIKE $${paramIndex})`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    // Group by to handle the aggregations
    query += ` GROUP BY i.id, c.id, c.name`;
    
    // Apply sorting - need to check if sorting on customer fields
    if (sort === 'customer_name') {
      query += ` ORDER BY c.name ${order}, i.created_at DESC`;
    } else {
      query += ` ORDER BY i.${sort} ${order}`;
    }
    
    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);
    
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  /**
   * Find ideas by tenant ID (alias for findByTenant)
   * @param {String} tenantId - The tenant ID
   * @param {String} status - Optional filter by status
   * @returns {Promise<Array>} Array of ideas
   */
  async findByTenantId(tenantId, status = null) {
    return this.findByTenant(tenantId, status);
  }
}

module.exports = {
  IdeaModel
}; 