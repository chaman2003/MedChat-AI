/**
 * Neo4j Graph Queries
 * Cypher queries for medical data retrieval from Neo4j
 */
const { runQuery } = require("./driver");

// ==================== PATIENT QUERIES ====================

async function getPatientProfile(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})
    RETURN p.patient_id AS id, p.name AS name, p.age AS age, 
           p.gender AS gender, p.blood_type AS blood_type
  `;
  return runQuery(cypher, { patientId });
}

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

async function getPatientSymptoms(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[:HAS_DISEASE]->(d:Disease)-[:PRESENTS_WITH]->(s:Symptom)
    RETURN d.name AS disease, s.name AS symptom, s.severity AS severity
  `;
  return runQuery(cypher, { patientId });
}

async function getPatientTreatments(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[:HAS_DISEASE]->(d:Disease)
    MATCH (drug:Drug)-[:TREATS]->(d)
    RETURN d.name AS disease, drug.name AS treatment, drug.dosage AS dosage
  `;
  return runQuery(cypher, { patientId });
}

async function getPatientLabResults(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[:HAS_LAB_RESULT]->(lab:LabResult)
    RETURN lab.test_name AS test, lab.value AS value, lab.unit AS unit,
           lab.date AS date, lab.status AS status
    ORDER BY lab.date DESC
  `;
  return runQuery(cypher, { patientId });
}

async function getPatientAllergies(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[:ALLERGIC_TO]->(a:Allergen)
    RETURN a.name AS allergen, a.reaction AS reaction, a.severity AS severity
  `;
  return runQuery(cypher, { patientId });
}

async function getPatientHistory(patientId) {
  const cypher = `
    MATCH (p:Patient {patient_id: $patientId})-[r:HAD_DISEASE]->(d:Disease)
    RETURN d.name AS disease, r.start_date AS start_date, 
           r.end_date AS end_date, r.outcome AS outcome
    ORDER BY r.start_date DESC
  `;
  return runQuery(cypher, { patientId });
}

async function getFullPatientProfile(patientId) {
  const [profile, diseases, medications, symptoms, labResults, allergies] = await Promise.all([
    getPatientProfile(patientId),
    getPatientDiseases(patientId),
    getPatientMedications(patientId),
    getPatientSymptoms(patientId),
    getPatientLabResults(patientId),
    getPatientAllergies(patientId),
  ]);

  return {
    patient: profile[0] || null,
    diseases,
    medications,
    symptoms,
    lab_results: labResults,
    allergies,
  };
}

// ==================== GRAPH VISUALIZATION QUERIES ====================

async function getAllNodesAndEdges() {
  const nodesQuery = `
    MATCH (n)
    RETURN 
      elementId(n) AS id,
      labels(n)[0] AS type,
      properties(n) AS props
  `;

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
    runQuery(edgesQuery),
  ]);

  // Process nodes
  const nodes = nodesResult.map((record) => {
    const props = record.props || {};
    const label = props.name || props.patient_id || props.test_name || props.icd_code || record.id.slice(-6);
    return { id: record.id, type: record.type, label, ...props };
  });

  // Process edges
  const links = edgesResult.map((record) => ({
    source: record.source,
    target: record.target,
    relationship: record.relationship,
    ...record.props,
  }));

  // Count by type
  const nodeTypes = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {});

  return { nodes, links, nodeTypes };
}

// ==================== DRUG INTERACTION QUERIES ====================

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
  // Patient queries
  getPatientProfile,
  getPatientDiseases,
  getPatientMedications,
  getPatientSymptoms,
  getPatientTreatments,
  getPatientLabResults,
  getPatientAllergies,
  getPatientHistory,
  getFullPatientProfile,
  // Graph visualization
  getAllNodesAndEdges,
  // Drug interactions
  checkDrugInteractions,
};
