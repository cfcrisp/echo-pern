/**
 * Tenant model for multi-tenancy
 */
const BaseModel = require('./base');

class TenantModel extends BaseModel {
  /**
   * @param {Object} pool - PostgreSQL connection pool
   */
  constructor(pool) {
    super(pool, 'tenants');
  }
  
  /**
   * Find a tenant by domain name
   * @param {String} domainName - The domain name to search for
   * @returns {Promise<Object|null>} The tenant or null
   */
  async findByDomain(domainName) {
    return this.findOne({ domain_name: domainName });
  }
  
  /**
   * Get all tenants with their user counts
   * @returns {Promise<Array>} Array of tenants with user counts
   */
  async getTenantsWithUserCounts() {
    const query = `
      SELECT t.*, COUNT(u.id) as user_count
      FROM tenants t
      LEFT JOIN users u ON t.id = u.tenant_id
      GROUP BY t.id
    `;
    
    const result = await this.pool.query(query);
    return result.rows;
  }
  
  /**
   * Update tenant plan tier
   * @param {String} id - Tenant ID
   * @param {String} planTier - New plan tier ('basic', 'pro', or 'enterprise')
   * @returns {Promise<Object|null>} The updated tenant or null
   */
  async updatePlanTier(id, planTier) {
    if (!['basic', 'pro', 'enterprise'].includes(planTier)) {
      throw new Error('Invalid plan tier. Must be one of: basic, pro, enterprise');
    }
    
    return this.update(id, { plan_tier: planTier });
  }
}

module.exports = {
  TenantModel
}; 