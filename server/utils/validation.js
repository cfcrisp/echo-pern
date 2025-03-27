/**
 * Input validation utils
 */

/**
 * Validate an email address
 * @param {String} email - Email to validate
 * @returns {Boolean} True if valid, false otherwise
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a password
 * @param {String} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
function validatePassword(password) {
  if (!password || password.length < 8) {
    return { 
      isValid: false, 
      message: 'Password must be at least 8 characters long'
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain at least one number'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate a UUID
 * @param {String} uuid - UUID to validate
 * @returns {Boolean} True if valid, false otherwise
 */
function isValidUUID(uuid) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate pagination parameters
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Object} Validated page and limit values
 */
function validatePagination(page, limit) {
  const validatedPage = Number(page) || 1;
  const validatedLimit = Number(limit) || 10;
  
  return {
    page: validatedPage > 0 ? validatedPage : 1,
    limit: validatedLimit > 0 && validatedLimit <= 100 ? validatedLimit : 10,
    offset: (validatedPage - 1) * validatedLimit
  };
}

/**
 * Sanitize a string for safe usage in logs, etc.
 * @param {String} str - String to sanitize
 * @returns {String} Sanitized string
 */
function sanitizeString(str) {
  if (!str) return '';
  return String(str).replace(/[<>]/g, '');
}

module.exports = {
  isValidEmail,
  validatePassword,
  isValidUUID,
  validatePagination,
  sanitizeString
}; 