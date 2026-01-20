// Chat Handler - Main RAG Logic with Neo4j Graph DB + Groq LLM
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

async function handleChat({ question, role, user_id, patient_id }) {
  // 1. Validate input
  if (!question || !role || !user_id) {
    throw new Error("Missing required fields: question, role, user_id");
  }

  if (role !== "doctor" && role !== "patient") {
    throw new Error("Invalid role. Must be 'doctor' or 'patient'");
  }

  // 2. Extract patient ID from question or use provided patient_id
  let targetPatient = extractPatientId(question) || patient_id;

  // 3. Authorization check
  if (role === "patient") {
    // Patients can only access their own data
    targetPatient = user_id;
  } else if (role === "doctor" && !targetPatient) {
    throw new Error("Doctor must specify or mention a patient ID");
  }

  if (!targetPatient) {
    throw new Error("Could not determine patient ID. Please mention patient ID (e.g., P001) in your question.");
  }

  // 4. Determine query type from question
  const queryType = determineQueryType(question);
  console.log(`[Chat] Patient: ${targetPatient}, Query Type: ${queryType}`);

  // 5. Query Neo4j graph database
  const queryHandler = queryHandlers[queryType] || getFullPatientProfile;
  const graphData = await queryHandler(targetPatient);

  // 6. Check if data was found
  if (!graphData || (Array.isArray(graphData) && graphData.length === 0)) {
    return {
      answer: `No ${queryType} data found for patient ${targetPatient}. Please verify the patient ID.`,
      source: "neo4j",
      query_type: queryType,
      patient_id: targetPatient,
      data_found: false
    };
  }

  // 7. Build prompt for LLM
  const prompt = buildPrompt(question, queryType, targetPatient, graphData);

  // 8. Call Groq LLM to generate natural language answer
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

function buildPrompt(question, queryType, patientId, data) {
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

module.exports = { handleChat };
