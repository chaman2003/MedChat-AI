// Embedding Service - Using Official HuggingFace Inference SDK
// Uses sentence-transformers model for medical text embeddings
const { HfInference } = require("@huggingface/inference");
require("dotenv").config();

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const hf = new HfInference(HF_API_KEY);

// Simple in-memory cache to reduce API calls
const embeddingCache = new Map();
const CACHE_MAX_SIZE = 1000;

/**
 * Generate embedding for text using HuggingFace official SDK
 * Model: all-MiniLM-L6-v2 (384 dimensions)
 * Free tier: ~30,000 inference calls/month
 */
async function generateEmbedding(text) {
  // Check cache first
  const cacheKey = text.toLowerCase().trim();
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey);
  }

  try {
    // Use official HuggingFace SDK for feature extraction
    const result = await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: text,
    });

    // Result is already the embedding array
    let embedding = result;
    
    // If result is nested array, flatten it
    if (Array.isArray(result) && Array.isArray(result[0])) {
      embedding = result[0];
    }

    // Validate embedding
    if (!Array.isArray(embedding) || embedding.length === 0) {
      throw new Error(`Invalid embedding response`);
    }

    // Add to cache (with size limit)
    if (embeddingCache.size >= CACHE_MAX_SIZE) {
      // Remove oldest entry
      const firstKey = embeddingCache.keys().next().value;
      embeddingCache.delete(firstKey);
    }
    embeddingCache.set(cacheKey, embedding);

    return embedding;
  } catch (error) {
    console.error("❌ Embedding error:", error.message);
    
    // Retry once after short delay
    if (!error.retried) {
      console.log("⏳ Retrying embedding in 2s...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      error.retried = true;
      return generateEmbedding(text);
    }
    
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 * Handles rate limiting with delays
 */
async function generateEmbeddingsBatch(texts, delayMs = 200) {
  const embeddings = [];
  
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    console.log(`  Embedding ${i + 1}/${texts.length}: "${text.substring(0, 50)}..."`);
    
    const embedding = await generateEmbedding(text);
    embeddings.push({ text, embedding });
    
    // Rate limiting delay (except for last item)
    if (i < texts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return embeddings;
}

/**
 * Build searchable text from medical entity
 * Combines relevant fields for better semantic search
 */
function buildSearchableText(entityType, data) {
  switch (entityType) {
    case "disease":
      return `${data.name}. ${data.description || ""}. ICD Code: ${data.icd_code || ""}`.trim();
    
    case "drug":
      return `${data.name} ${data.category || ""}. Dosage: ${data.dosage || ""}. Frequency: ${data.frequency || ""}`.trim();
    
    case "symptom":
      return `${data.name}. Severity: ${data.severity || "unknown"}`.trim();
    
    case "allergen":
      return `Allergy to ${data.name}. Reaction: ${data.reaction || "unknown"}. Severity: ${data.severity || "unknown"}`.trim();
    
    case "patient":
      return `Patient ${data.name}. Age: ${data.age || "unknown"}. Gender: ${data.gender || "unknown"}. Blood Type: ${data.blood_type || "unknown"}`.trim();
    
    case "lab_result":
      return `Lab test ${data.test_name}. Value: ${data.value} ${data.unit || ""}. Status: ${data.status || "unknown"}`.trim();
    
    default:
      return JSON.stringify(data);
  }
}

/**
 * Clear embedding cache
 */
function clearCache() {
  embeddingCache.clear();
  console.log("🗑️ Embedding cache cleared");
}

/**
 * Get cache stats
 */
function getCacheStats() {
  return {
    size: embeddingCache.size,
    maxSize: CACHE_MAX_SIZE
  };
}

module.exports = {
  generateEmbedding,
  generateEmbeddingsBatch,
  buildSearchableText,
  clearCache,
  getCacheStats
};
