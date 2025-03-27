/**
 * Authentication service
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/environment');
const { UserModel, TenantModel } = require('../models');
const pool = require('../config/database');
const tenantService = require('./tenantService');

// Create model instances
const userModel = new UserModel(pool);
const tenantModel = new TenantModel(pool);

/**
 * Register a new user with automatic tenant assignment based on email domain
 * @param {String} email - User email
 * @param {String} password - User password (plain text)
 * @param {String} name - Optional user name
 * @returns {Promise<Object>} The created user (without password)
 */
async function registerUser(email, password, name = '') {
  console.log(`Starting registration for user: ${email}`);
  
  if (!email || !password) {
    console.error('Registration error: Email and password are required');
    throw new Error('Email and password are required');
  }
  
  try {
    console.log('Attempting to find or create tenant from email domain...');
    // Find or create tenant based on email domain
    const tenant = await tenantService.findOrCreateTenantFromEmail(email);
    console.log(`Tenant identified: ${tenant.id} (${tenant.domain_name})`);
    
    // Check if user with email already exists in tenant
    console.log('Checking if user already exists...');
    const existingUser = await userModel.findByEmail(tenant.id, email);
    if (existingUser) {
      console.error(`Registration error: User with email ${email} already exists`);
      throw new Error('User with this email already exists in this tenant');
    }
    
    // Hash the password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    console.log('Creating new user...');
    const user = await userModel.createUser({
      tenant_id: tenant.id,
      email,
      password_hash: passwordHash,
      role: 'user', // Default role
      name
    });
    
    console.log(`User successfully created with ID: ${user.id}`);
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  } catch (error) {
    console.error('Detailed error in registerUser:', error);
    
    // Add more detailed error message if it's a database error
    if (error.code) {
      console.error(`Database error code: ${error.code}, detail: ${error.detail}`);
    }
    
    throw error;
  }
}

/**
 * Register a new admin user (first user for a new tenant)
 * @param {String} tenantId - Tenant ID
 * @param {String} email - User email
 * @param {String} password - User password (plain text)
 * @param {String} name - Optional user name
 * @returns {Promise<Object>} The created admin user (without password)
 */
async function registerAdminUser(tenantId, email, password, name = '') {
  // Check if tenant exists
  const tenant = await tenantModel.findById(tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user with admin role
  const user = await userModel.createUser({
    tenant_id: tenantId,
    email,
    password_hash: passwordHash,
    role: 'admin',
    name
  });
  
  // Remove password hash from response
  const { password_hash, ...userWithoutPassword } = user;
  
  return userWithoutPassword;
}

/**
 * Login a user with email domain-based tenant assignment
 * @param {String} email - User email
 * @param {String} password - User password (plain text)
 * @returns {Promise<Object>} Object containing the user and JWT token
 */
async function loginUser(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  try {
    // Get tenant for this email domain
    const tenant = await tenantService.getTenantForEmail(email);
    
    if (!tenant) {
      throw new Error('No tenant found for this email domain');
    }
    
    // Find user by email within this tenant
    const user = await userModel.findByEmail(tenant.id, email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    // Generate JWT token
    const token = generateToken(user.id);
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Error in loginUser:', error);
    throw error;
  }
}

/**
 * Generate a JWT token for a user
 * @param {String} userId - User ID
 * @returns {String} JWT token
 */
function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Change user password
 * @param {String} userId - User ID
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Promise<Boolean>} Success status
 */
async function changePassword(userId, currentPassword, newPassword) {
  // Get user
  const user = await userModel.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
  
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }
  
  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  
  // Update password
  await userModel.update(userId, { password_hash: newPasswordHash });
  
  return true;
}

/**
 * Forgot password - Generate reset token
 * @param {String} email - User email
 * @param {String} domain - Tenant domain
 * @returns {Promise<String>} Reset token
 */
async function forgotPassword(email, domain) {
  // Find tenant by domain
  let tenant;
  
  // Use tenantService if no domain is provided
  if (!domain) {
    tenant = await tenantService.getTenantForEmail(email);
  } else {
    tenant = await tenantModel.findByDomain(domain);
  }
  
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  // Find user by email within this tenant
  const user = await userModel.findByEmail(tenant.id, email);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Generate a reset token (in a real application, this would be saved)
  const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // In a real application, you would:
  // 1. Save this token in your database with an expiration
  // 2. Send an email to the user with a link that includes this token
  
  return resetToken;
}

/**
 * Reset password using reset token
 * @param {String} resetToken - Reset token
 * @param {String} newPassword - New password
 * @returns {Promise<Boolean>} Success status
 */
async function resetPassword(resetToken, newPassword) {
  // In a real application, you would:
  // 1. Validate the reset token
  // 2. Check if it's expired
  // 3. Find the user associated with it
  
  // For this example, we'll assume the token is valid and linked to a user
  // In a real application, you should implement proper token validation
  
  // This is just a placeholder - you need to implement your token validation
  const userId = '00000000-0000-0000-0000-000000000000'; // Placeholder
  
  // Hash new password
  const newPasswordHash = await bcrypt.hash(newPassword, 10);
  
  // Update password
  await userModel.update(userId, { password_hash: newPasswordHash });
  
  return true;
}

module.exports = {
  registerUser,
  registerAdminUser,
  loginUser,
  generateToken,
  changePassword,
  forgotPassword,
  resetPassword
}; 