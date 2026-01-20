// Vector Search - Semantic search combining Neo4j + Supabase pgvector
const { searchSimilar } = require("./supabase-driver");
const { generateEmbedding } = require("./embedding-service");
const { runQuery } = require("./neo4j-driver");

/**
 * Semantic search for similar medical content
 * @param {string} query - Natural language query
 * @param {string} contentType - Optional filter: 'disease', 'drug', 'symptom', etc.
 * @param {number} limit - Max results
 * @returns {Array} Similar items with Neo4j enrichment
 */
async function semanticSearch(query, contentType = null, limit = 5) {
  console.log(`[Vector] Semantic search: "${query}" (type: ${contentType || "all"})`);

  // 1. Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search Supabase pgvector for similar embeddings
  const vectorResults = await searchSimilar({
    queryEmbedding,
    contentType,
    limit,
    threshold: 0.3 // Lower threshold for broader results
  });

  if (vectorResults.length === 0) {
    console.log("[Vector] No similar items found");
    return [];
  }

  console.log(`[Vector] Found ${vectorResults.length} similar items`);

  // 3. Enrich results with Neo4j graph data
  const enrichedResults = await enrichWithGraphData(vectorResults);

  return enrichedResults;
}

/**
 * Enrich vector search results with Neo4j graph relationships
 */
async function enrichWithGraphData(vectorResults) {
  const enriched = [];

  for (const result of vectorResults) {
    const { neo4j_id, content_type, content_text, similarity, metadata } = result;

    let graphData = null;

    try {
      switch (content_type) {
        case "disease":
          graphData = await runQuery(`
            MATCH (d:Disease {disease_id: $id})
            OPTIONAL MATCH (d)<-[:HAS_DISEASE]-(p:Patient)
            OPTIONAL MATCH (dr:Drug)-[:TREATS]->(d)
            OPTIONAL MATCH (d)-[:PRESENTS_WITH]->(s:Symptom)
            RETURN d as disease,
                   collect(DISTINCT p.name) as affected_patients,
                   collect(DISTINCT dr.name) as treating_drugs,
                   collect(DISTINCT s.name) as symptoms
          `, { id: neo4j_id });
          break;

        case "drug":
          graphData = await runQuery(`
            MATCH (dr:Drug {drug_id: $id})
            OPTIONAL MATCH (dr)-[:TREATS]->(d:Disease)
            OPTIONAL MATCH (p:Patient)-[:CURRENTLY_TAKING]->(dr)
            OPTIONAL MATCH (dr)-[:INTERACTS_WITH]-(other:Drug)
            RETURN dr as drug,
                   collect(DISTINCT d.name) as treats_diseases,
                   collect(DISTINCT p.name) as prescribed_to,
                   collect(DISTINCT other.name) as interactions
          `, { id: neo4j_id });
          break;

        case "symptom":
          graphData = await runQuery(`
            MATCH (s:Symptom {symptom_id: $id})
            OPTIONAL MATCH (d:Disease)-[:PRESENTS_WITH]->(s)
            RETURN s as symptom,
                   collect(DISTINCT d.name) as associated_diseases
          `, { id: neo4j_id });
          break;

        case "patient":
          graphData = await runQuery(`
            MATCH (p:Patient {patient_id: $id})
            OPTIONAL MATCH (p)-[:HAS_DISEASE]->(d:Disease)
            OPTIONAL MATCH (p)-[:CURRENTLY_TAKING]->(dr:Drug)
            RETURN p as patient,
                   collect(DISTINCT d.name) as diseases,
                   collect(DISTINCT dr.name) as medications
          `, { id: neo4j_id });
          break;

        default:
          // No enrichment for unknown types
          break;
      }
    } catch (error) {
      console.error(`[Vector] Error enriching ${content_type}:${neo4j_id}:`, error.message);
    }

    enriched.push({
      id: neo4j_id,
      type: content_type,
      text: content_text,
      similarity: parseFloat(similarity).toFixed(3),
      metadata,
      graph_data: graphData?.[0] || null
    });
  }

  return enriched;
}

/**
 * Find similar patients based on conditions/symptoms
 * Useful for treatment recommendations
 */
async function findSimilarPatients(patientId, limit = 3) {
  // Get patient's conditions
  const patientData = await runQuery(`
    MATCH (p:Patient {patient_id: $id})
    OPTIONAL MATCH (p)-[:HAS_DISEASE]->(d:Disease)
    OPTIONAL MATCH (p)-[:CURRENTLY_TAKING]->(dr:Drug)
    RETURN p.name as name,
           collect(DISTINCT d.name) as diseases,
           collect(DISTINCT dr.name) as medications
  `, { id: patientId });

  if (!patientData?.[0]) {
    return [];
  }

  // Build search query from patient conditions
  const { diseases, medications } = patientData[0];
  const searchText = `Patient with ${diseases.join(", ")} taking ${medications.join(", ")}`;

  // Search for similar patient profiles
  const queryEmbedding = await generateEmbedding(searchText);
  const similar = await searchSimilar({
    queryEmbedding,
    contentType: "patient",
    limit: limit + 1, // +1 to exclude self
    threshold: 0.4
  });

  // Filter out the original patient
  return similar.filter(p => p.neo4j_id !== patientId);
}

/**
 * Find drugs that might treat a given condition description
 */
async function findTreatmentOptions(conditionDescription, limit = 5) {
  const queryEmbedding = await generateEmbedding(conditionDescription);

  // Search diseases first
  const similarDiseases = await searchSimilar({
    queryEmbedding,
    contentType: "disease",
    limit: 3,
    threshold: 0.4
  });

  if (similarDiseases.length === 0) {
    return { diseases: [], drugs: [] };
  }

  // Get treating drugs from Neo4j
  const diseaseIds = similarDiseases.map(d => d.neo4j_id);
  const drugs = await runQuery(`
    MATCH (dr:Drug)-[:TREATS]->(d:Disease)
    WHERE d.disease_id IN $diseaseIds
    RETURN DISTINCT dr.name as name, 
           dr.dosage as dosage, 
           dr.category as category,
           collect(d.name) as treats
  `, { diseaseIds });

  return {
    diseases: similarDiseases.map(d => ({ id: d.neo4j_id, name: d.content_text, similarity: d.similarity })),
    drugs: drugs.slice(0, limit)
  };
}

module.exports = {
  semanticSearch,
  findSimilarPatients,
  findTreatmentOptions,
  enrichWithGraphData
};
