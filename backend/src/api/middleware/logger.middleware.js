/**
 * Logger Middleware
 * Request logging for debugging and monitoring
 */

/**
 * Request Logger
 * Logs incoming requests with timing information
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, originalUrl } = req;
  
  // Log request start
  console.log(`→ ${method} ${originalUrl}`);
  
  // Capture response finish
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Color code based on status
    let statusEmoji = "✓";
    if (statusCode >= 400 && statusCode < 500) {
      statusEmoji = "⚠";
    } else if (statusCode >= 500) {
      statusEmoji = "✗";
    }
    
    console.log(`${statusEmoji} ${method} ${originalUrl} ${statusCode} (${duration}ms)`);
  });
  
  next();
}

/**
 * Detailed Logger
 * Logs request body and headers (use in development only)
 */
function detailedLogger(req, res, next) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  console.log("📋 Headers:", JSON.stringify(req.headers, null, 2));
  
  if (Object.keys(req.body).length > 0) {
    console.log("📦 Body:", JSON.stringify(req.body, null, 2));
  }
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  next();
}

module.exports = {
  requestLogger,
  detailedLogger,
};
