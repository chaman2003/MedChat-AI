// Graph Queries - Cypher queries for Neo4j medical data retrieval
const { runQuery } = require("./neo4j-driver");

// Get patient profile
async function getPatientProfile(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})
    RETURN p.patient_id AS id, p.name AS name, p.age AS age, 
           p.gender AS gender, p.blood_type AS blood_type
  `;
  return runQuery(cypher, { patientId });
}

// Get patient diseases/diagnoses
async function getPatientDiseases(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[r:HAS_DISEASE]->(d:Disease)
    RETURN d.name AS disease, d.icd_code AS icd_code, 
           r.diagnosed_date AS diagnosed_date, r.status AS status,
           r.severity AS severity
    ORDER BY r.diagnosed_date DESC
  `;
  return runQuery(cypher, { patientId });
}

// Get patient medications
async function getPatientMedications(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[r:CURRENTLY_TAKING]->(drug:Drug)
    RETURN drug.name AS medication, drug.dosage AS dosage, 
           drug.frequency AS frequency, r.start_date AS start_date,
           r.prescribed_by AS prescribed_by
    ORDER BY r.start_date DESC
  `;
  return runQuery(cypher, { patientId });
}

// Get symptoms related to patient's diseases
async function getPatientSymptoms(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[:HAS_DISEASE]->(d:Disease)-[:PRESENTS_WITH]->(s:Symptom)
    RETURN d.name AS disease, s.name AS symptom, s.severity AS severity
  `;
  return runQuery(cypher, { patientId });
}

// Get treatments for patient's diseases
async function getPatientTreatments(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[:HAS_DISEASE]->(d:Disease)
    MATCH (drug:Drug)-[:TREATS]->(d)
    RETURN d.name AS disease, drug.name AS treatment, drug.dosage AS dosage
  `;
  return runQuery(cypher, { patientId });
}

// Get patient lab results
async function getPatientLabResults(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[:HAS_LAB_RESULT]->(lab:LabResult)
    RETURN lab.test_name AS test, lab.value AS value, lab.unit AS unit,
           lab.date AS date, lab.status AS status
    ORDER BY lab.date DESC
  `;
  return runQuery(cypher, { patientId });
}

// Get patient allergies
async function getPatientAllergies(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[:ALLERGIC_TO]->(a:Allergen)
    RETURN a.name AS allergen, a.reaction AS reaction, a.severity AS severity
  `;
  return runQuery(cypher, { patientId });
}

// Get patient medical history
async function getPatientHistory(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[r:HAD_DISEASE]->(d:Disease)
    RETURN d.name AS disease, r.start_date AS start_date, 
           r.end_date AS end_date, r.outcome AS outcome
    ORDER BY r.start_date DESC
  `;
  return runQuery(cypher, { patientId });
}

// Get full patient medical profile
async function getFullPatientProfile(patientId) {
  const [profile, diseases, medications, symptoms, labResults, allergies] = await Promise.all([
    getPatientProfile(patientId),
    getPatientDiseases(patientId),
    getPatientMedications(patientId),
    getPatientSymptoms(patientId),
    getPatientLabResults(patientId),
    getPatientAllergies(patientId)
  ]);

  return {
    patient: profile[0] || null,
    diseases,
    medications,
    symptoms,
    lab_results: labResults,
    allergies
  };
}

// Check drug interactions for a patient
async function checkDrugInteractions(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[:CURRENTLY_TAKING]->(d1:Drug)
    MATCH (p)-[:CURRENTLY_TAKING]->(d2:Drug)
    MATCH (d1)-[r:INTERACTS_WITH]-(d2)
    WHERE d1.name < d2.name
    RETURN d1.name AS drug1, d2.name AS drug2, 
           r.severity AS severity, r.description AS interaction
  `;
  return runQuery(cypher, { patientId });
}

module.exports = {
  getPatientProfile,
  getPatientDiseases,
  getPatientMedications,
  getPatientSymptoms,
  getPatientTreatments,
  getPatientLabResults,
  getPatientAllergies,
  getPatientHistory,
  getFullPatientProfile,
  checkDrugInteractions
};
