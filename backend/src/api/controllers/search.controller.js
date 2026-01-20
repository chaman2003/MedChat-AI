/**
 * Search Controller
 * Handles semantic/vector search requests
 */
const config = require("../../config");

// Conditionally load vector service
let vectorService = null;
if (config.features.EMBEDDINGS_ENABLED) {
  vectorService = require("../../services/vector.service");
}

/**
 * POST /api/search
 * Semantic vector search
 */
async function semanticSearch(req, res, next) {
  if (!config.features.EMBEDDINGS_ENABLED) {
    return res.status(400).json({
      success: false,
      error: "Vector search is disabled. Set ENABLE_EMBEDDINGS=yes in .env to enable.",
    });
  }

  try {
    const { query, type, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: "Query is required" });
    }

    console.log(`[API] Search: "${query}" (type: ${type || "all"})`);

    const results = await vectorService.semanticSearch(query, type, limit);

    res.json({
      success: true,
      query,
      type: type || "all",
      results,
      count: results.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/treatments
 * Find treatment options for a condition
 */
async function findTreatments(req, res, next) {
  if (!config.features.EMBEDDINGS_ENABLED) {
    return res.status(400).json({
      success: false,
      error: "Treatment search is disabled. Set ENABLE_EMBEDDINGS=yes in .env to enable.",
    });
  }

  try {
    const { condition, limit = 5 } = req.body;

    if (!condition) {
      return res.status(400).json({ success: false, error: "Condition is required" });
    }

    console.log(`[API] Treatments for: "${condition}"`);

    const results = await vectorService.findTreatmentOptions(condition, limit);

    res.json({
      success: true,
      condition,
      ...results,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  semanticSearch,
  findTreatments,
};
