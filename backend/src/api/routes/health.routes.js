/**
 * Health Routes
 * GET /api/health - Server health check
 */
const { Router } = require("express");
const healthController = require("../controllers/health.controller");

const router = Router();

// GET /api/health - Health check endpoint
router.get("/", healthController.healthCheck);

module.exports = router;
