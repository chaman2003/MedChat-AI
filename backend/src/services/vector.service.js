/**
 * Vector Search Service
 * Semantic search combining embeddings with Neo4j graph data
 */
const { searchSimilar } = require("../db/supabase");
const { generateEmbedding } = require("./embedding.service");
const { runQuery } = require("../db/neo4j");

/**
 * Semantic search for similar medical content
 * @param {string} query - Natural language query
 * @param {string} contentType - Filter: 'disease', 'drug', 'symptom', etc.
 * @param {number} limit - Max results
 */
async function semanticSearch(query, contentType = null, limit = 5) {
  console.log(`[Vector] Search: "${query}" (type: ${contentType || "all"})`);

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Search pgvector
  const vectorResults = await searchSimilar({
    queryEmbedding,
    contentType,
    limit,
    threshold: 0.3,
  });

  if (vectorResults.length === 0) {
    console.log("[Vector] No similar items found");
    return [];
  }

  console.log(`[Vector] Found ${vectorResults.length} items`);

  // Enrich with graph data
  return enrichWithGraphData(vectorResults);
}

/**
 * Enrich vector results with Neo4j graph relationships
 */
async function enrichWithGraphData(vectorResults) {
  const enriched = [];

  for (const result of vectorResults) {
    const { neo4j_id, content_type, content_text, similarity, metadata } = result;
    let graphData = null;

    try {
      const queries = {
        disease: `
          MATCH (d:Disease {disease_id: $id})
          OPTIONAL MATCH (d)<-[:HAS_DISEASE]-(p:Patient)
          OPTIONAL MATCH (dr:Drug)-[:TREATS]->(d)
          OPTIONAL MATCH (d)-[:PRESENTS_WITH]->(s:Symptom)
          RETURN d as disease,
                 collect(DISTINCT p.name) as affected_patients,
                 collect(DISTINCT dr.name) as treating_drugs,
                 collect(DISTINCT s.name) as symptoms
        `,
        drug: `
          MATCH (dr:Drug {drug_id: $id})
          OPTIONAL MATCH (dr)-[:TREATS]->(d:Disease)
          OPTIONAL MATCH (p:Patient)-[:CURRENTLY_TAKING]->(dr)
          OPTIONAL MATCH (dr)-[:INTERACTS_WITH]-(other:Drug)
          RETURN dr as drug,
                 collect(DISTINCT d.name) as treats_diseases,
                 collect(DISTINCT p.name) as prescribed_to,
                 collect(DISTINCT other.name) as interactions
        `,
        symptom: `
          MATCH (s:Symptom {symptom_id: $id})
          OPTIONAL MATCH (d:Disease)-[:PRESENTS_WITH]->(s)
          RETURN s as symptom,
                 collect(DISTINCT d.name) as associated_diseases
        `,
        patient: `
          MATCH (p:Patient {patient_id: $id})
          OPTIONAL MATCH (p)-[:HAS_DISEASE]->(d:Disease)
          OPTIONAL MATCH (p)-[:CURRENTLY_TAKING]->(dr:Drug)
          RETURN p as patient,
                 collect(DISTINCT d.name) as diseases,
                 collect(DISTINCT dr.name) as medications
        `,
      };

      if (queries[content_type]) {
        graphData = await runQuery(queries[content_type], { id: neo4j_id });
      }
    } catch (error) {
      console.error(`[Vector] Enrichment error ${content_type}:${neo4j_id}:`, error.message);
    }

    enriched.push({
      id: neo4j_id,
      type: content_type,
      text: content_text,
      similarity: parseFloat(similarity).toFixed(3),
      metadata,
      graph_data: graphData?.[0] || null,
    });
  }

  return enriched;
}

/**
 * Find similar patients based on conditions
 */
async function findSimilarPatients(patientId, limit = 3) {
  const patientData = await runQuery(
    `
    MATCH (p:Patient {patient_id: $id})
    OPTIONAL MATCH (p)-[:HAS_DISEASE]->(d:Disease)
    OPTIONAL MATCH (p)-[:CURRENTLY_TAKING]->(dr:Drug)
    RETURN p.name as name,
           collect(DISTINCT d.name) as diseases,
           collect(DISTINCT dr.name) as medications
    `,
    { id: patientId }
  );

  if (!patientData?.[0]) return [];

  const { diseases, medications } = patientData[0];
  const searchText = `Patient with ${diseases.join(", ")} taking ${medications.join(", ")}`;

  const queryEmbedding = await generateEmbedding(searchText);
  const similar = await searchSimilar({
    queryEmbedding,
    contentType: "patient",
    limit: limit + 1,
    threshold: 0.4,
  });

  return similar.filter((p) => p.neo4j_id !== patientId);
}

/**
 * Find treatment options for a condition
 */
async function findTreatmentOptions(conditionDescription, limit = 5) {
  const queryEmbedding = await generateEmbedding(conditionDescription);

  const similarDiseases = await searchSimilar({
    queryEmbedding,
    contentType: "disease",
    limit: 3,
    threshold: 0.4,
  });

  if (similarDiseases.length === 0) {
    return { diseases: [], drugs: [] };
  }

  const diseaseIds = similarDiseases.map((d) => d.neo4j_id);
  const drugs = await runQuery(
    `
    MATCH (dr:Drug)-[:TREATS]->(d:Disease)
    WHERE d.disease_id IN $diseaseIds
    RETURN DISTINCT dr.name as name, 
           dr.dosage as dosage, 
           dr.category as category,
           collect(d.name) as treats
    `,
    { diseaseIds }
  );

  return {
    diseases: similarDiseases.map((d) => ({
      id: d.neo4j_id,
      name: d.content_text,
      similarity: d.similarity,
    })),
    drugs: drugs.slice(0, limit),
  };
}

module.exports = {
  semanticSearch,
  enrichWithGraphData,
  findSimilarPatients,
  findTreatmentOptions,
};
