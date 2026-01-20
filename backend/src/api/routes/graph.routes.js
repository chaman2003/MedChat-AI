/**
 * Graph Routes
 * GET /api/graph - Get all nodes and edges for visualization
 */
const { Router } = require("express");
const graphController = require("../controllers/graph.controller");

const router = Router();

// GET /api/graph - Retrieve all nodes and edges from Neo4j
router.get("/", graphController.getGraph);

module.exports = router;
