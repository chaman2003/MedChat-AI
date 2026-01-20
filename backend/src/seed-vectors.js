// Seed Vectors - Populate Supabase with embeddings from Neo4j data
require("dotenv").config({ path: __dirname + "/../.env" });

const { runQuery, closeDriver } = require("./neo4j-driver");
const { initVectorTable, upsertEmbedding, clearAllEmbeddings, closePool } = require("./supabase-driver");
const { generateEmbedding, buildSearchableText } = require("./embedding-service");

async function seedVectors() {
  console.log("\n🚀 Starting vector seeding process...\n");

  try {
    // 1. Initialize vector table
    console.log("📦 Initializing vector table in Supabase...");
    await initVectorTable();

    // 2. Clear existing embeddings
    console.log("🗑️ Clearing existing embeddings...");
    try {
      await clearAllEmbeddings();
    } catch (e) {
      console.log("  (No existing data to clear)");
    }

    // 3. Fetch all entities from Neo4j
    console.log("\n📊 Fetching entities from Neo4j...\n");

    // Diseases
    console.log("🦠 Processing diseases...");
    const diseases = await runQuery("MATCH (d:Disease) RETURN d");
    for (const record of diseases) {
      const disease = record.d.properties;
      const text = buildSearchableText("disease", disease);
      console.log(`  → ${disease.name}`);
      
      const embedding = await generateEmbedding(text);
      await upsertEmbedding({
        neo4jId: disease.disease_id,
        contentType: "disease",
        contentText: text,
        embedding,
        metadata: { icd_code: disease.icd_code, name: disease.name }
      });
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`  ✅ ${diseases.length} diseases embedded\n`);

    // Drugs
    console.log("💊 Processing drugs...");
    const drugs = await runQuery("MATCH (dr:Drug) RETURN dr");
    for (const record of drugs) {
      const drug = record.dr.properties;
      const text = buildSearchableText("drug", drug);
      console.log(`  → ${drug.name}`);
      
      const embedding = await generateEmbedding(text);
      await upsertEmbedding({
        neo4jId: drug.drug_id,
        contentType: "drug",
        contentText: text,
        embedding,
        metadata: { category: drug.category, name: drug.name }
      });
      
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`  ✅ ${drugs.length} drugs embedded\n`);

    // Symptoms
    console.log("🤒 Processing symptoms...");
    const symptoms = await runQuery("MATCH (s:Symptom) RETURN s");
    for (const record of symptoms) {
      const symptom = record.s.properties;
      const text = buildSearchableText("symptom", symptom);
      console.log(`  → ${symptom.name}`);
      
      const embedding = await generateEmbedding(text);
      await upsertEmbedding({
        neo4jId: symptom.symptom_id,
        contentType: "symptom",
        contentText: text,
        embedding,
        metadata: { severity: symptom.severity, name: symptom.name }
      });
      
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`  ✅ ${symptoms.length} symptoms embedded\n`);

    // Allergens
    console.log("⚠️ Processing allergens...");
    const allergens = await runQuery("MATCH (a:Allergen) RETURN a");
    for (const record of allergens) {
      const allergen = record.a.properties;
      const text = buildSearchableText("allergen", allergen);
      console.log(`  → ${allergen.name}`);
      
      const embedding = await generateEmbedding(text);
      await upsertEmbedding({
        neo4jId: allergen.allergen_id,
        contentType: "allergen",
        contentText: text,
        embedding,
        metadata: { severity: allergen.severity, name: allergen.name }
      });
      
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`  ✅ ${allergens.length} allergens embedded\n`);

    // Patients (basic profile for similarity search)
    console.log("👤 Processing patients...");
    const patients = await runQuery(`
      MATCH (p:Patient)
      OPTIONAL MATCH (p)-[:HAS_DISEASE]->(d:Disease)
      OPTIONAL MATCH (p)-[:CURRENTLY_TAKING]->(dr:Drug)
      RETURN p, 
             collect(DISTINCT d.name) as diseases,
             collect(DISTINCT dr.name) as medications
    `);
    for (const record of patients) {
      const patient = record.p.properties;
      const diseases = record.diseases.filter(Boolean);
      const medications = record.medications.filter(Boolean);
      
      // Build comprehensive patient text for embedding
      const text = `Patient ${patient.name}. Age: ${patient.age}. Gender: ${patient.gender}. ` +
                   `Blood Type: ${patient.blood_type}. ` +
                   `Conditions: ${diseases.length > 0 ? diseases.join(", ") : "None"}. ` +
                   `Medications: ${medications.length > 0 ? medications.join(", ") : "None"}.`;
      
      console.log(`  → ${patient.name}`);
      
      const embedding = await generateEmbedding(text);
      await upsertEmbedding({
        neo4jId: patient.patient_id,
        contentType: "patient",
        contentText: text,
        embedding,
        metadata: { 
          name: patient.name,
          age: patient.age,
          diseases,
          medications
        }
      });
      
      await new Promise(r => setTimeout(r, 200));
    }
    console.log(`  ✅ ${patients.length} patients embedded\n`);

    console.log(`
╔════════════════════════════════════════════════╗
║         VECTOR SEEDING COMPLETE!               ║
╠════════════════════════════════════════════════╣
║  Diseases:   ${diseases.length.toString().padEnd(32)}║
║  Drugs:      ${drugs.length.toString().padEnd(32)}║
║  Symptoms:   ${symptoms.length.toString().padEnd(32)}║
║  Allergens:  ${allergens.length.toString().padEnd(32)}║
║  Patients:   ${patients.length.toString().padEnd(32)}║
║                                                ║
║  Total embeddings: ${(diseases.length + drugs.length + symptoms.length + allergens.length + patients.length).toString().padEnd(26)}║
╚════════════════════════════════════════════════╝
    `);

  } catch (error) {
    console.error("❌ Vector seeding error:", error.message);
    throw error;
  } finally {
    await closeDriver();
    await closePool();
  }
}

// Run if executed directly
if (require.main === module) {
  seedVectors();
}

module.exports = { seedVectors };
