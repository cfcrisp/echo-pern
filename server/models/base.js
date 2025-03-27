/**
 * Base database model providing common CRUD operations
 */
class BaseModel {
  /**
   * @param {Object} pool - PostgreSQL connection pool
   * @param {String} tableName - Database table name
   * @param {String} primaryKey - Primary key column name (default: 'id')
   */
  constructor(pool, tableName, primaryKey = 'id') {
    this.pool = pool;
    this.tableName = tableName;
    this.primaryKey = primaryKey;
  }

  /**
   * Create a new record
   * @param {Object} data - Object containing column values
   * @returns {Promise<Object>} The created record
   */
  async create(data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    
    const query = `
      INSERT INTO ${this.tableName} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Find all records matching the filter criteria
   * @param {Object} filter - Filter criteria (optional)
   * @param {Number} limit - Maximum number of records to return (optional)
   * @param {Number} offset - Number of records to skip (optional)
   * @returns {Promise<Array>} Array of matching records
   */
  async findAll(filter = {}, limit = null, offset = 0) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(filter)) {
      conditions.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    let query = `SELECT * FROM ${this.tableName}`;
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    if (limit !== null) {
      query += ` LIMIT $${paramIndex}`;
      values.push(limit);
      paramIndex++;
    }
    
    if (offset > 0) {
      query += ` OFFSET $${paramIndex}`;
      values.push(offset);
    }
    
    const result = await this.pool.query(query, values);
    return result.rows;
  }

  /**
   * Find a single record by ID
   * @param {String|Number} id - Primary key value
   * @returns {Promise<Object|null>} The found record or null
   */
  async findById(id) {
    const query = `
      SELECT * FROM ${this.tableName}
      WHERE ${this.primaryKey} = $1
      LIMIT 1
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Find a single record by custom filter
   * @param {Object} filter - Filter criteria
   * @returns {Promise<Object|null>} The found record or null
   */
  async findOne(filter = {}) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(filter)) {
      conditions.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    let query = `
      SELECT * FROM ${this.tableName}
      WHERE ${conditions.join(' AND ')}
      LIMIT 1
    `;
    
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Update a record by ID
   * @param {String|Number} id - Primary key value
   * @param {Object} data - Object containing column values to update
   * @returns {Promise<Object|null>} The updated record or null
   */
  async update(id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, i) => `${col} = $${i + 1}`).join(', ');
    
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE ${this.primaryKey} = $${values.length + 1}
      RETURNING *
    `;
    
    const result = await this.pool.query(query, [...values, id]);
    return result.rows[0] || null;
  }

  /**
   * Delete a record by ID
   * @param {String|Number} id - Primary key value
   * @returns {Promise<Boolean>} True if successful, false otherwise
   */
  async delete(id) {
    const query = `
      DELETE FROM ${this.tableName}
      WHERE ${this.primaryKey} = $1
      RETURNING ${this.primaryKey}
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  /**
   * Count records matching the filter criteria
   * @param {Object} filter - Filter criteria (optional)
   * @returns {Promise<Number>} Number of matching records
   */
  async count(filter = {}) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    for (const [key, value] of Object.entries(filter)) {
      conditions.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
    
    let query = `SELECT COUNT(*) FROM ${this.tableName}`;
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    const result = await this.pool.query(query, values);
    return parseInt(result.rows[0].count, 10);
  }
}

module.exports = BaseModel; 