/**
 * Middleware Index
 * Exports all middleware for easy importing
 */
const { 
  notFoundHandler, 
  errorHandler, 
  asyncHandler, 
  createAppError 
} = require("./error.middleware");

const { 
  validateChatRequest, 
  validateSearchRequest, 
  validateTreatmentsRequest 
} = require("./validation.middleware");

const { 
  requestLogger, 
  detailedLogger 
} = require("./logger.middleware");

module.exports = {
  // Error handling
  notFoundHandler,
  errorHandler,
  asyncHandler,
  createAppError,
  
  // Validation
  validateChatRequest,
  validateSearchRequest,
  validateTreatmentsRequest,
  
  // Logging
  requestLogger,
  detailedLogger,
};
