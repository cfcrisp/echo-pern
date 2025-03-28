/**
 * Tenant service for email domain-based assignment
 */
const { TenantModel } = require('../models');
const pool = require('../config/database');

// Create tenant model instance
const tenantModel = new TenantModel(pool);

// List of restricted domains that cannot be used as tenants
const RESTRICTED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'zoho.com',
  'yandex.com',
  'live.com',
  'msn.com'
];

/**
 * Extract domain from an email address
 * @param {String} email - The email address
 * @returns {String} The domain part of the email
 */
function extractDomainFromEmail(email) {
  // Check if email contains @ symbol
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email format');
  }
  
  // Extract the domain part (everything after @)
  const domain = email.split('@')[1];
  
  if (!domain || domain.length === 0) {
    throw new Error('Invalid domain format');
  }
  
  return domain;
}

/**
 * Check if domain is restricted from being used as a tenant
 * @param {String} domain - The domain to check
 * @returns {Boolean} True if domain is restricted, false otherwise
 */
function isRestrictedDomain(domain) {
  return RESTRICTED_DOMAINS.includes(domain.toLowerCase());
}

/**
 * Find or create a tenant based on email domain
 * @param {String} email - The user's email address
 * @returns {Promise<Object>} The tenant object
 */
async function findOrCreateTenantFromEmail(email) {
  try {
    // Extract domain from email
    const domain = extractDomainFromEmail(email);
    
    // Check if this is a restricted domain
    if (isRestrictedDomain(domain)) {
      throw new Error(`Cannot create tenant using public email domain '${domain}'. Please use a business or organization email.`);
    }
    
    // Check if a tenant with this domain already exists
    let tenant = await tenantModel.findByDomain(domain);
    
    // If tenant doesn't exist, create a new one with default settings
    if (!tenant) {
      tenant = await tenantModel.create({
        domain_name: domain,
        plan_tier: 'basic' // Default plan tier
      });
      console.log(`Created new tenant for domain: ${domain}`);
    }
    
    return tenant;
  } catch (error) {
    console.error('Error in findOrCreateTenantFromEmail:', error);
    throw error;
  }
}

/**
 * Get the tenant for a user based on their email domain
 * @param {String} email - The user's email address
 * @returns {Promise<Object>} The tenant object
 */
async function getTenantForEmail(email) {
  try {
    const domain = extractDomainFromEmail(email);
    const tenant = await tenantModel.findByDomain(domain);
    return tenant;
  } catch (error) {
    console.error('Error in getTenantForEmail:', error);
    throw error;
  }
}

module.exports = {
  extractDomainFromEmail,
  findOrCreateTenantFromEmail,
  getTenantForEmail,
  isRestrictedDomain
}; 