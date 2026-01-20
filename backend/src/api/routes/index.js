/**
 * API Routes Index
 * Combines all route modules and exports a single router
 * 
 * Route Structure:
 * - /api/chat     -> Chat endpoints
 * - /api/graph    -> Graph visualization endpoints
 * - /api/search   -> Search endpoints
 * - /api/health   -> Health check endpoints
 * - /api/users    -> Doctors and patients endpoints
 */
const { Router } = require("express");

const chatRoutes = require("./chat.routes");
const graphRoutes = require("./graph.routes");
const searchRoutes = require("./search.routes");
const healthRoutes = require("./health.routes");
const usersRoutes = require("./users.routes");

const router = Router();

// Mount route modules
router.use("/chat", chatRoutes);
router.use("/graph", graphRoutes);
router.use("/search", searchRoutes);
router.use("/health", healthRoutes);
router.use("/users", usersRoutes);

module.exports = router;
