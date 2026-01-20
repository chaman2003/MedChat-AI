/**
 * Search Routes
 * POST /api/search - Semantic search
 * POST /api/search/treatments - Get treatments for a disease
 */
const { Router } = require("express");
const searchController = require("../controllers/search.controller");

const router = Router();

// POST /api/search - Perform semantic search on documents
router.post("/", searchController.semanticSearch);

// POST /api/search/treatments - Get treatments for a specific condition
router.post("/treatments", searchController.findTreatments);

module.exports = router;
