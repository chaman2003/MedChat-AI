// Seed Neo4j Database with Medical Data
require("dotenv").config({ path: __dirname + "/../.env" });

const { driver, closeDriver } = require("./neo4j-driver");

async function seedDatabase() {
  const session = driver.session();

  console.log("🔄 Clearing existing data...");

  try {
    // Clear existing data
    await session.run("MATCH (n) DETACH DELETE n");

    console.log("📊 Creating constraints and indexes...");

    // Create constraints (unique IDs)
    await session.run("CREATE CONSTRAINT patient_id IF NOT EXISTS FOR (p:Patient) REQUIRE p.patient_id IS UNIQUE");
    await session.run("CREATE CONSTRAINT disease_id IF NOT EXISTS FOR (d:Disease) REQUIRE d.disease_id IS UNIQUE");
    await session.run("CREATE CONSTRAINT drug_id IF NOT EXISTS FOR (d:Drug) REQUIRE d.drug_id IS UNIQUE");
    await session.run("CREATE CONSTRAINT symptom_id IF NOT EXISTS FOR (s:Symptom) REQUIRE s.symptom_id IS UNIQUE");

    console.log("👤 Creating patients...");

    // Create Patients
    await session.run(`
      CREATE (p1:Patient {
        patient_id: "P001",
        name: "John Doe",
        age: 45,
        gender: "Male",
        blood_type: "O+",
        phone: "555-0101",
        email: "john.doe@email.com"
      })
      CREATE (p2:Patient {
        patient_id: "P002",
        name: "Jane Smith",
        age: 38,
        gender: "Female",
        blood_type: "A-",
        phone: "555-0102",
        email: "jane.smith@email.com"
      })
      CREATE (p3:Patient {
        patient_id: "P003",
        name: "Robert Johnson",
        age: 62,
        gender: "Male",
        blood_type: "B+",
        phone: "555-0103",
        email: "robert.j@email.com"
      })
    `);

    console.log("🦠 Creating diseases...");

    // Create Diseases
    await session.run(`
      CREATE (d1:Disease {disease_id: "DIS001", name: "Type 2 Diabetes", icd_code: "E11", description: "Chronic condition affecting blood sugar regulation"})
      CREATE (d2:Disease {disease_id: "DIS002", name: "Hypertension", icd_code: "I10", description: "High blood pressure condition"})
      CREATE (d3:Disease {disease_id: "DIS003", name: "Asthma", icd_code: "J45", description: "Chronic respiratory condition"})
      CREATE (d4:Disease {disease_id: "DIS004", name: "Hyperlipidemia", icd_code: "E78", description: "High cholesterol levels"})
      CREATE (d5:Disease {disease_id: "DIS005", name: "Arthritis", icd_code: "M19", description: "Joint inflammation and pain"})
    `);

    console.log("💊 Creating drugs...");

    // Create Drugs
    await session.run(`
      CREATE (dr1:Drug {drug_id: "DRUG001", name: "Metformin", dosage: "500mg", frequency: "twice daily", category: "Antidiabetic"})
      CREATE (dr2:Drug {drug_id: "DRUG002", name: "Lisinopril", dosage: "10mg", frequency: "once daily", category: "ACE Inhibitor"})
      CREATE (dr3:Drug {drug_id: "DRUG003", name: "Albuterol", dosage: "90mcg", frequency: "as needed", category: "Bronchodilator"})
      CREATE (dr4:Drug {drug_id: "DRUG004", name: "Atorvastatin", dosage: "20mg", frequency: "once daily", category: "Statin"})
      CREATE (dr5:Drug {drug_id: "DRUG005", name: "Ibuprofen", dosage: "400mg", frequency: "every 6 hours", category: "NSAID"})
      CREATE (dr6:Drug {drug_id: "DRUG006", name: "Insulin Glargine", dosage: "20 units", frequency: "once daily", category: "Insulin"})
      CREATE (dr7:Drug {drug_id: "DRUG007", name: "Amlodipine", dosage: "5mg", frequency: "once daily", category: "Calcium Channel Blocker"})
    `);

    console.log("🤒 Creating symptoms...");

    // Create Symptoms
    await session.run(`
      CREATE (s1:Symptom {symptom_id: "SYM001", name: "Fatigue", severity: "moderate"})
      CREATE (s2:Symptom {symptom_id: "SYM002", name: "Frequent Urination", severity: "high"})
      CREATE (s3:Symptom {symptom_id: "SYM003", name: "Headache", severity: "moderate"})
      CREATE (s4:Symptom {symptom_id: "SYM004", name: "Shortness of Breath", severity: "high"})
      CREATE (s5:Symptom {symptom_id: "SYM005", name: "Joint Pain", severity: "moderate"})
      CREATE (s6:Symptom {symptom_id: "SYM006", name: "Blurred Vision", severity: "moderate"})
      CREATE (s7:Symptom {symptom_id: "SYM007", name: "Dizziness", severity: "low"})
      CREATE (s8:Symptom {symptom_id: "SYM008", name: "Chest Tightness", severity: "high"})
    `);

    console.log("⚠️ Creating allergens...");

    // Create Allergens
    await session.run(`
      CREATE (a1:Allergen {allergen_id: "ALG001", name: "Penicillin", reaction: "Rash and hives", severity: "severe"})
      CREATE (a2:Allergen {allergen_id: "ALG002", name: "Shellfish", reaction: "Anaphylaxis", severity: "severe"})
      CREATE (a3:Allergen {allergen_id: "ALG003", name: "Pollen", reaction: "Sneezing, runny nose", severity: "mild"})
      CREATE (a4:Allergen {allergen_id: "ALG004", name: "Latex", reaction: "Skin irritation", severity: "moderate"})
    `);

    console.log("🧪 Creating lab results...");

    // Create Lab Results
    await session.run(`
      CREATE (l1:LabResult {lab_id: "LAB001", test_name: "HbA1c", value: "7.2", unit: "%", date: "2025-01-15", status: "elevated"})
      CREATE (l2:LabResult {lab_id: "LAB002", test_name: "Fasting Glucose", value: "142", unit: "mg/dL", date: "2025-01-15", status: "elevated"})
      CREATE (l3:LabResult {lab_id: "LAB003", test_name: "Blood Pressure", value: "145/92", unit: "mmHg", date: "2025-01-10", status: "elevated"})
      CREATE (l4:LabResult {lab_id: "LAB004", test_name: "Total Cholesterol", value: "245", unit: "mg/dL", date: "2025-01-12", status: "elevated"})
      CREATE (l5:LabResult {lab_id: "LAB005", test_name: "Spirometry FEV1", value: "72", unit: "%", date: "2025-01-08", status: "below normal"})
      CREATE (l6:LabResult {lab_id: "LAB006", test_name: "Creatinine", value: "1.1", unit: "mg/dL", date: "2025-01-15", status: "normal"})
    `);

    console.log("🔗 Creating relationships...");

    // Patient -> Disease relationships
    await session.run(`
      MATCH (p:Patient {patient_id: "P001"}), (d:Disease {disease_id: "DIS001"})
      CREATE (p)-[:HAS_DISEASE {diagnosed_date: "2023-06-15", status: "active", severity: "moderate"}]->(d)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P001"}), (d:Disease {disease_id: "DIS004"})
      CREATE (p)-[:HAS_DISEASE {diagnosed_date: "2024-01-20", status: "active", severity: "mild"}]->(d)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P002"}), (d:Disease {disease_id: "DIS002"})
      CREATE (p)-[:HAS_DISEASE {diagnosed_date: "2022-03-10", status: "active", severity: "moderate"}]->(d)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P002"}), (d:Disease {disease_id: "DIS003"})
      CREATE (p)-[:HAS_DISEASE {diagnosed_date: "2020-08-22", status: "active", severity: "mild"}]->(d)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (d:Disease {disease_id: "DIS001"})
      CREATE (p)-[:HAS_DISEASE {diagnosed_date: "2019-11-05", status: "active", severity: "severe"}]->(d)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (d:Disease {disease_id: "DIS002"})
      CREATE (p)-[:HAS_DISEASE {diagnosed_date: "2018-04-18", status: "active", severity: "moderate"}]->(d)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (d:Disease {disease_id: "DIS005"})
      CREATE (p)-[:HAS_DISEASE {diagnosed_date: "2021-07-30", status: "active", severity: "moderate"}]->(d)
    `);

    // Patient -> Drug (Currently Taking)
    await session.run(`
      MATCH (p:Patient {patient_id: "P001"}), (dr:Drug {drug_id: "DRUG001"})
      CREATE (p)-[:CURRENTLY_TAKING {start_date: "2023-06-15", prescribed_by: "Dr. Wilson"}]->(dr)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P001"}), (dr:Drug {drug_id: "DRUG004"})
      CREATE (p)-[:CURRENTLY_TAKING {start_date: "2024-01-20", prescribed_by: "Dr. Wilson"}]->(dr)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P002"}), (dr:Drug {drug_id: "DRUG002"})
      CREATE (p)-[:CURRENTLY_TAKING {start_date: "2022-03-10", prescribed_by: "Dr. Chen"}]->(dr)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P002"}), (dr:Drug {drug_id: "DRUG003"})
      CREATE (p)-[:CURRENTLY_TAKING {start_date: "2020-08-22", prescribed_by: "Dr. Chen"}]->(dr)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (dr:Drug {drug_id: "DRUG001"})
      CREATE (p)-[:CURRENTLY_TAKING {start_date: "2019-11-05", prescribed_by: "Dr. Patel"}]->(dr)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (dr:Drug {drug_id: "DRUG006"})
      CREATE (p)-[:CURRENTLY_TAKING {start_date: "2022-02-14", prescribed_by: "Dr. Patel"}]->(dr)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (dr:Drug {drug_id: "DRUG007"})
      CREATE (p)-[:CURRENTLY_TAKING {start_date: "2018-04-18", prescribed_by: "Dr. Patel"}]->(dr)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (dr:Drug {drug_id: "DRUG005"})
      CREATE (p)-[:CURRENTLY_TAKING {start_date: "2021-07-30", prescribed_by: "Dr. Patel"}]->(dr)
    `);

    // Disease -> Symptom
    await session.run(`
      MATCH (d:Disease {disease_id: "DIS001"}), (s:Symptom {symptom_id: "SYM001"})
      CREATE (d)-[:PRESENTS_WITH]->(s)
    `);
    await session.run(`
      MATCH (d:Disease {disease_id: "DIS001"}), (s:Symptom {symptom_id: "SYM002"})
      CREATE (d)-[:PRESENTS_WITH]->(s)
    `);
    await session.run(`
      MATCH (d:Disease {disease_id: "DIS001"}), (s:Symptom {symptom_id: "SYM006"})
      CREATE (d)-[:PRESENTS_WITH]->(s)
    `);
    await session.run(`
      MATCH (d:Disease {disease_id: "DIS002"}), (s:Symptom {symptom_id: "SYM003"})
      CREATE (d)-[:PRESENTS_WITH]->(s)
    `);
    await session.run(`
      MATCH (d:Disease {disease_id: "DIS002"}), (s:Symptom {symptom_id: "SYM007"})
      CREATE (d)-[:PRESENTS_WITH]->(s)
    `);
    await session.run(`
      MATCH (d:Disease {disease_id: "DIS003"}), (s:Symptom {symptom_id: "SYM004"})
      CREATE (d)-[:PRESENTS_WITH]->(s)
    `);
    await session.run(`
      MATCH (d:Disease {disease_id: "DIS003"}), (s:Symptom {symptom_id: "SYM008"})
      CREATE (d)-[:PRESENTS_WITH]->(s)
    `);
    await session.run(`
      MATCH (d:Disease {disease_id: "DIS005"}), (s:Symptom {symptom_id: "SYM005"})
      CREATE (d)-[:PRESENTS_WITH]->(s)
    `);

    // Drug -> Disease (TREATS)
    await session.run(`
      MATCH (dr:Drug {drug_id: "DRUG001"}), (d:Disease {disease_id: "DIS001"})
      CREATE (dr)-[:TREATS]->(d)
    `);
    await session.run(`
      MATCH (dr:Drug {drug_id: "DRUG006"}), (d:Disease {disease_id: "DIS001"})
      CREATE (dr)-[:TREATS]->(d)
    `);
    await session.run(`
      MATCH (dr:Drug {drug_id: "DRUG002"}), (d:Disease {disease_id: "DIS002"})
      CREATE (dr)-[:TREATS]->(d)
    `);
    await session.run(`
      MATCH (dr:Drug {drug_id: "DRUG007"}), (d:Disease {disease_id: "DIS002"})
      CREATE (dr)-[:TREATS]->(d)
    `);
    await session.run(`
      MATCH (dr:Drug {drug_id: "DRUG003"}), (d:Disease {disease_id: "DIS003"})
      CREATE (dr)-[:TREATS]->(d)
    `);
    await session.run(`
      MATCH (dr:Drug {drug_id: "DRUG004"}), (d:Disease {disease_id: "DIS004"})
      CREATE (dr)-[:TREATS]->(d)
    `);
    await session.run(`
      MATCH (dr:Drug {drug_id: "DRUG005"}), (d:Disease {disease_id: "DIS005"})
      CREATE (dr)-[:TREATS]->(d)
    `);

    // Patient -> Allergen
    await session.run(`
      MATCH (p:Patient {patient_id: "P001"}), (a:Allergen {allergen_id: "ALG001"})
      CREATE (p)-[:ALLERGIC_TO]->(a)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P002"}), (a:Allergen {allergen_id: "ALG002"})
      CREATE (p)-[:ALLERGIC_TO]->(a)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P002"}), (a:Allergen {allergen_id: "ALG003"})
      CREATE (p)-[:ALLERGIC_TO]->(a)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (a:Allergen {allergen_id: "ALG004"})
      CREATE (p)-[:ALLERGIC_TO]->(a)
    `);

    // Patient -> Lab Results
    await session.run(`
      MATCH (p:Patient {patient_id: "P001"}), (l:LabResult {lab_id: "LAB001"})
      CREATE (p)-[:HAS_LAB_RESULT]->(l)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P001"}), (l:LabResult {lab_id: "LAB002"})
      CREATE (p)-[:HAS_LAB_RESULT]->(l)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P002"}), (l:LabResult {lab_id: "LAB003"})
      CREATE (p)-[:HAS_LAB_RESULT]->(l)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P002"}), (l:LabResult {lab_id: "LAB005"})
      CREATE (p)-[:HAS_LAB_RESULT]->(l)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (l:LabResult {lab_id: "LAB004"})
      CREATE (p)-[:HAS_LAB_RESULT]->(l)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (l:LabResult {lab_id: "LAB006"})
      CREATE (p)-[:HAS_LAB_RESULT]->(l)
    `);

    // Drug Interactions
    await session.run(`
      MATCH (d1:Drug {drug_id: "DRUG001"}), (d2:Drug {drug_id: "DRUG005"})
      CREATE (d1)-[:INTERACTS_WITH {severity: "moderate", description: "May increase risk of lactic acidosis"}]->(d2)
    `);

    console.log("\n✅ Database seeded successfully!");
    console.log(`
📊 Created:
   • 3 Patients (P001, P002, P003)
   • 5 Diseases
   • 7 Drugs
   • 8 Symptoms
   • 4 Allergens
   • 6 Lab Results
   • Multiple relationships (HAS_DISEASE, CURRENTLY_TAKING, TREATS, etc.)
    `);

  } catch (error) {
    console.error("❌ Seed error:", error.message);
    throw error;
  } finally {
    await session.close();
    await closeDriver();
  }
}

seedDatabase();
