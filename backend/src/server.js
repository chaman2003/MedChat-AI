// Express Server - Medical Chat API with Neo4j + Supabase Vector Search
require("dotenv").config({ path: __dirname + "/../.env" });

const express = require("express");
const cors = require("cors");
const { handleChat } = require("./chat");
const { closeDriver, runQuery } = require("./neo4j-driver");

// Check if embeddings are enabled
const EMBEDDINGS_ENABLED = process.env.ENABLE_EMBEDDINGS?.toLowerCase() === "yes";

// Conditionally load vector modules
let initVectorTable, closePool, semanticSearch, findTreatmentOptions, getCacheStats;
if (EMBEDDINGS_ENABLED) {
  const supabaseDriver = require("./supabase-driver");
  const vectorSearch = require("./vector-search");
  const embeddingService = require("./embedding-service");
  initVectorTable = supabaseDriver.initVectorTable;
  closePool = supabaseDriver.closePool;
  semanticSearch = vectorSearch.semanticSearch;
  findTreatmentOptions = vectorSearch.findTreatmentOptions;
  getCacheStats = embeddingService.getCacheStats;
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Initialize vector table on startup (only if embeddings enabled)
async function initializeServices() {
  if (!EMBEDDINGS_ENABLED) {
    console.log("⚠️ Embeddings DISABLED (ENABLE_EMBEDDINGS=no)");
    return;
  }
  
  try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_DB_URL) {
      console.log("🔄 Initializing Supabase vector table...");
      await initVectorTable();
      console.log("✅ Vector search ready");
    } else {
      console.log("⚠️ Supabase not configured - vector search disabled");
    }
  } catch (error) {
    console.error("⚠️ Vector init warning:", error.message);
    console.log("   Continuing without vector search...");
  }
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    llm_provider: "groq",
    database: "neo4j",
    embeddings_enabled: EMBEDDINGS_ENABLED,
    vector_db: EMBEDDINGS_ENABLED && process.env.SUPABASE_URL ? "supabase" : "disabled",
    embedding_cache: EMBEDDINGS_ENABLED && getCacheStats ? getCacheStats() : null
  });
});

// Main chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { question, role, user_id, patient_id } = req.body;

    console.log(`[API] Question: "${question}", Role: ${role}, User: ${user_id}`);

    const result = await handleChat({
      question,
      role,
      user_id,
      patient_id
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("[API Error]", error.message);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Semantic search endpoint (direct vector search)
app.post("/search", async (req, res) => {
  // Check if embeddings are enabled
  if (!EMBEDDINGS_ENABLED) {
    return res.status(400).json({
      success: false,
      error: "Vector search is disabled. Set ENABLE_EMBEDDINGS=yes in .env to enable."
    });
  }

  try {
    const { query, type, limit = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ success: false, error: "Query is required" });
    }

    console.log(`[API] Semantic search: "${query}" (type: ${type || "all"})`);

    const results = await semanticSearch(query, type, limit);

    res.json({
      success: true,
      query,
      type: type || "all",
      results,
      count: results.length
    });
  } catch (error) {
    console.error("[Search Error]", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Treatment recommendations endpoint
app.post("/treatments", async (req, res) => {
  // Check if embeddings are enabled
  if (!EMBEDDINGS_ENABLED) {
    return res.status(400).json({
      success: false,
      error: "Treatment search is disabled. Set ENABLE_EMBEDDINGS=yes in .env to enable."
    });
  }

  try {
    const { condition, limit = 5 } = req.body;

    if (!condition) {
      return res.status(400).json({ success: false, error: "Condition description is required" });
    }

    console.log(`[API] Finding treatments for: "${condition}"`);

    const results = await findTreatmentOptions(condition, limit);

    res.json({
      success: true,
      condition,
      ...results
    });
  } catch (error) {
    console.error("[Treatment Error]", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Graph visualization endpoint - fetch all nodes and edges
app.get("/graph", async (req, res) => {
  try {
    console.log("[API] Fetching graph data for visualization...");

    // Fetch all nodes with their labels and properties
    const nodesQuery = `
      MATCH (n)
      RETURN 
        elementId(n) AS id,
        labels(n)[0] AS type,
        properties(n) AS props
    `;

    // Fetch all relationships
    const edgesQuery = `
      MATCH (a)-[r]->(b)
      RETURN 
        elementId(a) AS source,
        elementId(b) AS target,
        type(r) AS relationship,
        properties(r) AS props
    `;

    const [nodesResult, edgesResult] = await Promise.all([
      runQuery(nodesQuery),
      runQuery(edgesQuery)
    ]);

    // Process nodes - extract key properties for labels
    const nodes = nodesResult.map(record => {
      const props = record.props || {};
      // Determine best label: name > patient_id > test_name > id
      const label = props.name || props.patient_id || props.test_name || props.icd_code || record.id.slice(-6);
      
      return {
        id: record.id,
        type: record.type,
        label,
        ...props
      };
    });

    // Process edges
    const links = edgesResult.map(record => ({
      source: record.source,
      target: record.target,
      relationship: record.relationship,
      ...record.props
    }));

    // Count nodes by type
    const nodeTypes = nodes.reduce((acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    }, {});

    console.log(`[API] Graph loaded: ${nodes.length} nodes, ${links.length} edges`);

    res.json({
      success: true,
      graph: { nodes, links },
      nodeTypes,
      stats: {
        totalNodes: nodes.length,
        totalEdges: links.length
      }
    });
  } catch (error) {
    console.error("[Graph Error]", error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server with initialization
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    const vectorStatus = EMBEDDINGS_ENABLED && process.env.SUPABASE_URL ? "Supabase pgvector" : "Disabled";
    const embeddingStatus = EMBEDDINGS_ENABLED ? "HuggingFace (all-MiniLM-L6-v2)" : "Disabled";
    console.log(`
╔════════════════════════════════════════════════════════╗
║           MED-CHAT API SERVER (HYBRID)                 ║
╠════════════════════════════════════════════════════════╣
║  Status:      Running                                  ║
║  Port:        ${PORT}                                     ║
║  Graph DB:    Neo4j                                    ║
║  Vector DB:   ${vectorStatus.padEnd(38)}║
║  LLM:         Groq (${process.env.GROQ_MODEL || "gpt-oss-120b"})            ║
║  Embeddings:  ${embeddingStatus.padEnd(38)}║
╠════════════════════════════════════════════════════════╣
║  Endpoints:                                            ║
║    POST /chat       - Hybrid chat (graph + vector)     ║
║    POST /search     - Semantic vector search           ║
║    POST /treatments - Find treatment options           ║
║    GET  /graph      - Graph visualization data         ║
║    GET  /health     - Health check                     ║
╚════════════════════════════════════════════════════════╝
    `);
  });
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await closeDriver();
  if (EMBEDDINGS_ENABLED && closePool) {
    await closePool();
  }
  process.exit(0);
});
