/**
 * Express Application Setup
 * Configures Express with middleware and routes
 * 
 * Separation of app.js from server.js allows:
 * - Easier testing (import app without starting server)
 * - Clear separation of HTTP config from business logic
 */
const express = require("express");
const cors = require("cors");

// API modules
const apiRoutes = require("./api/routes");
const { 
  requestLogger, 
  notFoundHandler, 
  errorHandler 
} = require("./api/middleware");

// Create Express app
const app = express();

// ─────────────────────────────────────────────────────────────
// Core Middleware
// ─────────────────────────────────────────────────────────────

// CORS - Allow cross-origin requests
app.use(cors());

// JSON body parser
app.use(express.json());

// Request logging
app.use(requestLogger);

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────

// Mount all API routes under /api prefix
app.use("/api", apiRoutes);

// ─────────────────────────────────────────────────────────────
// Error Handling
// ─────────────────────────────────────────────────────────────

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

module.exports = app;
