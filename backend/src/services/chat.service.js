/**
 * Chat Service
 * Core business logic for RAG-based medical chat
 */
const config = require("../config");
const {
  extractPatientId,
  determineQueryType,
  needsSemanticSearch,
  detectContentType,
} = require("./entity.service");
const {
  getPatientProfile,
  getPatientDiseases,
  getPatientMedications,
  getPatientSymptoms,
  getPatientTreatments,
  getPatientLabResults,
  getPatientAllergies,
  getPatientHistory,
  getFullPatientProfile,
} = require("../db/neo4j");
const { callGroq } = require("./llm.service");

// Conditionally load vector services
let vectorService = null;
if (config.features.EMBEDDINGS_ENABLED) {
  vectorService = require("./vector.service");
  console.log("[Chat] Vector search ENABLED");
} else {
  console.log("[Chat] Vector search DISABLED");
}

// Query handlers mapping
const queryHandlers = {
  profile: getPatientProfile,
  diseases: getPatientDiseases,
  medications: getPatientMedications,
  symptoms: getPatientSymptoms,
  treatments: getPatientTreatments,
  lab_results: getPatientLabResults,
  allergies: getPatientAllergies,
  history: getPatientHistory,
  full: getFullPatientProfile,
};

/**
 * Main chat handler
 */
async function handleChat({ question, role, user_id, patient_id }) {
  // Validate input
  if (!question || !role || !user_id) {
    throw new Error("Missing required fields: question, role, user_id");
  }

  if (role !== "doctor" && role !== "patient") {
    throw new Error("Invalid role. Must be 'doctor' or 'patient'");
  }

  // Check for semantic search (if enabled)
  const useSemanticSearch = config.features.EMBEDDINGS_ENABLED && needsSemanticSearch(question);
  
  if (useSemanticSearch) {
    console.log("[Chat] Using hybrid search (Neo4j + Vector)");
    return handleHybridSearch({ question, role, user_id, patient_id });
  }

  // Extract patient ID
  let targetPatient = extractPatientId(question) || patient_id;

  // Authorization check
  if (role === "patient") {
    targetPatient = user_id;
  } else if (role === "doctor" && !targetPatient) {
    throw new Error("Doctor must specify or mention a patient ID");
  }

  if (!targetPatient) {
    throw new Error("Could not determine patient ID. Please mention patient ID (e.g., P001)");
  }

  // Determine query type
  const queryType = determineQueryType(question);
  console.log(`[Chat] Patient: ${targetPatient}, Query: ${queryType}`);

  // Query Neo4j
  const queryHandler = queryHandlers[queryType] || getFullPatientProfile;
  const graphData = await queryHandler(targetPatient);

  // Check results
  if (!graphData || (Array.isArray(graphData) && graphData.length === 0)) {
    return {
      answer: `No ${queryType} data found for patient ${targetPatient}. Please verify the patient ID.`,
      source: "neo4j",
      query_type: queryType,
      patient_id: targetPatient,
      data_found: false,
    };
  }

  // Build prompt and call LLM
  const prompt = buildPrompt(question, queryType, targetPatient, graphData);
  const answer = await callGroq(prompt);

  return {
    answer,
    source: "neo4j",
    query_type: queryType,
    patient_id: targetPatient,
    data_found: true,
    records_retrieved: Array.isArray(graphData) ? graphData.length : 1,
  };
}

/**
 * Handle hybrid search (graph + vector)
 */
async function handleHybridSearch({ question, role, user_id, patient_id }) {
  const contentType = detectContentType(question);
  let targetPatient = extractPatientId(question) || patient_id;

  if (role === "patient") {
    targetPatient = user_id;
  }

  console.log(`[Hybrid] Content: ${contentType || "all"}, Patient: ${targetPatient || "none"}`);

  // Vector search
  const vectorResults = await vectorService.semanticSearch(question, contentType, 5);

  // Patient context
  let patientContext = null;
  if (targetPatient) {
    try {
      patientContext = await getFullPatientProfile(targetPatient);
    } catch (e) {
      console.log("[Hybrid] No patient context");
    }
  }

  // Generate response
  const prompt = buildHybridPrompt(question, vectorResults, patientContext);
  const answer = await callGroq(prompt);

  return {
    answer,
    source: "hybrid",
    query_type: "semantic_search",
    patient_id: targetPatient,
    data_found: vectorResults.length > 0,
    records_retrieved: vectorResults.length,
    similar_items: vectorResults.map((r) => ({
      type: r.type,
      text: r.text,
      similarity: r.similarity,
    })),
  };
}

/**
 * Build prompt for standard queries
 */
function buildPrompt(question, queryType, patientId, data) {
  return `
PATIENT DATA FROM MEDICAL GRAPH DATABASE:
==========================================
Patient ID: ${patientId}
Query Type: ${queryType}

Data Retrieved:
${JSON.stringify(data, null, 2)}
==========================================

USER QUESTION: ${question}

Based ONLY on the patient data above, provide a clear and helpful answer. 
If specific information is not available in the data, state that clearly.
Format your response in a professional, easy-to-read manner.
`;
}

/**
 * Build prompt for hybrid search
 */
function buildHybridPrompt(question, vectorResults, patientContext) {
  const vectorStr = vectorResults
    .map(
      (r) =>
        `- [${r.type}] ${r.text} (similarity: ${r.similarity})${
          r.graph_data ? "\n  Graph Data: " + JSON.stringify(r.graph_data) : ""
        }`
    )
    .join("\n");

  const patientStr = patientContext
    ? JSON.stringify(patientContext, null, 2)
    : "No specific patient context";

  return `
MEDICAL KNOWLEDGE BASE - HYBRID SEARCH RESULTS:
================================================
VECTOR SIMILARITY SEARCH RESULTS (from Supabase pgvector):
${vectorStr || "No similar items found"}

PATIENT CONTEXT (from Neo4j Graph DB):
${patientStr}
================================================

USER QUESTION: ${question}

Based on the search results and patient context above:
1. Analyze the semantically similar medical information found
2. Consider the patient's current conditions if available
3. Provide a comprehensive, evidence-based response

Be specific about which information comes from the search results vs patient records.
Format your response professionally for medical staff.
`;
}

module.exports = {
  handleChat,
  handleHybridSearch,
  buildPrompt,
  buildHybridPrompt,
};
