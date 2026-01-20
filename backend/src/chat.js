// Chat Handler - Hybrid RAG with Neo4j Graph DB + Supabase pgvector + Groq LLM
require("dotenv").config();
const { extractPatientId, determineQueryType } = require("./entity-extractor");
const {
  getPatientProfile,
  getPatientDiseases,
  getPatientMedications,
  getPatientSymptoms,
  getPatientTreatments,
  getPatientLabResults,
  getPatientAllergies,
  getPatientHistory,
  getFullPatientProfile
} = require("./graph-queries");
const { callGroq } = require("./llm");

// Check if embeddings are enabled
const EMBEDDINGS_ENABLED = process.env.ENABLE_EMBEDDINGS?.toLowerCase() === "yes";

// Conditionally load vector search module
let semanticSearch, findSimilarPatients, findTreatmentOptions;
if (EMBEDDINGS_ENABLED) {
  const vectorSearch = require("./vector-search");
  semanticSearch = vectorSearch.semanticSearch;
  findSimilarPatients = vectorSearch.findSimilarPatients;
  findTreatmentOptions = vectorSearch.findTreatmentOptions;
  console.log("[Chat] Vector search ENABLED");
} else {
  console.log("[Chat] Vector search DISABLED (ENABLE_EMBEDDINGS=no)");
}

// Query type to function mapping
const queryHandlers = {
  profile: getPatientProfile,
  diseases: getPatientDiseases,
  medications: getPatientMedications,
  symptoms: getPatientSymptoms,
  treatments: getPatientTreatments,
  lab_results: getPatientLabResults,
  allergies: getPatientAllergies,
  history: getPatientHistory,
  full: getFullPatientProfile
};

// Detect if query needs semantic search
function needsSemanticSearch(question) {
  const semanticKeywords = [
    "similar", "like", "related", "recommend", "suggest", "find",
    "search", "what treats", "treatment for", "drugs for", "medicine for",
    "patients with", "cases like", "comparable", "alternative"
  ];
  const q = question.toLowerCase();
  return semanticKeywords.some(kw => q.includes(kw));
}

// Detect content type from question
function detectContentType(question) {
  const q = question.toLowerCase();
  if (q.includes("disease") || q.includes("condition") || q.includes("diagnosis")) return "disease";
  if (q.includes("drug") || q.includes("medication") || q.includes("medicine")) return "drug";
  if (q.includes("symptom")) return "symptom";
  if (q.includes("patient")) return "patient";
  if (q.includes("allerg")) return "allergen";
  return null;
}

async function handleChat({ question, role, user_id, patient_id }) {
  // 1. Validate input
  if (!question || !role || !user_id) {
    throw new Error("Missing required fields: question, role, user_id");
  }

  if (role !== "doctor" && role !== "patient") {
    throw new Error("Invalid role. Must be 'doctor' or 'patient'");
  }

  // 2. Check if this is a semantic/similarity search query (only if embeddings enabled)
  const useSemanticSearch = EMBEDDINGS_ENABLED && needsSemanticSearch(question);
  
  if (useSemanticSearch) {
    console.log("[Chat] Using hybrid search (Neo4j + Vector)");
    return await handleHybridSearch({ question, role, user_id, patient_id });
  }

  // 3. Extract patient ID from question or use provided patient_id
  let targetPatient = extractPatientId(question) || patient_id;

  // 4. Authorization check
  if (role === "patient") {
    // Patients can only access their own data
    targetPatient = user_id;
  } else if (role === "doctor" && !targetPatient) {
    throw new Error("Doctor must specify or mention a patient ID");
  }

  if (!targetPatient) {
    throw new Error("Could not determine patient ID. Please mention patient ID (e.g., P001) in your question.");
  }

  // 5. Determine query type from question
  const queryType = determineQueryType(question);
  console.log(`[Chat] Patient: ${targetPatient}, Query Type: ${queryType}`);

  // 6. Query Neo4j graph database
  const queryHandler = queryHandlers[queryType] || getFullPatientProfile;
  const graphData = await queryHandler(targetPatient);

  // 7. Check if data was found
  if (!graphData || (Array.isArray(graphData) && graphData.length === 0)) {
    return {
      answer: `No ${queryType} data found for patient ${targetPatient}. Please verify the patient ID.`,
      source: "neo4j",
      query_type: queryType,
      patient_id: targetPatient,
      data_found: false
    };
  }

  // 8. Build prompt for LLM
  const prompt = buildPrompt(question, queryType, targetPatient, graphData, null);

  // 9. Call Groq LLM to generate natural language answer
  const answer = await callGroq(prompt);

  return {
    answer,
    source: "neo4j",
    query_type: queryType,
    patient_id: targetPatient,
    data_found: true,
    records_retrieved: Array.isArray(graphData) ? graphData.length : 1
  };
}

/**
 * Handle hybrid search queries that need both graph + vector search
 */
async function handleHybridSearch({ question, role, user_id, patient_id }) {
  const contentType = detectContentType(question);
  let targetPatient = extractPatientId(question) || patient_id;

  // Authorization for patients
  if (role === "patient") {
    targetPatient = user_id;
  }

  console.log(`[Hybrid] Content type: ${contentType || "all"}, Patient context: ${targetPatient || "none"}`);

  // Perform semantic search
  const vectorResults = await semanticSearch(question, contentType, 5);

  // Get patient context if available
  let patientContext = null;
  if (targetPatient) {
    try {
      patientContext = await getFullPatientProfile(targetPatient);
    } catch (e) {
      console.log("[Hybrid] No patient context found");
    }
  }

  // Build hybrid prompt
  const prompt = buildHybridPrompt(question, vectorResults, patientContext);

  // Generate response
  const answer = await callGroq(prompt);

  return {
    answer,
    source: "hybrid",
    query_type: "semantic_search",
    patient_id: targetPatient,
    data_found: vectorResults.length > 0,
    records_retrieved: vectorResults.length,
    similar_items: vectorResults.map(r => ({
      type: r.type,
      text: r.text,
      similarity: r.similarity
    }))
  };
}

function buildPrompt(question, queryType, patientId, data, vectorData) {
  const dataStr = JSON.stringify(data, null, 2);

  return `
PATIENT DATA FROM MEDICAL GRAPH DATABASE:
==========================================
Patient ID: ${patientId}
Query Type: ${queryType}

Data Retrieved:
${dataStr}
==========================================

USER QUESTION: ${question}

Based ONLY on the patient data above, provide a clear and helpful answer. 
If specific information is not available in the data, state that clearly.
Format your response in a professional, easy-to-read manner.
`;
}

function buildHybridPrompt(question, vectorResults, patientContext) {
  const vectorStr = vectorResults.map(r => 
    `- [${r.type}] ${r.text} (similarity: ${r.similarity})${r.graph_data ? "\n  Graph Data: " + JSON.stringify(r.graph_data) : ""}`
  ).join("\n");

  const patientStr = patientContext ? JSON.stringify(patientContext, null, 2) : "No specific patient context";

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

module.exports = { handleChat };
