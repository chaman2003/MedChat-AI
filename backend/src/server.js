// Express Server - Medical Chat API with Neo4j
require("dotenv").config({ path: __dirname + "/../.env" });

const express = require("express");
const cors = require("cors");
const { handleChat } = require("./chat");
const { closeDriver } = require("./neo4j-driver");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    llm_provider: "groq",
    database: "neo4j"
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

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║         MED-CHAT API SERVER                    ║
╠════════════════════════════════════════════════╣
║  Status:    Running                            ║
║  Port:      ${PORT}                               ║
║  Database:  Neo4j Graph DB                     ║
║  LLM:       ${process.env.LLM_PROVIDER} (${process.env.GROQ_MODEL})║
║  Model Temp: ${process.env.GROQ_TEMPERATURE || 0}                            ║
║  Max Tokens: ${process.env.GROQ_MAX_TOKENS || 1024}                          ║
╚════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down...");
  await closeDriver();
  process.exit(0);
});
