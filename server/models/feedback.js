/**
 * Feedback model for customer feedback management
 */
const BaseModel = require('./base');

class FeedbackModel extends BaseModel {
  /**
   * @param {Object} pool - PostgreSQL connection pool
   */
  constructor(pool) {
    super(pool, 'feedback');
  }
  
  /**
   * Find all feedback for a tenant
   * @param {String} tenantId - The tenant ID
   * @param {String} sentiment - Optional filter by sentiment
   * @returns {Promise<Array>} Array of feedback
   */
  async findByTenant(tenantId, sentiment = null) {
    const filter = { tenant_id: tenantId };
    if (sentiment) {
      filter.sentiment = sentiment;
    }
    return this.findAll(filter);
  }
  
  /**
   * Get feedback with their associated customers
   * @param {String} tenantId - The tenant ID
   * @returns {Promise<Array>} Array of feedback with customer information
   */
  async getFeedbackWithCustomers(tenantId) {
    const query = `
      SELECT f.*, json_agg(c.*) as customers
      FROM feedback f
      LEFT JOIN feedback_customers fc ON f.id = fc.feedback_id
      LEFT JOIN customers c ON fc.customer_id = c.id
      WHERE f.tenant_id = $1
      GROUP BY f.id
    `;
    
    const result = await this.pool.query(query, [tenantId]);
    return result.rows;
  }
  
  /**
   * Get feedback with their associated initiatives
   * @param {String} tenantId - The tenant ID
   * @returns {Promise<Array>} Array of feedback with initiative information
   */
  async getFeedbackWithInitiatives(tenantId) {
    const query = `
      SELECT f.*, json_agg(i.*) as initiatives
      FROM feedback f
      LEFT JOIN feedback_initiatives fi ON f.id = fi.feedback_id
      LEFT JOIN initiatives i ON fi.initiative_id = i.id
      WHERE f.tenant_id = $1
      GROUP BY f.id
    `;
    
    const result = await this.pool.query(query, [tenantId]);
    return result.rows;
  }
  
  /**
   * Associate feedback with a customer
   * @param {String} feedbackId - Feedback ID
   * @param {String} customerId - Customer ID
   * @returns {Promise<Boolean>} True if successful
   */
  async addCustomer(feedbackId, customerId) {
    const query = `
      INSERT INTO feedback_customers (feedback_id, customer_id)
      VALUES ($1, $2)
      ON CONFLICT (feedback_id, customer_id) DO NOTHING
      RETURNING feedback_id
    `;
    
    const result = await this.pool.query(query, [feedbackId, customerId]);
    return result.rowCount > 0;
  }
  
  /**
   * Remove association between feedback and a customer
   * @param {String} feedbackId - Feedback ID
   * @param {String} customerId - Customer ID
   * @returns {Promise<Boolean>} True if successful
   */
  async removeCustomer(feedbackId, customerId) {
    const query = `
      DELETE FROM feedback_customers
      WHERE feedback_id = $1 AND customer_id = $2
      RETURNING feedback_id
    `;
    
    const result = await this.pool.query(query, [feedbackId, customerId]);
    return result.rowCount > 0;
  }
  
  /**
   * Associate feedback with an initiative
   * @param {String} feedbackId - Feedback ID
   * @param {String} initiativeId - Initiative ID
   * @returns {Promise<Boolean>} True if successful
   */
  async addInitiative(feedbackId, initiativeId) {
    const query = `
      INSERT INTO feedback_initiatives (feedback_id, initiative_id)
      VALUES ($1, $2)
      ON CONFLICT (feedback_id, initiative_id) DO NOTHING
      RETURNING feedback_id
    `;
    
    const result = await this.pool.query(query, [feedbackId, initiativeId]);
    return result.rowCount > 0;
  }
  
  /**
   * Remove association between feedback and an initiative
   * @param {String} feedbackId - Feedback ID
   * @param {String} initiativeId - Initiative ID
   * @returns {Promise<Boolean>} True if successful
   */
  async removeInitiative(feedbackId, initiativeId) {
    const query = `
      DELETE FROM feedback_initiatives
      WHERE feedback_id = $1 AND initiative_id = $2
      RETURNING feedback_id
    `;
    
    const result = await this.pool.query(query, [feedbackId, initiativeId]);
    return result.rowCount > 0;
  }
  
  /**
   * Create a new feedback with validation
   * @param {Object} feedbackData - Feedback data
   * @returns {Promise<Object>} The created feedback
   */
  async createFeedback(feedbackData) {
    // Make sure required fields are present
    if (!feedbackData.tenant_id || !feedbackData.title || !feedbackData.sentiment) {
      throw new Error('Missing required fields: tenant_id, title, and sentiment are required');
    }
    
    // Validate sentiment
    if (!['positive', 'neutral', 'negative'].includes(feedbackData.sentiment)) {
      throw new Error('Invalid sentiment. Must be one of: positive, neutral, negative');
    }
    
    return this.create(feedbackData);
  }
}

module.exports = {
  FeedbackModel
}; 