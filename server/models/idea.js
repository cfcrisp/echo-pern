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
}

module.exports = {
  IdeaModel
}; 