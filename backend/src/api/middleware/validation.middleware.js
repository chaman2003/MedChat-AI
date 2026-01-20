/**
 * Validation Middleware
 * Request validation and sanitization
 */

/**
 * Validate Chat Request
 * Ensures message is present and valid
 */
function validateChatRequest(req, res, next) {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Message is required",
        field: "message",
      },
    });
  }
  
  if (typeof message !== "string") {
    return res.status(400).json({
      success: false,
      error: {
        message: "Message must be a string",
        field: "message",
      },
    });
  }
  
  if (message.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Message cannot be empty",
        field: "message",
      },
    });
  }
  
  // Sanitize message
  req.body.message = message.trim();
  
  next();
}

/**
 * Validate Search Request
 * Ensures query is present and valid
 */
function validateSearchRequest(req, res, next) {
  const { query } = req.body;
  
  if (!query) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Query is required",
        field: "query",
      },
    });
  }
  
  if (typeof query !== "string") {
    return res.status(400).json({
      success: false,
      error: {
        message: "Query must be a string",
        field: "query",
      },
    });
  }
  
  if (query.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Query cannot be empty",
        field: "query",
      },
    });
  }
  
  // Sanitize query
  req.body.query = query.trim();
  
  next();
}

/**
 * Validate Treatments Request
 * Ensures disease name is present and valid
 */
function validateTreatmentsRequest(req, res, next) {
  const { disease } = req.body;
  
  if (!disease) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Disease name is required",
        field: "disease",
      },
    });
  }
  
  if (typeof disease !== "string") {
    return res.status(400).json({
      success: false,
      error: {
        message: "Disease must be a string",
        field: "disease",
      },
    });
  }
  
  if (disease.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Disease name cannot be empty",
        field: "disease",
      },
    });
  }
  
  // Sanitize disease
  req.body.disease = disease.trim();
  
  next();
}

module.exports = {
  validateChatRequest,
  validateSearchRequest,
  validateTreatmentsRequest,
};
