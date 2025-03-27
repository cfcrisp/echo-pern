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
}

module.exports = {
  CustomerModel
}; 