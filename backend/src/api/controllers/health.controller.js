/**
 * Health Controller
 * Handles health check and status requests
 */
const config = require("../../config");

// Conditionally load embedding service for cache stats
let getCacheStats = null;
if (config.features.EMBEDDINGS_ENABLED) {
  const embeddingService = require("../../services/embedding.service");
  getCacheStats = embeddingService.getCacheStats;
}

/**
 * GET /api/health
 * Health check endpoint
 */
async function healthCheck(req, res) {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      llm: {
        provider: "groq",
        model: config.groq.MODEL,
      },
      database: {
        type: "neo4j",
        connected: true,
      },
      embeddings: {
        enabled: config.features.EMBEDDINGS_ENABLED,
        provider: config.features.EMBEDDINGS_ENABLED ? "huggingface" : "disabled",
        model: config.features.EMBEDDINGS_ENABLED ? config.huggingface.MODEL : null,
        cache: getCacheStats ? getCacheStats() : null,
      },
      vector_db: {
        type: config.features.EMBEDDINGS_ENABLED ? "supabase/pgvector" : "disabled",
      },
    },
  });
}

module.exports = {
  healthCheck,
};
