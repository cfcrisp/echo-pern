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
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [feedbackId, customerId]);
    return result.rowCount > 0;
  }
  
  /**
   * Remove all customers from feedback (many-to-many)
   * @param {String} feedbackId - The feedback ID
   * @returns {Promise<Boolean>} True if successful
   */
  async removeAllCustomers(feedbackId) {
    const query = `
      DELETE FROM feedback_customers
      WHERE feedback_id = $1
    `;
    const result = await this.pool.query(query, [feedbackId]);
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
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [feedbackId, initiativeId]);
    return result.rowCount > 0;
  }
  
  /**
   * Remove all initiatives from feedback (many-to-many)
   * @param {String} feedbackId - The feedback ID
   * @returns {Promise<Boolean>} True if successful
   */
  async removeAllInitiatives(feedbackId) {
    const query = `
      DELETE FROM feedback_initiatives
      WHERE feedback_id = $1
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [feedbackId]);
    return result.rowCount > 0;
  }
  
  /**
   * Override validateForCreate to add feedback-specific validation
   * @param {Object} data - Feedback data
   * @returns {Promise<Object>} Validated feedback data
   */
  async validateForCreate(data) {
    // Call parent validation first
    const baseValidated = await super.validateForCreate(data);
    
    // Feedback-specific validation
    if (!baseValidated.title) {
      throw new Error('title is required for feedback');
    }
    
    if (!baseValidated.sentiment) {
      throw new Error('sentiment is required for feedback');
    }
    
    if (!['positive', 'neutral', 'negative'].includes(baseValidated.sentiment)) {
      throw new Error('invalid sentiment: must be one of positive, neutral, negative');
    }
    
    // Ensure description is not null or undefined
    if (baseValidated.description === null || baseValidated.description === undefined) {
      baseValidated.description = '';
    }
    
    return baseValidated;
  }

  /**
   * Find feedback with full query options support
   * @param {String} tenantId - The tenant ID
   * @param {Object} options - Query options (sort, order, limit, offset, filters)
   * @returns {Promise<Array>} Array of feedback with related data
   */
  async findByTenantWithOptions(tenantId, options = {}) {
    const {
      sort = 'created_at',
      order = 'desc',
      limit = 50,
      offset = 0,
      filters = {}
    } = options;
    
    // Build the base query with related data
    let query = `
      SELECT f.*, 
             c.id as customer_id, 
             c.name as customer_name,
             COUNT(DISTINCT com.id) as comment_count,
             array_agg(DISTINCT i.id) as initiative_ids,
             array_agg(DISTINCT i.title) as initiative_titles
      FROM ${this.tableName} f
      LEFT JOIN feedback_customers fc ON f.id = fc.feedback_id
      LEFT JOIN customers c ON fc.customer_id = c.id
      LEFT JOIN feedback_initiatives fi ON f.id = fi.feedback_id
      LEFT JOIN initiatives i ON fi.initiative_id = i.id
      LEFT JOIN comments com ON com.entity_id = f.id AND com.entity_type = 'feedback'
      WHERE f.tenant_id = $1
    `;
    
    const values = [tenantId];
    let paramIndex = 2;
    
    // Add filters
    if (filters.sentiment) {
      query += ` AND f.sentiment = $${paramIndex}`;
      values.push(filters.sentiment);
      paramIndex++;
    }
    
    if (filters.customer_id) {
      query += ` AND fc.customer_id = $${paramIndex}`;
      values.push(filters.customer_id);
      paramIndex++;
    }
    
    if (filters.initiative_id) {
      query += ` AND fi.initiative_id = $${paramIndex}`;
      values.push(filters.initiative_id);
      paramIndex++;
    }
    
    // Handle search
    if (filters.search) {
      query += ` AND (f.title ILIKE $${paramIndex} OR f.description ILIKE $${paramIndex})`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }
    
    // Group by to handle the aggregations
    query += ` GROUP BY f.id, c.id, c.name`;
    
    // Apply sorting
    if (sort === 'customer_name') {
      query += ` ORDER BY c.name ${order}, f.created_at DESC`;
    } else {
      query += ` ORDER BY f.${sort} ${order}`;
    }
    
    // Add pagination
    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);
    
    const result = await this.pool.query(query, values);
    
    // Format the result to handle array_agg NULL values
    return result.rows.map(row => {
      // Filter out null values from arrays and create initiatives array
      const initiatives = [];
      if (row.initiative_ids && row.initiative_ids[0] !== null) {
        for (let i = 0; i < row.initiative_ids.length; i++) {
          initiatives.push({
            id: row.initiative_ids[i],
            title: row.initiative_titles[i] || ''
          });
        }
      }
      
      // Remove the raw arrays
      const { initiative_ids, initiative_titles, ...rest } = row;
      
      // Return formatted object
      return {
        ...rest,
        initiatives
      };
    });
  }

  /**
   * Find feedback by tenant ID (alias for findByTenant)
   * @param {String} tenantId - The tenant ID
   * @param {String} sentiment - Optional filter by sentiment
   * @returns {Promise<Array>} Array of feedback
   */
  async findByTenantId(tenantId, sentiment = null) {
    return this.findByTenant(tenantId, sentiment);
  }

  /**
   * Create a new feedback with validation
   * @param {Object} feedbackData - Feedback data
   * @returns {Promise<Object>} The created feedback
   */
  async createFeedback(feedbackData) {
    // This method is kept for backward compatibility
    // but delegates to the standard create method
    return this.create(feedbackData);
  }

  /**
   * Get customers associated with a feedback
   * @param {String} feedbackId - Feedback ID
   * @returns {Promise<Array>} Array of customer objects
   */
  async getCustomers(feedbackId) {
    // First get the feedback to find its tenant ID
    const feedback = await this.findById(feedbackId);
    if (!feedback) return [];
    
    const query = `
      SELECT c.*
      FROM customers c
      JOIN feedback_customers fc ON c.id = fc.customer_id
      WHERE fc.feedback_id = $1 AND c.tenant_id = $2
    `;
    const result = await this.pool.query(query, [feedbackId, feedback.tenant_id]);
    return result.rows;
  }

  /**
   * Get initiatives associated with a feedback
   * @param {String} feedbackId - Feedback ID
   * @returns {Promise<Array>} Array of initiative objects
   */
  async getInitiatives(feedbackId) {
    // First get the feedback to find its tenant ID
    const feedback = await this.findById(feedbackId);
    if (!feedback) return [];
    
    const query = `
      SELECT i.*
      FROM initiatives i
      JOIN feedback_initiatives fi ON i.id = fi.initiative_id
      WHERE fi.feedback_id = $1 AND i.tenant_id = $2
    `;
    const result = await this.pool.query(query, [feedbackId, feedback.tenant_id]);
    return result.rows;
  }
}

module.exports = {
  FeedbackModel
}; 