// Entity Extractor - Extract patient ID and query type from natural language
// Rule-based extraction for POC

// Extract patient ID (P001, P002, etc.)
function extractPatientId(text) {
  const match = text.match(/P\d{3,}/i);
  return match ? match[0].toUpperCase() : null;
}

// Determine query type based on keywords
function determineQueryType(question) {
  const q = question.toLowerCase();

  if (q.includes("disease") || q.includes("diagnosis") || q.includes("condition") || q.includes("suffering")) {
    return "diseases";
  }
  if (q.includes("medication") || q.includes("drug") || q.includes("medicine") || q.includes("taking") || q.includes("prescribed")) {
    return "medications";
  }
  if (q.includes("symptom") || q.includes("feeling") || q.includes("pain") || q.includes("experiencing")) {
    return "symptoms";
  }
  if (q.includes("treatment") || q.includes("therapy") || q.includes("cure")) {
    return "treatments";
  }
  if (q.includes("lab") || q.includes("test") || q.includes("result") || q.includes("report")) {
    return "lab_results";
  }
  if (q.includes("allerg")) {
    return "allergies";
  }
  if (q.includes("history") || q.includes("past") || q.includes("previous")) {
    return "history";
  }
  if (q.includes("profile") || q.includes("info") || q.includes("detail") || q.includes("who is")) {
    return "profile";
  }

  // Default: return full profile
  return "full";
}

// Extract disease name if mentioned
function extractDiseaseName(text) {
  const diseases = [
    "diabetes", "hypertension", "asthma", "arthritis", "cancer",
    "heart disease", "copd", "pneumonia", "bronchitis", "migraine"
  ];
  
  const q = text.toLowerCase();
  for (const disease of diseases) {
    if (q.includes(disease)) {
      return disease;
    }
  }
  return null;
}

// Extract drug name if mentioned
function extractDrugName(text) {
  const drugs = [
    "metformin", "lisinopril", "aspirin", "ibuprofen", "amoxicillin",
    "omeprazole", "atorvastatin", "amlodipine", "insulin", "prednisone"
  ];
  
  const q = text.toLowerCase();
  for (const drug of drugs) {
    if (q.includes(drug)) {
      return drug;
    }
  }
  return null;
}

module.exports = {
  extractPatientId,
  determineQueryType,
  extractDiseaseName,
  extractDrugName
};
