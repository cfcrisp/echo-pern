/**
 * Error handling utilities
 */

/**
 * Custom API Error class
 */
class ApiError extends Error {
  /**
   * @param {Number} statusCode - HTTP status code
   * @param {String} message - Error message
   * @param {Object|null} data - Additional error data
   */
  constructor(statusCode, message, data = null) {
    super(message);
    this.statusCode = statusCode;
    this.data = data;
    this.isOperational = true;
    
    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a 400 Bad Request error
 * @param {String} message - Error message
 * @param {Object|null} data - Additional error data
 * @returns {ApiError} Bad Request error
 */
function badRequest(message = 'Bad request', data = null) {
  return new ApiError(400, message, data);
}

/**
 * Create a 401 Unauthorized error
 * @param {String} message - Error message
 * @param {Object|null} data - Additional error data
 * @returns {ApiError} Unauthorized error
 */
function unauthorized(message = 'Unauthorized', data = null) {
  return new ApiError(401, message, data);
}

/**
 * Create a 403 Forbidden error
 * @param {String} message - Error message
 * @param {Object|null} data - Additional error data
 * @returns {ApiError} Forbidden error
 */
function forbidden(message = 'Forbidden', data = null) {
  return new ApiError(403, message, data);
}

/**
 * Create a 404 Not Found error
 * @param {String} message - Error message
 * @param {Object|null} data - Additional error data
 * @returns {ApiError} Not Found error
 */
function notFound(message = 'Resource not found', data = null) {
  return new ApiError(404, message, data);
}

/**
 * Create a 500 Internal Server Error
 * @param {String} message - Error message
 * @param {Object|null} data - Additional error data
 * @returns {ApiError} Internal Server Error
 */
function serverError(message = 'Internal server error', data = null) {
  return new ApiError(500, message, data);
}

/**
 * Express error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorMiddleware(err, req, res, next) {
  // If headers already sent, delegate to Express default error handler
  if (res.headersSent) {
    return next(err);
  }
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  
  // Log error for debugging
  console.error(`[ERROR] ${statusCode} - ${message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }
  
  // Send error response
  res.status(statusCode).json({
    error: message,
    ...(err.data && { data: err.data }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Async handler to catch async errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  ApiError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  errorMiddleware,
  asyncHandler
}; 