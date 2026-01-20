/**
 * Supabase Database Driver
 * PostgreSQL with pgvector for vector similarity search
 */
const { createClient } = require("@supabase/supabase-js");
const { Pool } = require("pg");
const config = require("../../config");

// Supabase client for API access
let supabase = null;

// PostgreSQL connection pool for pgvector queries
let pgPool = null;

/**
 * Initialize Supabase client
 */
function initSupabase() {
  if (!supabase && config.supabase.URL && config.supabase.ANON_KEY) {
    supabase = createClient(config.supabase.URL, config.supabase.ANON_KEY);
    console.log("✅ Supabase client initialized");
  }
  return supabase;
}

/**
 * Initialize PostgreSQL pool for pgvector
 */
function initPgPool() {
  if (!pgPool && config.supabase.DB_URL) {
    pgPool = new Pool({
      connectionString: config.supabase.DB_URL,
      ssl: { rejectUnauthorized: false },
    });
    console.log("✅ PostgreSQL pool initialized");
  }
  return pgPool;
}

/**
 * Initialize vector table and indexes
 */
async function initVectorTable() {
  const pool = initPgPool();
  const client = await pool.connect();
  
  try {
    // Enable pgvector extension
    await client.query("CREATE EXTENSION IF NOT EXISTS vector");

    // Create embeddings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS medical_embeddings (
        id SERIAL PRIMARY KEY,
        neo4j_id VARCHAR(255) NOT NULL,
        content_type VARCHAR(50) NOT NULL,
        content_text TEXT NOT NULL,
        embedding vector(384),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(neo4j_id, content_type)
      )
    `);

    // Create HNSW index for fast similarity search
    await client.query(`
      CREATE INDEX IF NOT EXISTS medical_embeddings_hnsw_idx 
      ON medical_embeddings 
      USING hnsw (embedding vector_cosine_ops)
    `);

    // Create index on content_type for filtering
    await client.query(`
      CREATE INDEX IF NOT EXISTS medical_embeddings_type_idx 
      ON medical_embeddings (content_type)
    `);

    console.log("✅ Vector table initialized with pgvector");
  } finally {
    client.release();
  }
}

/**
 * Insert or update embedding
 */
async function upsertEmbedding({ neo4jId, contentType, contentText, embedding, metadata = {} }) {
  const pool = initPgPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `
      INSERT INTO medical_embeddings (neo4j_id, content_type, content_text, embedding, metadata, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (neo4j_id, content_type) 
      DO UPDATE SET 
        content_text = EXCLUDED.content_text,
        embedding = EXCLUDED.embedding,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING id
      `,
      [neo4jId, contentType, contentText, `[${embedding.join(",")}]`, metadata]
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

/**
 * Vector similarity search
 */
async function searchSimilar({ queryEmbedding, contentType = null, limit = 5, threshold = 0.5 }) {
  const pool = initPgPool();
  const client = await pool.connect();
  
  try {
    const embeddingStr = `[${queryEmbedding.join(",")}]`;
    let query, params;

    if (contentType) {
      query = `
        SELECT neo4j_id, content_type, content_text, metadata,
               1 - (embedding <=> $1::vector) as similarity
        FROM medical_embeddings
        WHERE content_type = $2 AND 1 - (embedding <=> $1::vector) > $3
        ORDER BY embedding <=> $1::vector
        LIMIT $4
      `;
      params = [embeddingStr, contentType, threshold, limit];
    } else {
      query = `
        SELECT neo4j_id, content_type, content_text, metadata,
               1 - (embedding <=> $1::vector) as similarity
        FROM medical_embeddings
        WHERE 1 - (embedding <=> $1::vector) > $2
        ORDER BY embedding <=> $1::vector
        LIMIT $3
      `;
      params = [embeddingStr, threshold, limit];
    }

    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Get embeddings by content type
 */
async function getEmbeddingsByType(contentType) {
  const pool = initPgPool();
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      "SELECT * FROM medical_embeddings WHERE content_type = $1",
      [contentType]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

/**
 * Delete embedding
 */
async function deleteEmbedding(neo4jId, contentType) {
  const pool = initPgPool();
  const client = await pool.connect();
  
  try {
    await client.query(
      "DELETE FROM medical_embeddings WHERE neo4j_id = $1 AND content_type = $2",
      [neo4jId, contentType]
    );
  } finally {
    client.release();
  }
}

/**
 * Clear all embeddings
 */
async function clearAllEmbeddings() {
  const pool = initPgPool();
  const client = await pool.connect();
  
  try {
    await client.query("TRUNCATE TABLE medical_embeddings RESTART IDENTITY");
    console.log("🗑️ Cleared all embeddings");
  } finally {
    client.release();
  }
}

/**
 * Close PostgreSQL pool
 */
async function closePool() {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
    console.log("🔌 PostgreSQL pool closed");
  }
}

/**
 * Get pool instance
 */
function getPool() {
  return initPgPool();
}

module.exports = {
  initSupabase,
  initPgPool,
  initVectorTable,
  upsertEmbedding,
  searchSimilar,
  getEmbeddingsByType,
  deleteEmbedding,
  clearAllEmbeddings,
  closePool,
  getPool,
};
