/**
 * Customer model for managing customer data
 */
const BaseModel = require('./base');

class CustomerModel extends BaseModel {
  /**
   * @param {Object} pool - PostgreSQL connection pool
   */
  constructor(pool) {
    super(pool, 'customers');
  }
  
  /**
   * Find all customers for a tenant
   * @param {String} tenantId - The tenant ID
   * @param {String} status - Optional filter by status
   * @returns {Promise<Array>} Array of customers
   */
  async findByTenant(tenantId, status = null) {
    const filter = { tenant_id: tenantId };
    if (status) {
      filter.status = status;
    }
    return this.findAll(filter);
  }
  
  /**
   * Update customer status
   * @param {String} id - Customer ID
   * @param {String} status - New status ('active', 'inactive', or 'prospect')
   * @returns {Promise<Object|null>} The updated customer or null
   */
  async updateStatus(id, status) {
    if (!['active', 'inactive', 'prospect'].includes(status)) {
      throw new Error('Invalid status. Must be one of: active, inactive, prospect');
    }
    
    return this.update(id, { status });
  }
  
  /**
   * Get customer stats including idea and feedback counts
   * @param {String} tenantId - The tenant ID
   * @returns {Promise<Array>} Array of customers with stats
   */
  async getCustomerStats(tenantId) {
    const query = `
      SELECT * FROM customer_stats
      WHERE tenant_id = $1
    `;
    
    const result = await this.pool.query(query, [tenantId]);
    return result.rows;
  }

  /**
   * Override validateForCreate to add customer-specific validation
   * @param {Object} data - Customer data
   * @returns {Promise<Object>} Validated customer data
   */
  async validateForCreate(data) {
    // Call parent validation first
    const baseValidated = await super.validateForCreate(data);
    
    // Customer-specific validation
    if (!baseValidated.name) {
      throw new Error('name is required for customers');
    }
    
    if (!baseValidated.status) {
      throw new Error('status is required for customers');
    }
    
    if (!['active', 'inactive', 'prospect'].includes(baseValidated.status)) {
      throw new Error('invalid status: must be one of active, inactive, prospect');
    }
    
    // Handle revenue formatting - if revenue is a formatted string, parse it
    if (baseValidated.revenue && typeof baseValidated.revenue === 'string') {
      // Remove currency symbols, commas, and other non-numeric characters
      // But keep the decimal point and negative sign if present
      const cleanRevenue = baseValidated.revenue.replace(/[^-\d.]/g, '');
      
      // Convert to a numeric value if it's a valid number
      if (!isNaN(parseFloat(cleanRevenue))) {
        baseValidated.revenue = parseFloat(cleanRevenue);
        console.log(`Converted revenue from "${data.revenue}" to ${baseValidated.revenue}`);
      } else if (baseValidated.revenue.trim() === '') {
        // If it's an empty string after cleaning, set to null
        baseValidated.revenue = null;
      } else {
        throw new Error('invalid revenue format: must be a valid numeric value');
      }
    }
    
    return baseValidated;
  }

  /**
   * Find customers with full query options support
   * @param {String} tenantId - The tenant ID
   * @param {Object} options - Query options (sort, order, limit, offset, filters)
   * @returns {Promise<Array>} Array of customers with related data
   */
  async findByTenantWithOptions(tenantId, options = {}) {
    const {
      sort = 'name',
      order = 'asc',
      limit = 50,
      offset = 0,
      filters = {}
    } = options;
    
    // Build the query with idea and feedback counts
    let query = `
      SELECT c.*, 
        COALESCE(COUNT(DISTINCT ic.idea_id), 0) as idea_count, 
        COALESCE(COUNT(DISTINCT fc.feedback_id), 0) as feedback_count
      FROM ${this.tableName} c
      LEFT JOIN ideas_customers ic ON c.id = ic.customer_id
      LEFT JOIN feedback_customers fc ON c.id = fc.customer_id
      WHERE c.tenant_id = $1
    `;
    
    const values = [tenantId];
    let paramIndex = 2;
    
    // Add filters
    if (filters.status) {
      query += ` AND c.status = $${paramIndex}`;
      values.push(filters.status);
      paramIndex++;
    }
    
    // Handle text search
    if (filters.search) {
      query += ` AND (c.name ILIKE $${paramIndex}`;
      values.push(`%${filters.search}%`);
      paramIndex++;
      
      // Also search by revenue if the search term is a number
      if (!isNaN(parseFloat(filters.search))) {
        query += ` OR c.revenue::text LIKE $${paramIndex}`;
        values.push(`%${filters.search}%`);
        paramIndex++;
      }
      
      query += `)`;
    }
    
    // Group by to handle the aggregations
    query += ` GROUP BY c.id`;
    
    // Apply sorting
    if (sort === 'idea_count') {
      query += ` ORDER BY idea_count ${order}, c.name ASC`;
    } else if (sort === 'feedback_count') {
      query += ` ORDER BY feedback_count ${order}, c.name ASC`;
    } else if (sort === 'revenue') {
      query += ` ORDER BY c.revenue ${order} NULLS LAST, c.name ASC`;
    } else {
      query += ` ORDER BY c.${sort} ${order}`;
    }
    
    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);
    
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  /**
   * Find customers by tenant ID (alias for findByTenant)
   * @param {String} tenantId - The tenant ID
   * @param {String} status - Optional filter by status
   * @returns {Promise<Array>} Array of customers
   */
  async findByTenantId(tenantId, status = null) {
    return this.findByTenant(tenantId, status);
  }
}

module.exports = {
  CustomerModel
}; 