/**
 * Application Configuration
 * Centralized configuration management for all environment variables and constants
 */
require("dotenv").config({ path: __dirname + "/../../.env" });

const config = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Neo4j Database
  neo4j: {
    URI: process.env.NEO4J_URI,
    USER: process.env.NEO4J_USER,
    PASSWORD: process.env.NEO4J_PASSWORD,
  },

  // Supabase (PostgreSQL + pgvector)
  supabase: {
    URL: process.env.SUPABASE_URL,
    ANON_KEY: process.env.SUPABASE_ANON_KEY,
    DB_URL: process.env.SUPABASE_DB_URL,
  },

  // LLM Provider (Groq)
  groq: {
    API_KEY: process.env.GROQ_API_KEY,
    MODEL: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  },

  // Embeddings (HuggingFace)
  huggingface: {
    API_KEY: process.env.HUGGINGFACE_API_KEY,
    MODEL: "sentence-transformers/all-MiniLM-L6-v2",
    DIMENSIONS: 384,
  },

  // Feature Flags
  features: {
    EMBEDDINGS_ENABLED: process.env.ENABLE_EMBEDDINGS?.toLowerCase() === "yes",
  },

  // Validation
  validate() {
    const required = [
      ["NEO4J_URI", this.neo4j.URI],
      ["NEO4J_USER", this.neo4j.USER],
      ["NEO4J_PASSWORD", this.neo4j.PASSWORD],
      ["GROQ_API_KEY", this.groq.API_KEY],
    ];

    const missing = required.filter(([_, value]) => !value);
    if (missing.length > 0) {
      console.warn(`⚠️ Missing required env vars: ${missing.map(([k]) => k).join(", ")}`);
    }

    if (this.features.EMBEDDINGS_ENABLED) {
      const embeddingRequired = [
        ["SUPABASE_URL", this.supabase.URL],
        ["SUPABASE_DB_URL", this.supabase.DB_URL],
        ["HUGGINGFACE_API_KEY", this.huggingface.API_KEY],
      ];
      const missingEmbed = embeddingRequired.filter(([_, value]) => !value);
      if (missingEmbed.length > 0) {
        console.warn(`⚠️ Embeddings enabled but missing: ${missingEmbed.map(([k]) => k).join(", ")}`);
      }
    }

    return missing.length === 0;
  },
};

module.exports = config;
