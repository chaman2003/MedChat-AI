/**
 * Entity Service
 * Extract entities (patient IDs, query types, etc.) from natural language
 */

/**
 * Extract patient ID (P001, P002, etc.)
 */
function extractPatientId(text) {
  const match = text.match(/P\d{3,}/i);
  return match ? match[0].toUpperCase() : null;
}

/**
 * Determine query type from question keywords
 */
function determineQueryType(question) {
  const q = question.toLowerCase();

  const typeMap = [
    { keywords: ["disease", "diagnosis", "condition", "suffering"], type: "diseases" },
    { keywords: ["medication", "drug", "medicine", "taking", "prescribed"], type: "medications" },
    { keywords: ["symptom", "feeling", "pain", "experiencing"], type: "symptoms" },
    { keywords: ["treatment", "therapy", "cure"], type: "treatments" },
    { keywords: ["lab", "test", "result", "report"], type: "lab_results" },
    { keywords: ["allerg"], type: "allergies" },
    { keywords: ["history", "past", "previous"], type: "history" },
    { keywords: ["profile", "info", "detail", "who is"], type: "profile" },
  ];

  for (const { keywords, type } of typeMap) {
    if (keywords.some((kw) => q.includes(kw))) {
      return type;
    }
  }

  return "full";
}

/**
 * Check if query needs semantic/vector search
 */
function needsSemanticSearch(question) {
  const semanticKeywords = [
    "similar", "like", "related", "recommend", "suggest", "find",
    "search", "what treats", "treatment for", "drugs for", "medicine for",
    "patients with", "cases like", "comparable", "alternative",
  ];
  const q = question.toLowerCase();
  return semanticKeywords.some((kw) => q.includes(kw));
}

/**
 * Detect content type for vector search
 */
function detectContentType(question) {
  const q = question.toLowerCase();
  const types = {
    disease: ["disease", "condition", "diagnosis"],
    drug: ["drug", "medication", "medicine"],
    symptom: ["symptom"],
    patient: ["patient"],
    allergen: ["allerg"],
  };

  for (const [type, keywords] of Object.entries(types)) {
    if (keywords.some((kw) => q.includes(kw))) {
      return type;
    }
  }
  return null;
}

/**
 * Extract disease name from text
 */
function extractDiseaseName(text) {
  const diseases = [
    "diabetes", "hypertension", "asthma", "arthritis", "cancer",
    "heart disease", "copd", "pneumonia", "bronchitis", "migraine",
  ];
  const q = text.toLowerCase();
  return diseases.find((d) => q.includes(d)) || null;
}

/**
 * Extract drug name from text
 */
function extractDrugName(text) {
  const drugs = [
    "metformin", "lisinopril", "aspirin", "ibuprofen", "amoxicillin",
    "omeprazole", "atorvastatin", "amlodipine", "insulin", "prednisone",
  ];
  const q = text.toLowerCase();
  return drugs.find((d) => q.includes(d)) || null;
}

module.exports = {
  extractPatientId,
  determineQueryType,
  needsSemanticSearch,
  detectContentType,
  extractDiseaseName,
  extractDrugName,
};
