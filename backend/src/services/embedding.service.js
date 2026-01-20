/**
 * Embedding Service
 * Generates vector embeddings using HuggingFace Inference API
 */
const { HfInference } = require("@huggingface/inference");
const config = require("../config");

// HuggingFace client
let hf = null;

// In-memory cache for embeddings
const embeddingCache = new Map();
const CACHE_MAX_SIZE = 1000;

/**
 * Initialize HuggingFace client
 */
function initHuggingFace() {
  if (!hf && config.huggingface.API_KEY) {
    hf = new HfInference(config.huggingface.API_KEY);
  }
  return hf;
}

/**
 * Generate embedding for text
 * Model: all-MiniLM-L6-v2 (384 dimensions)
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} Embedding vector
 */
async function generateEmbedding(text) {
  const cacheKey = text.toLowerCase().trim();
  
  // Check cache
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey);
  }

  const client = initHuggingFace();
  if (!client) {
    throw new Error("HuggingFace not configured");
  }

  try {
    const result = await client.featureExtraction({
      model: config.huggingface.MODEL,
      inputs: text,
    });

    // Handle nested array response
    let embedding = result;
    if (Array.isArray(result) && Array.isArray(result[0])) {
      embedding = result[0];
    }

    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error("Invalid embedding response");
    }

    // Cache with size limit
    if (embeddingCache.size >= CACHE_MAX_SIZE) {
      const firstKey = embeddingCache.keys().next().value;
      embeddingCache.delete(firstKey);
    }
    embeddingCache.set(cacheKey, embedding);

    return embedding;
  } catch (error) {
    console.error("❌ Embedding error:", error.message);
    
    // Retry once
    if (!error.retried) {
      console.log("⏳ Retrying embedding...");
      await new Promise((r) => setTimeout(r, 2000));
      error.retried = true;
      return generateEmbedding(text);
    }
    
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts
 * @param {string[]} texts - Array of texts
 * @param {number} delayMs - Delay between requests for rate limiting
 */
async function generateEmbeddingsBatch(texts, delayMs = 200) {
  const embeddings = [];
  
  for (let i = 0; i < texts.length; i++) {
    console.log(`  Embedding ${i + 1}/${texts.length}: "${texts[i].substring(0, 50)}..."`);
    
    const embedding = await generateEmbedding(texts[i]);
    embeddings.push({ text: texts[i], embedding });
    
    if (i < texts.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  
  return embeddings;
}

/**
 * Build searchable text from medical entity
 */
function buildSearchableText(entityType, data) {
  const builders = {
    disease: (d) => `${d.name}. ${d.description || ""}. ICD: ${d.icd_code || ""}`,
    drug: (d) => `${d.name} ${d.category || ""}. Dosage: ${d.dosage || ""}. Frequency: ${d.frequency || ""}`,
    symptom: (d) => `${d.name}. Severity: ${d.severity || "unknown"}`,
    allergen: (d) => `Allergy to ${d.name}. Reaction: ${d.reaction || "unknown"}. Severity: ${d.severity || "unknown"}`,
    patient: (d) => `Patient ${d.name}. Age: ${d.age || "unknown"}. Gender: ${d.gender || "unknown"}. Blood Type: ${d.blood_type || "unknown"}`,
    lab_result: (d) => `Lab test ${d.test_name}. Value: ${d.value} ${d.unit || ""}. Status: ${d.status || "unknown"}`,
  };

  return (builders[entityType] || JSON.stringify)(data).trim();
}

/**
 * Clear embedding cache
 */
function clearCache() {
  embeddingCache.clear();
  console.log("🗑️ Embedding cache cleared");
}

/**
 * Get cache statistics
 */
function getCacheStats() {
  return {
    size: embeddingCache.size,
    maxSize: CACHE_MAX_SIZE,
  };
}

module.exports = {
  initHuggingFace,
  generateEmbedding,
  generateEmbeddingsBatch,
  buildSearchableText,
  clearCache,
  getCacheStats,
};
