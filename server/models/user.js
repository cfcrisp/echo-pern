/**
 * User model for authentication and user management
 */
const BaseModel = require('./base');

class UserModel extends BaseModel {
  /**
   * @param {Object} pool - PostgreSQL connection pool
   */
  constructor(pool) {
    super(pool, 'users');
  }
  
  /**
   * Find a user by email within a tenant
   * @param {String} tenantId - The tenant ID
   * @param {String} email - The email to search for
   * @returns {Promise<Object|null>} The user or null
   */
  async findByEmail(tenantId, email) {
    return this.findOne({ tenant_id: tenantId, email });
  }
  
  /**
   * Get all users for a tenant
   * @param {String} tenantId - The tenant ID
   * @returns {Promise<Array>} Array of users
   */
  async findByTenant(tenantId) {
    return this.findAll({ tenant_id: tenantId });
  }
  
  /**
   * Update user role
   * @param {String} id - User ID
   * @param {String} role - New role ('user' or 'admin')
   * @returns {Promise<Object|null>} The updated user or null
   */
  async updateRole(id, role) {
    if (!['user', 'admin'].includes(role)) {
      throw new Error('Invalid role. Must be one of: user, admin');
    }
    
    return this.update(id, { role });
  }
  
  /**
   * Update user password hash
   * @param {String} id - User ID
   * @param {String} passwordHash - New password hash
   * @returns {Promise<Object|null>} The updated user or null
   */
  async updatePassword(id, passwordHash) {
    return this.update(id, { password_hash: passwordHash });
  }
  
  /**
   * Create a new user with validation
   * @param {Object} userData - User data
   * @returns {Promise<Object>} The created user
   */
  async createUser(userData) {
    // Make sure required fields are present
    if (!userData.tenant_id || !userData.email || !userData.password_hash) {
      throw new Error('Missing required fields: tenant_id, email, and password_hash are required');
    }
    
    // Ensure email is lowercase for consistent comparison
    userData.email = userData.email.toLowerCase();
    
    // Check if user with email already exists in tenant
    const existingUser = await this.findByEmail(userData.tenant_id, userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists in this tenant');
    }
    
    // Set default role if not provided
    if (!userData.role) {
      userData.role = 'user';
    }
    
    // Validate role
    if (!['user', 'admin'].includes(userData.role)) {
      throw new Error('Invalid role. Must be one of: user, admin');
    }
    
    return this.create(userData);
  }
  
  /**
   * Update user profile information
   * @param {String} id - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object|null>} The updated user or null
   */
  async updateProfile(id, profileData) {
    // Only allow certain fields to be updated via this method
    const allowedFields = ['name', 'email'];
    
    const filteredData = {};
    for (const field of allowedFields) {
      if (profileData[field] !== undefined) {
        filteredData[field] = profileData[field];
      }
    }
    
    if (filteredData.email) {
      filteredData.email = filteredData.email.toLowerCase();
      
      // Get current user to check tenant
      const user = await this.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check if new email is already used by another user in the same tenant
      const existingUser = await this.findByEmail(user.tenant_id, filteredData.email);
      if (existingUser && existingUser.id !== id) {
        throw new Error('Email already in use by another user in this tenant');
      }
    }
    
    return this.update(id, filteredData);
  }
  
  /**
   * Get users with basic stats (comments, etc.)
   * @param {String} tenantId - The tenant ID
   * @returns {Promise<Array>} Array of users with stats
   */
  async getUsersWithStats(tenantId) {
    const query = `
      SELECT 
        u.id, 
        u.email, 
        u.name,
        u.role,
        u.created_at,
        COUNT(DISTINCT c.id) as comment_count
      FROM 
        users u
      LEFT JOIN 
        comments c ON u.id = c.user_id
      WHERE 
        u.tenant_id = $1
      GROUP BY 
        u.id, u.email, u.name, u.role, u.created_at
      ORDER BY 
        u.created_at DESC
    `;
    
    const result = await this.pool.query(query, [tenantId]);
    
    // Remove sensitive information
    return result.rows.map(user => {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}

module.exports = {
  UserModel
}; 