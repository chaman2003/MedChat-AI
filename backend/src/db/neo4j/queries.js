/**
 * Neo4j Graph Queries
 * Cypher queries for medical data retrieval from Neo4j
 */
const { runQuery } = require("./driver");

// ==================== DOCTOR QUERIES ====================

async function getAllDoctors() {
  const cypher = `
    MATCH (d:Doctor)
    RETURN d.doctor_id AS id, d.name AS name, d.specialty AS specialty,
           d.phone AS phone, d.email AS email, d.license_number AS license_number
    ORDER BY d.name
  `;
  return runQuery(cypher);
}

async function getDoctorById(doctorId) {
  const cypher = `
    MATCH (d:Doctor {doctor_id: $doctorId})
    RETURN d.doctor_id AS id, d.name AS name, d.specialty AS specialty,
           d.phone AS phone, d.email AS email, d.license_number AS license_number
  `;
  return runQuery(cypher, { doctorId });
}

async function getDoctorPatients(doctorId) {
  const cypher = `
    MATCH (d:Doctor {doctor_id: $doctorId})-[r:TREATS]->(p:Patient)
    RETURN p.patient_id AS id, p.name AS name, p.age AS age, 
           p.gender AS gender, p.blood_type AS blood_type,
           r.since AS treating_since, r.primary AS is_primary
    ORDER BY p.name
  `;
  return runQuery(cypher, { doctorId });
}

async function getAllPatients() {
  const cypher = `
    MATCH (p:Patient)
    OPTIONAL MATCH (d:Doctor)-[:TREATS]->(p)
    RETURN p.patient_id AS id, p.name AS name, p.age AS age, 
           p.gender AS gender, p.blood_type AS blood_type,
           d.doctor_id AS doctor_id, d.name AS doctor_name
    ORDER BY p.name
  `;
  return runQuery(cypher);
}

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

// ==================== FILTERED GRAPH QUERIES ====================

async function getGraphByDoctor(doctorId) {
  // Get all nodes and edges related to a specific doctor's patients
  const nodesQuery = `
    MATCH (d:Doctor {doctor_id: $doctorId})-[:TREATS]->(p:Patient)
    WITH collect(p) AS patients, d
    
    // Get all related nodes
    OPTIONAL MATCH (p:Patient)-[]->(related)
    WHERE p IN patients
    WITH patients, d, collect(DISTINCT related) AS relatedNodes
    
    // Combine doctor, patients, and related nodes
    WITH [d] + patients + relatedNodes AS allNodes
    UNWIND allNodes AS n
    WITH DISTINCT n
    WHERE n IS NOT NULL
    RETURN 
      elementId(n) AS id,
      labels(n)[0] AS type,
      properties(n) AS props
  `;

  const edgesQuery = `
    MATCH (d:Doctor {doctor_id: $doctorId})-[:TREATS]->(p:Patient)
    WITH collect(p) AS patients, d
    
    // Get edges from doctor to patients
    MATCH (d)-[r1:TREATS]->(p) WHERE p IN patients
    WITH patients, collect({source: elementId(d), target: elementId(p), rel: type(r1), props: properties(r1)}) AS doctorEdges
    
    // Get edges from patients to related nodes
    UNWIND patients AS patient
    MATCH (patient)-[r]->(related)
    WITH doctorEdges, collect({source: elementId(patient), target: elementId(related), rel: type(r), props: properties(r)}) AS patientEdges
    
    // Combine all edges
    WITH doctorEdges + patientEdges AS allEdges
    UNWIND allEdges AS edge
    RETURN DISTINCT
      edge.source AS source,
      edge.target AS target,
      edge.rel AS relationship,
      edge.props AS props
  `;

  const [nodesResult, edgesResult] = await Promise.all([
    runQuery(nodesQuery, { doctorId }),
    runQuery(edgesQuery, { doctorId }),
  ]);

  // Process nodes
  const nodes = nodesResult.map((record) => {
    const props = record.props || {};
    const label = props.name || props.patient_id || props.doctor_id || props.test_name || props.icd_code || record.id.slice(-6);
    return { id: record.id, type: record.type, label, ...props };
  });

  // Process edges
  const links = edgesResult.map((record) => ({
    source: record.source,
    target: record.target,
    relationship: record.relationship,
    ...(record.props || {}),
  }));

  // Count by type
  const nodeTypes = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {});

  return { nodes, links, nodeTypes };
}

async function getGraphByPatient(patientId) {
  const nodesQuery = `
    MATCH (p:Patient {patient_id: $patientId})
    
    // Get the patient's doctor
    OPTIONAL MATCH (d:Doctor)-[:TREATS]->(p)
    
    // Get all related nodes
    OPTIONAL MATCH (p)-[]->(related)
    
    // Combine all nodes
    WITH [p] + collect(DISTINCT d) + collect(DISTINCT related) AS allNodes
    UNWIND allNodes AS n
    WITH DISTINCT n
    WHERE n IS NOT NULL
    RETURN 
      elementId(n) AS id,
      labels(n)[0] AS type,
      properties(n) AS props
  `;

  const edgesQuery = `
    MATCH (p:Patient {patient_id: $patientId})
    
    // Get doctor-patient edge
    OPTIONAL MATCH (d:Doctor)-[r1:TREATS]->(p)
    WITH p, collect({source: elementId(d), target: elementId(p), rel: type(r1), props: properties(r1)}) AS doctorEdges
    
    // Get patient's outgoing edges
    MATCH (p)-[r]->(related)
    WITH doctorEdges, collect({source: elementId(p), target: elementId(related), rel: type(r), props: properties(r)}) AS patientEdges
    
    // Combine all edges
    WITH doctorEdges + patientEdges AS allEdges
    UNWIND allEdges AS edge
    WITH edge WHERE edge.source IS NOT NULL
    RETURN DISTINCT
      edge.source AS source,
      edge.target AS target,
      edge.rel AS relationship,
      edge.props AS props
  `;

  const [nodesResult, edgesResult] = await Promise.all([
    runQuery(nodesQuery, { patientId }),
    runQuery(edgesQuery, { patientId }),
  ]);

  // Process nodes
  const nodes = nodesResult.map((record) => {
    const props = record.props || {};
    const label = props.name || props.patient_id || props.doctor_id || props.test_name || props.icd_code || record.id.slice(-6);
    return { id: record.id, type: record.type, label, ...props };
  });

  // Process edges
  const links = edgesResult.map((record) => ({
    source: record.source,
    target: record.target,
    relationship: record.relationship,
    ...(record.props || {}),
  }));

  // Count by type
  const nodeTypes = nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {});

  return { nodes, links, nodeTypes };
}

module.exports = {
  // Doctor queries
  getAllDoctors,
  getDoctorById,
  getDoctorPatients,
  getAllPatients,
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
  getGraphByDoctor,
  getGraphByPatient,
  // Drug interactions
  checkDrugInteractions,
};
