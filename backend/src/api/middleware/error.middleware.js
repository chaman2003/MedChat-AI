/**
 * Error Handling Middleware
 * Centralized error handling for all API errors
 */

/**
 * Not Found Handler
 * Catches requests to undefined routes
 */
function notFoundHandler(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

/**
 * Global Error Handler
 * Processes all errors and sends appropriate responses
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  // Log error details (only in development)
  if (process.env.NODE_ENV !== "production") {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌ Error:", message);
    console.error("📍 Path:", req.originalUrl);
    console.error("🔧 Method:", req.method);
    if (err.stack) {
      console.error("📚 Stack:", err.stack);
    }
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Async Handler Wrapper
 * Wraps async controller functions to catch errors automatically
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware function
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create App Error
 * Factory function to create application errors with status codes
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @returns {Error} Error object with statusCode
 */
function createAppError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler,
  createAppError,
};
