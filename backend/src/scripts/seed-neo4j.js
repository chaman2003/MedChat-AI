/**
 * Seed Neo4j Database with Medical Data
 * Includes Doctors, Patients (5 per doctor), and relationships
 * 
 * Run: npm run seed:neo4j
 */
require("dotenv").config({ path: __dirname + "/../../.env" });

const { getDriver, closeDriver } = require("../db/neo4j");

async function seedDatabase() {
  const driver = getDriver();
  const session = driver.session();

  console.log("🔄 Clearing existing data...");

  try {
    // Clear existing data
    await session.run("MATCH (n) DETACH DELETE n");

    console.log("📊 Creating constraints and indexes...");

    // Create constraints (unique IDs)
    await session.run("CREATE CONSTRAINT doctor_id IF NOT EXISTS FOR (d:Doctor) REQUIRE d.doctor_id IS UNIQUE");
    await session.run("CREATE CONSTRAINT patient_id IF NOT EXISTS FOR (p:Patient) REQUIRE p.patient_id IS UNIQUE");
    await session.run("CREATE CONSTRAINT disease_id IF NOT EXISTS FOR (d:Disease) REQUIRE d.disease_id IS UNIQUE");
    await session.run("CREATE CONSTRAINT drug_id IF NOT EXISTS FOR (d:Drug) REQUIRE d.drug_id IS UNIQUE");
    await session.run("CREATE CONSTRAINT symptom_id IF NOT EXISTS FOR (s:Symptom) REQUIRE s.symptom_id IS UNIQUE");

    console.log("👨‍⚕️ Creating doctors...");

    // Create Doctors (3 doctors)
    await session.run(`
      CREATE (d1:Doctor {
        doctor_id: "D001",
        name: "Dr. Sarah Chen",
        specialty: "Internal Medicine",
        phone: "555-1001",
        email: "sarah.chen@hospital.com",
        license_number: "MD-12345"
      })
      CREATE (d2:Doctor {
        doctor_id: "D002",
        name: "Dr. Michael Roberts",
        specialty: "Cardiology",
        phone: "555-1002",
        email: "michael.roberts@hospital.com",
        license_number: "MD-23456"
      })
      CREATE (d3:Doctor {
        doctor_id: "D003",
        name: "Dr. Emily Watson",
        specialty: "Endocrinology",
        phone: "555-1003",
        email: "emily.watson@hospital.com",
        license_number: "MD-34567"
      })
    `);

    console.log("👤 Creating patients...");

    // Create Patients - 5 patients per doctor (15 total)
    // Dr. Sarah Chen's patients (P001-P005)
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
      CREATE (p4:Patient {
        patient_id: "P004",
        name: "Lisa Anderson",
        age: 29,
        gender: "Female",
        blood_type: "AB+",
        phone: "555-0104",
        email: "lisa.a@email.com"
      })
      CREATE (p5:Patient {
        patient_id: "P005",
        name: "David Wilson",
        age: 55,
        gender: "Male",
        blood_type: "O-",
        phone: "555-0105",
        email: "david.w@email.com"
      })
    `);

    // Dr. Michael Roberts' patients (P006-P010)
    await session.run(`
      CREATE (p6:Patient {
        patient_id: "P006",
        name: "Emma Thompson",
        age: 67,
        gender: "Female",
        blood_type: "A+",
        phone: "555-0106",
        email: "emma.t@email.com"
      })
      CREATE (p7:Patient {
        patient_id: "P007",
        name: "James Martinez",
        age: 52,
        gender: "Male",
        blood_type: "B-",
        phone: "555-0107",
        email: "james.m@email.com"
      })
      CREATE (p8:Patient {
        patient_id: "P008",
        name: "Maria Garcia",
        age: 44,
        gender: "Female",
        blood_type: "O+",
        phone: "555-0108",
        email: "maria.g@email.com"
      })
      CREATE (p9:Patient {
        patient_id: "P009",
        name: "William Brown",
        age: 71,
        gender: "Male",
        blood_type: "AB-",
        phone: "555-0109",
        email: "william.b@email.com"
      })
      CREATE (p10:Patient {
        patient_id: "P010",
        name: "Jennifer Davis",
        age: 48,
        gender: "Female",
        blood_type: "A-",
        phone: "555-0110",
        email: "jennifer.d@email.com"
      })
    `);

    // Dr. Emily Watson's patients (P011-P015)
    await session.run(`
      CREATE (p11:Patient {
        patient_id: "P011",
        name: "Christopher Lee",
        age: 35,
        gender: "Male",
        blood_type: "B+",
        phone: "555-0111",
        email: "chris.l@email.com"
      })
      CREATE (p12:Patient {
        patient_id: "P012",
        name: "Amanda White",
        age: 41,
        gender: "Female",
        blood_type: "O-",
        phone: "555-0112",
        email: "amanda.w@email.com"
      })
      CREATE (p13:Patient {
        patient_id: "P013",
        name: "Daniel Harris",
        age: 58,
        gender: "Male",
        blood_type: "A+",
        phone: "555-0113",
        email: "daniel.h@email.com"
      })
      CREATE (p14:Patient {
        patient_id: "P014",
        name: "Sophia Clark",
        age: 33,
        gender: "Female",
        blood_type: "AB+",
        phone: "555-0114",
        email: "sophia.c@email.com"
      })
      CREATE (p15:Patient {
        patient_id: "P015",
        name: "Andrew Taylor",
        age: 49,
        gender: "Male",
        blood_type: "B-",
        phone: "555-0115",
        email: "andrew.t@email.com"
      })
    `);

    console.log("🔗 Creating doctor-patient relationships...");

    // Create TREATS relationships between doctors and patients
    await session.run(`
      MATCH (d:Doctor {doctor_id: "D001"})
      MATCH (p1:Patient {patient_id: "P001"})
      MATCH (p2:Patient {patient_id: "P002"})
      MATCH (p3:Patient {patient_id: "P003"})
      MATCH (p4:Patient {patient_id: "P004"})
      MATCH (p5:Patient {patient_id: "P005"})
      CREATE (d)-[:TREATS {since: "2023-01-15", primary: true}]->(p1)
      CREATE (d)-[:TREATS {since: "2023-03-20", primary: true}]->(p2)
      CREATE (d)-[:TREATS {since: "2022-11-10", primary: true}]->(p3)
      CREATE (d)-[:TREATS {since: "2024-02-01", primary: true}]->(p4)
      CREATE (d)-[:TREATS {since: "2023-08-15", primary: true}]->(p5)
    `);

    await session.run(`
      MATCH (d:Doctor {doctor_id: "D002"})
      MATCH (p6:Patient {patient_id: "P006"})
      MATCH (p7:Patient {patient_id: "P007"})
      MATCH (p8:Patient {patient_id: "P008"})
      MATCH (p9:Patient {patient_id: "P009"})
      MATCH (p10:Patient {patient_id: "P010"})
      CREATE (d)-[:TREATS {since: "2023-05-10", primary: true}]->(p6)
      CREATE (d)-[:TREATS {since: "2022-09-25", primary: true}]->(p7)
      CREATE (d)-[:TREATS {since: "2024-01-05", primary: true}]->(p8)
      CREATE (d)-[:TREATS {since: "2023-07-18", primary: true}]->(p9)
      CREATE (d)-[:TREATS {since: "2023-12-01", primary: true}]->(p10)
    `);

    await session.run(`
      MATCH (d:Doctor {doctor_id: "D003"})
      MATCH (p11:Patient {patient_id: "P011"})
      MATCH (p12:Patient {patient_id: "P012"})
      MATCH (p13:Patient {patient_id: "P013"})
      MATCH (p14:Patient {patient_id: "P014"})
      MATCH (p15:Patient {patient_id: "P015"})
      CREATE (d)-[:TREATS {since: "2023-04-22", primary: true}]->(p11)
      CREATE (d)-[:TREATS {since: "2022-12-15", primary: true}]->(p12)
      CREATE (d)-[:TREATS {since: "2023-09-08", primary: true}]->(p13)
      CREATE (d)-[:TREATS {since: "2024-01-20", primary: true}]->(p14)
      CREATE (d)-[:TREATS {since: "2023-06-30", primary: true}]->(p15)
    `);

    console.log("🦠 Creating diseases...");

    // Create Diseases
    await session.run(`
      CREATE (d1:Disease {disease_id: "DIS001", name: "Type 2 Diabetes", icd_code: "E11", description: "Chronic condition affecting blood sugar regulation"})
      CREATE (d2:Disease {disease_id: "DIS002", name: "Hypertension", icd_code: "I10", description: "High blood pressure condition"})
      CREATE (d3:Disease {disease_id: "DIS003", name: "Asthma", icd_code: "J45", description: "Chronic respiratory condition"})
      CREATE (d4:Disease {disease_id: "DIS004", name: "Hyperlipidemia", icd_code: "E78", description: "High cholesterol levels"})
      CREATE (d5:Disease {disease_id: "DIS005", name: "Arthritis", icd_code: "M19", description: "Joint inflammation and pain"})
      CREATE (d6:Disease {disease_id: "DIS006", name: "Coronary Artery Disease", icd_code: "I25", description: "Heart disease caused by narrowed coronary arteries"})
      CREATE (d7:Disease {disease_id: "DIS007", name: "Heart Failure", icd_code: "I50", description: "Heart unable to pump blood effectively"})
      CREATE (d8:Disease {disease_id: "DIS008", name: "Atrial Fibrillation", icd_code: "I48", description: "Irregular heart rhythm"})
      CREATE (d9:Disease {disease_id: "DIS009", name: "Hypothyroidism", icd_code: "E03", description: "Underactive thyroid gland"})
      CREATE (d10:Disease {disease_id: "DIS010", name: "Type 1 Diabetes", icd_code: "E10", description: "Autoimmune diabetes requiring insulin"})
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
      CREATE (dr8:Drug {drug_id: "DRUG008", name: "Warfarin", dosage: "5mg", frequency: "once daily", category: "Anticoagulant"})
      CREATE (dr9:Drug {drug_id: "DRUG009", name: "Levothyroxine", dosage: "100mcg", frequency: "once daily", category: "Thyroid Hormone"})
      CREATE (dr10:Drug {drug_id: "DRUG010", name: "Carvedilol", dosage: "25mg", frequency: "twice daily", category: "Beta Blocker"})
      CREATE (dr11:Drug {drug_id: "DRUG011", name: "Furosemide", dosage: "40mg", frequency: "once daily", category: "Diuretic"})
      CREATE (dr12:Drug {drug_id: "DRUG012", name: "Aspirin", dosage: "81mg", frequency: "once daily", category: "Antiplatelet"})
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
      CREATE (s9:Symptom {symptom_id: "SYM009", name: "Swelling in Legs", severity: "moderate"})
      CREATE (s10:Symptom {symptom_id: "SYM010", name: "Palpitations", severity: "high"})
      CREATE (s11:Symptom {symptom_id: "SYM011", name: "Weight Gain", severity: "low"})
      CREATE (s12:Symptom {symptom_id: "SYM012", name: "Cold Intolerance", severity: "moderate"})
    `);

    console.log("⚠️ Creating allergens...");

    // Create Allergens
    await session.run(`
      CREATE (a1:Allergen {allergen_id: "ALG001", name: "Penicillin", reaction: "Rash, Anaphylaxis", severity: "severe"})
      CREATE (a2:Allergen {allergen_id: "ALG002", name: "Sulfa Drugs", reaction: "Skin Rash", severity: "moderate"})
      CREATE (a3:Allergen {allergen_id: "ALG003", name: "Aspirin", reaction: "Stomach Pain, Bleeding", severity: "moderate"})
      CREATE (a4:Allergen {allergen_id: "ALG004", name: "Latex", reaction: "Contact Dermatitis", severity: "mild"})
      CREATE (a5:Allergen {allergen_id: "ALG005", name: "Iodine", reaction: "Skin Irritation", severity: "mild"})
      CREATE (a6:Allergen {allergen_id: "ALG006", name: "NSAIDs", reaction: "Gastrointestinal Issues", severity: "moderate"})
    `);

    console.log("🔬 Creating lab results...");

    // Create Lab Results for various patients
    await session.run(`
      CREATE (lab1:LabResult {lab_id: "LAB001", test_name: "HbA1c", value: "7.2", unit: "%", date: "2024-01-15", status: "Above Normal", patient_id: "P001"})
      CREATE (lab2:LabResult {lab_id: "LAB002", test_name: "Blood Pressure", value: "145/92", unit: "mmHg", date: "2024-01-15", status: "High", patient_id: "P001"})
      CREATE (lab3:LabResult {lab_id: "LAB003", test_name: "LDL Cholesterol", value: "165", unit: "mg/dL", date: "2024-01-10", status: "High", patient_id: "P002"})
      CREATE (lab4:LabResult {lab_id: "LAB004", test_name: "FEV1", value: "72", unit: "%", date: "2024-01-08", status: "Reduced", patient_id: "P003"})
      CREATE (lab5:LabResult {lab_id: "LAB005", test_name: "TSH", value: "8.5", unit: "mIU/L", date: "2024-01-12", status: "High", patient_id: "P011"})
      CREATE (lab6:LabResult {lab_id: "LAB006", test_name: "BNP", value: "450", unit: "pg/mL", date: "2024-01-14", status: "Elevated", patient_id: "P006"})
      CREATE (lab7:LabResult {lab_id: "LAB007", test_name: "INR", value: "2.5", unit: "", date: "2024-01-16", status: "Therapeutic", patient_id: "P009"})
      CREATE (lab8:LabResult {lab_id: "LAB008", test_name: "Fasting Glucose", value: "185", unit: "mg/dL", date: "2024-01-15", status: "High", patient_id: "P014"})
    `);

    console.log("🔗 Creating patient-disease relationships...");

    // Patient-Disease relationships (HAS_DISEASE)
    // Dr. Chen's patients
    await session.run(`
      MATCH (p1:Patient {patient_id: "P001"}), (dis1:Disease {disease_id: "DIS001"}), (dis2:Disease {disease_id: "DIS002"})
      CREATE (p1)-[:HAS_DISEASE {diagnosed_date: "2022-03-15", status: "active", severity: "moderate"}]->(dis1)
      CREATE (p1)-[:HAS_DISEASE {diagnosed_date: "2021-08-20", status: "active", severity: "mild"}]->(dis2)
    `);
    await session.run(`
      MATCH (p2:Patient {patient_id: "P002"}), (dis4:Disease {disease_id: "DIS004"}), (dis2:Disease {disease_id: "DIS002"})
      CREATE (p2)-[:HAS_DISEASE {diagnosed_date: "2023-01-10", status: "active", severity: "mild"}]->(dis4)
      CREATE (p2)-[:HAS_DISEASE {diagnosed_date: "2023-05-15", status: "active", severity: "moderate"}]->(dis2)
    `);
    await session.run(`
      MATCH (p3:Patient {patient_id: "P003"}), (dis3:Disease {disease_id: "DIS003"}), (dis5:Disease {disease_id: "DIS005"})
      CREATE (p3)-[:HAS_DISEASE {diagnosed_date: "2020-06-18", status: "active", severity: "moderate"}]->(dis3)
      CREATE (p3)-[:HAS_DISEASE {diagnosed_date: "2019-11-22", status: "active", severity: "severe"}]->(dis5)
    `);
    await session.run(`
      MATCH (p4:Patient {patient_id: "P004"}), (dis3:Disease {disease_id: "DIS003"})
      CREATE (p4)-[:HAS_DISEASE {diagnosed_date: "2023-09-05", status: "active", severity: "mild"}]->(dis3)
    `);
    await session.run(`
      MATCH (p5:Patient {patient_id: "P005"}), (dis1:Disease {disease_id: "DIS001"}), (dis4:Disease {disease_id: "DIS004"})
      CREATE (p5)-[:HAS_DISEASE {diagnosed_date: "2021-04-12", status: "active", severity: "moderate"}]->(dis1)
      CREATE (p5)-[:HAS_DISEASE {diagnosed_date: "2022-01-08", status: "active", severity: "mild"}]->(dis4)
    `);

    // Dr. Roberts' patients (Cardiology)
    await session.run(`
      MATCH (p6:Patient {patient_id: "P006"}), (dis6:Disease {disease_id: "DIS006"}), (dis7:Disease {disease_id: "DIS007"})
      CREATE (p6)-[:HAS_DISEASE {diagnosed_date: "2021-02-28", status: "active", severity: "severe"}]->(dis6)
      CREATE (p6)-[:HAS_DISEASE {diagnosed_date: "2022-05-15", status: "active", severity: "moderate"}]->(dis7)
    `);
    await session.run(`
      MATCH (p7:Patient {patient_id: "P007"}), (dis6:Disease {disease_id: "DIS006"}), (dis2:Disease {disease_id: "DIS002"})
      CREATE (p7)-[:HAS_DISEASE {diagnosed_date: "2020-09-10", status: "active", severity: "moderate"}]->(dis6)
      CREATE (p7)-[:HAS_DISEASE {diagnosed_date: "2019-03-22", status: "active", severity: "moderate"}]->(dis2)
    `);
    await session.run(`
      MATCH (p8:Patient {patient_id: "P008"}), (dis8:Disease {disease_id: "DIS008"}), (dis2:Disease {disease_id: "DIS002"})
      CREATE (p8)-[:HAS_DISEASE {diagnosed_date: "2023-07-18", status: "active", severity: "moderate"}]->(dis8)
      CREATE (p8)-[:HAS_DISEASE {diagnosed_date: "2022-11-05", status: "active", severity: "mild"}]->(dis2)
    `);
    await session.run(`
      MATCH (p9:Patient {patient_id: "P009"}), (dis8:Disease {disease_id: "DIS008"}), (dis7:Disease {disease_id: "DIS007"})
      CREATE (p9)-[:HAS_DISEASE {diagnosed_date: "2020-12-10", status: "active", severity: "severe"}]->(dis8)
      CREATE (p9)-[:HAS_DISEASE {diagnosed_date: "2021-06-22", status: "active", severity: "moderate"}]->(dis7)
    `);
    await session.run(`
      MATCH (p10:Patient {patient_id: "P010"}), (dis6:Disease {disease_id: "DIS006"}), (dis4:Disease {disease_id: "DIS004"})
      CREATE (p10)-[:HAS_DISEASE {diagnosed_date: "2022-08-15", status: "active", severity: "moderate"}]->(dis6)
      CREATE (p10)-[:HAS_DISEASE {diagnosed_date: "2021-03-10", status: "active", severity: "mild"}]->(dis4)
    `);

    // Dr. Watson's patients (Endocrinology)
    await session.run(`
      MATCH (p11:Patient {patient_id: "P011"}), (dis9:Disease {disease_id: "DIS009"}), (dis1:Disease {disease_id: "DIS001"})
      CREATE (p11)-[:HAS_DISEASE {diagnosed_date: "2022-06-20", status: "active", severity: "moderate"}]->(dis9)
      CREATE (p11)-[:HAS_DISEASE {diagnosed_date: "2023-01-15", status: "active", severity: "mild"}]->(dis1)
    `);
    await session.run(`
      MATCH (p12:Patient {patient_id: "P012"}), (dis10:Disease {disease_id: "DIS010"})
      CREATE (p12)-[:HAS_DISEASE {diagnosed_date: "2018-04-10", status: "active", severity: "severe"}]->(dis10)
    `);
    await session.run(`
      MATCH (p13:Patient {patient_id: "P013"}), (dis1:Disease {disease_id: "DIS001"}), (dis9:Disease {disease_id: "DIS009"})
      CREATE (p13)-[:HAS_DISEASE {diagnosed_date: "2020-11-08", status: "active", severity: "moderate"}]->(dis1)
      CREATE (p13)-[:HAS_DISEASE {diagnosed_date: "2021-08-22", status: "active", severity: "mild"}]->(dis9)
    `);
    await session.run(`
      MATCH (p14:Patient {patient_id: "P014"}), (dis10:Disease {disease_id: "DIS010"}), (dis9:Disease {disease_id: "DIS009"})
      CREATE (p14)-[:HAS_DISEASE {diagnosed_date: "2021-02-14", status: "active", severity: "moderate"}]->(dis10)
      CREATE (p14)-[:HAS_DISEASE {diagnosed_date: "2022-09-30", status: "active", severity: "mild"}]->(dis9)
    `);
    await session.run(`
      MATCH (p15:Patient {patient_id: "P015"}), (dis1:Disease {disease_id: "DIS001"}), (dis4:Disease {disease_id: "DIS004"})
      CREATE (p15)-[:HAS_DISEASE {diagnosed_date: "2019-07-25", status: "active", severity: "moderate"}]->(dis1)
      CREATE (p15)-[:HAS_DISEASE {diagnosed_date: "2020-12-05", status: "active", severity: "moderate"}]->(dis4)
    `);

    console.log("💉 Creating patient-medication relationships...");

    // Patient-Drug relationships (CURRENTLY_TAKING)
    await session.run(`
      MATCH (p1:Patient {patient_id: "P001"}), (dr1:Drug {drug_id: "DRUG001"}), (dr2:Drug {drug_id: "DRUG002"})
      CREATE (p1)-[:CURRENTLY_TAKING {start_date: "2022-03-20", prescribed_by: "D001"}]->(dr1)
      CREATE (p1)-[:CURRENTLY_TAKING {start_date: "2021-08-25", prescribed_by: "D001"}]->(dr2)
    `);
    await session.run(`
      MATCH (p2:Patient {patient_id: "P002"}), (dr4:Drug {drug_id: "DRUG004"}), (dr7:Drug {drug_id: "DRUG007"})
      CREATE (p2)-[:CURRENTLY_TAKING {start_date: "2023-01-15", prescribed_by: "D001"}]->(dr4)
      CREATE (p2)-[:CURRENTLY_TAKING {start_date: "2023-05-20", prescribed_by: "D001"}]->(dr7)
    `);
    await session.run(`
      MATCH (p3:Patient {patient_id: "P003"}), (dr3:Drug {drug_id: "DRUG003"}), (dr5:Drug {drug_id: "DRUG005"})
      CREATE (p3)-[:CURRENTLY_TAKING {start_date: "2020-06-25", prescribed_by: "D001"}]->(dr3)
      CREATE (p3)-[:CURRENTLY_TAKING {start_date: "2019-12-01", prescribed_by: "D001"}]->(dr5)
    `);
    await session.run(`
      MATCH (p4:Patient {patient_id: "P004"}), (dr3:Drug {drug_id: "DRUG003"})
      CREATE (p4)-[:CURRENTLY_TAKING {start_date: "2023-09-10", prescribed_by: "D001"}]->(dr3)
    `);
    await session.run(`
      MATCH (p5:Patient {patient_id: "P005"}), (dr1:Drug {drug_id: "DRUG001"}), (dr4:Drug {drug_id: "DRUG004"})
      CREATE (p5)-[:CURRENTLY_TAKING {start_date: "2021-04-18", prescribed_by: "D001"}]->(dr1)
      CREATE (p5)-[:CURRENTLY_TAKING {start_date: "2022-01-15", prescribed_by: "D001"}]->(dr4)
    `);

    // Dr. Roberts' patients medications
    await session.run(`
      MATCH (p6:Patient {patient_id: "P006"}), (dr10:Drug {drug_id: "DRUG010"}), (dr11:Drug {drug_id: "DRUG011"}), (dr12:Drug {drug_id: "DRUG012"})
      CREATE (p6)-[:CURRENTLY_TAKING {start_date: "2022-05-20", prescribed_by: "D002"}]->(dr10)
      CREATE (p6)-[:CURRENTLY_TAKING {start_date: "2022-05-20", prescribed_by: "D002"}]->(dr11)
      CREATE (p6)-[:CURRENTLY_TAKING {start_date: "2021-03-05", prescribed_by: "D002"}]->(dr12)
    `);
    await session.run(`
      MATCH (p7:Patient {patient_id: "P007"}), (dr12:Drug {drug_id: "DRUG012"}), (dr4:Drug {drug_id: "DRUG004"}), (dr2:Drug {drug_id: "DRUG002"})
      CREATE (p7)-[:CURRENTLY_TAKING {start_date: "2020-09-15", prescribed_by: "D002"}]->(dr12)
      CREATE (p7)-[:CURRENTLY_TAKING {start_date: "2020-10-01", prescribed_by: "D002"}]->(dr4)
      CREATE (p7)-[:CURRENTLY_TAKING {start_date: "2019-03-28", prescribed_by: "D002"}]->(dr2)
    `);
    await session.run(`
      MATCH (p8:Patient {patient_id: "P008"}), (dr8:Drug {drug_id: "DRUG008"}), (dr10:Drug {drug_id: "DRUG010"})
      CREATE (p8)-[:CURRENTLY_TAKING {start_date: "2023-07-25", prescribed_by: "D002"}]->(dr8)
      CREATE (p8)-[:CURRENTLY_TAKING {start_date: "2022-11-10", prescribed_by: "D002"}]->(dr10)
    `);
    await session.run(`
      MATCH (p9:Patient {patient_id: "P009"}), (dr8:Drug {drug_id: "DRUG008"}), (dr11:Drug {drug_id: "DRUG011"}), (dr10:Drug {drug_id: "DRUG010"})
      CREATE (p9)-[:CURRENTLY_TAKING {start_date: "2020-12-15", prescribed_by: "D002"}]->(dr8)
      CREATE (p9)-[:CURRENTLY_TAKING {start_date: "2021-07-01", prescribed_by: "D002"}]->(dr11)
      CREATE (p9)-[:CURRENTLY_TAKING {start_date: "2021-07-01", prescribed_by: "D002"}]->(dr10)
    `);
    await session.run(`
      MATCH (p10:Patient {patient_id: "P010"}), (dr12:Drug {drug_id: "DRUG012"}), (dr4:Drug {drug_id: "DRUG004"})
      CREATE (p10)-[:CURRENTLY_TAKING {start_date: "2022-08-20", prescribed_by: "D002"}]->(dr12)
      CREATE (p10)-[:CURRENTLY_TAKING {start_date: "2021-03-15", prescribed_by: "D002"}]->(dr4)
    `);

    // Dr. Watson's patients medications
    await session.run(`
      MATCH (p11:Patient {patient_id: "P011"}), (dr9:Drug {drug_id: "DRUG009"}), (dr1:Drug {drug_id: "DRUG001"})
      CREATE (p11)-[:CURRENTLY_TAKING {start_date: "2022-06-25", prescribed_by: "D003"}]->(dr9)
      CREATE (p11)-[:CURRENTLY_TAKING {start_date: "2023-01-20", prescribed_by: "D003"}]->(dr1)
    `);
    await session.run(`
      MATCH (p12:Patient {patient_id: "P012"}), (dr6:Drug {drug_id: "DRUG006"})
      CREATE (p12)-[:CURRENTLY_TAKING {start_date: "2018-04-15", prescribed_by: "D003"}]->(dr6)
    `);
    await session.run(`
      MATCH (p13:Patient {patient_id: "P013"}), (dr1:Drug {drug_id: "DRUG001"}), (dr9:Drug {drug_id: "DRUG009"})
      CREATE (p13)-[:CURRENTLY_TAKING {start_date: "2020-11-15", prescribed_by: "D003"}]->(dr1)
      CREATE (p13)-[:CURRENTLY_TAKING {start_date: "2021-08-28", prescribed_by: "D003"}]->(dr9)
    `);
    await session.run(`
      MATCH (p14:Patient {patient_id: "P014"}), (dr6:Drug {drug_id: "DRUG006"}), (dr9:Drug {drug_id: "DRUG009"})
      CREATE (p14)-[:CURRENTLY_TAKING {start_date: "2021-02-20", prescribed_by: "D003"}]->(dr6)
      CREATE (p14)-[:CURRENTLY_TAKING {start_date: "2022-10-05", prescribed_by: "D003"}]->(dr9)
    `);
    await session.run(`
      MATCH (p15:Patient {patient_id: "P015"}), (dr1:Drug {drug_id: "DRUG001"}), (dr4:Drug {drug_id: "DRUG004"})
      CREATE (p15)-[:CURRENTLY_TAKING {start_date: "2019-08-01", prescribed_by: "D003"}]->(dr1)
      CREATE (p15)-[:CURRENTLY_TAKING {start_date: "2020-12-10", prescribed_by: "D003"}]->(dr4)
    `);

    console.log("🔗 Creating disease-symptom relationships...");

    // Disease-Symptom relationships (PRESENTS_WITH)
    await session.run(`
      MATCH (dis1:Disease {disease_id: "DIS001"}), (s1:Symptom {symptom_id: "SYM001"}), (s2:Symptom {symptom_id: "SYM002"}), (s6:Symptom {symptom_id: "SYM006"})
      CREATE (dis1)-[:PRESENTS_WITH]->(s1)
      CREATE (dis1)-[:PRESENTS_WITH]->(s2)
      CREATE (dis1)-[:PRESENTS_WITH]->(s6)
    `);
    await session.run(`
      MATCH (dis2:Disease {disease_id: "DIS002"}), (s3:Symptom {symptom_id: "SYM003"}), (s7:Symptom {symptom_id: "SYM007"})
      CREATE (dis2)-[:PRESENTS_WITH]->(s3)
      CREATE (dis2)-[:PRESENTS_WITH]->(s7)
    `);
    await session.run(`
      MATCH (dis3:Disease {disease_id: "DIS003"}), (s4:Symptom {symptom_id: "SYM004"}), (s8:Symptom {symptom_id: "SYM008"})
      CREATE (dis3)-[:PRESENTS_WITH]->(s4)
      CREATE (dis3)-[:PRESENTS_WITH]->(s8)
    `);
    await session.run(`
      MATCH (dis5:Disease {disease_id: "DIS005"}), (s5:Symptom {symptom_id: "SYM005"})
      CREATE (dis5)-[:PRESENTS_WITH]->(s5)
    `);
    await session.run(`
      MATCH (dis6:Disease {disease_id: "DIS006"}), (s8:Symptom {symptom_id: "SYM008"}), (s4:Symptom {symptom_id: "SYM004"})
      CREATE (dis6)-[:PRESENTS_WITH]->(s8)
      CREATE (dis6)-[:PRESENTS_WITH]->(s4)
    `);
    await session.run(`
      MATCH (dis7:Disease {disease_id: "DIS007"}), (s4:Symptom {symptom_id: "SYM004"}), (s9:Symptom {symptom_id: "SYM009"}), (s1:Symptom {symptom_id: "SYM001"})
      CREATE (dis7)-[:PRESENTS_WITH]->(s4)
      CREATE (dis7)-[:PRESENTS_WITH]->(s9)
      CREATE (dis7)-[:PRESENTS_WITH]->(s1)
    `);
    await session.run(`
      MATCH (dis8:Disease {disease_id: "DIS008"}), (s10:Symptom {symptom_id: "SYM010"}), (s7:Symptom {symptom_id: "SYM007"})
      CREATE (dis8)-[:PRESENTS_WITH]->(s10)
      CREATE (dis8)-[:PRESENTS_WITH]->(s7)
    `);
    await session.run(`
      MATCH (dis9:Disease {disease_id: "DIS009"}), (s1:Symptom {symptom_id: "SYM001"}), (s11:Symptom {symptom_id: "SYM011"}), (s12:Symptom {symptom_id: "SYM012"})
      CREATE (dis9)-[:PRESENTS_WITH]->(s1)
      CREATE (dis9)-[:PRESENTS_WITH]->(s11)
      CREATE (dis9)-[:PRESENTS_WITH]->(s12)
    `);
    await session.run(`
      MATCH (dis10:Disease {disease_id: "DIS010"}), (s1:Symptom {symptom_id: "SYM001"}), (s2:Symptom {symptom_id: "SYM002"}), (s6:Symptom {symptom_id: "SYM006"})
      CREATE (dis10)-[:PRESENTS_WITH]->(s1)
      CREATE (dis10)-[:PRESENTS_WITH]->(s2)
      CREATE (dis10)-[:PRESENTS_WITH]->(s6)
    `);

    console.log("💊 Creating drug-disease relationships...");

    // Drug-Disease relationships (TREATS)
    await session.run(`
      MATCH (dr1:Drug {drug_id: "DRUG001"}), (dis1:Disease {disease_id: "DIS001"})
      CREATE (dr1)-[:TREATS]->(dis1)
    `);
    await session.run(`
      MATCH (dr2:Drug {drug_id: "DRUG002"}), (dis2:Disease {disease_id: "DIS002"}), (dis7:Disease {disease_id: "DIS007"})
      CREATE (dr2)-[:TREATS]->(dis2)
      CREATE (dr2)-[:TREATS]->(dis7)
    `);
    await session.run(`
      MATCH (dr3:Drug {drug_id: "DRUG003"}), (dis3:Disease {disease_id: "DIS003"})
      CREATE (dr3)-[:TREATS]->(dis3)
    `);
    await session.run(`
      MATCH (dr4:Drug {drug_id: "DRUG004"}), (dis4:Disease {disease_id: "DIS004"}), (dis6:Disease {disease_id: "DIS006"})
      CREATE (dr4)-[:TREATS]->(dis4)
      CREATE (dr4)-[:TREATS]->(dis6)
    `);
    await session.run(`
      MATCH (dr5:Drug {drug_id: "DRUG005"}), (dis5:Disease {disease_id: "DIS005"})
      CREATE (dr5)-[:TREATS]->(dis5)
    `);
    await session.run(`
      MATCH (dr6:Drug {drug_id: "DRUG006"}), (dis1:Disease {disease_id: "DIS001"}), (dis10:Disease {disease_id: "DIS010"})
      CREATE (dr6)-[:TREATS]->(dis1)
      CREATE (dr6)-[:TREATS]->(dis10)
    `);
    await session.run(`
      MATCH (dr7:Drug {drug_id: "DRUG007"}), (dis2:Disease {disease_id: "DIS002"})
      CREATE (dr7)-[:TREATS]->(dis2)
    `);
    await session.run(`
      MATCH (dr8:Drug {drug_id: "DRUG008"}), (dis8:Disease {disease_id: "DIS008"})
      CREATE (dr8)-[:TREATS]->(dis8)
    `);
    await session.run(`
      MATCH (dr9:Drug {drug_id: "DRUG009"}), (dis9:Disease {disease_id: "DIS009"})
      CREATE (dr9)-[:TREATS]->(dis9)
    `);
    await session.run(`
      MATCH (dr10:Drug {drug_id: "DRUG010"}), (dis7:Disease {disease_id: "DIS007"}), (dis2:Disease {disease_id: "DIS002"})
      CREATE (dr10)-[:TREATS]->(dis7)
      CREATE (dr10)-[:TREATS]->(dis2)
    `);
    await session.run(`
      MATCH (dr11:Drug {drug_id: "DRUG011"}), (dis7:Disease {disease_id: "DIS007"})
      CREATE (dr11)-[:TREATS]->(dis7)
    `);
    await session.run(`
      MATCH (dr12:Drug {drug_id: "DRUG012"}), (dis6:Disease {disease_id: "DIS006"})
      CREATE (dr12)-[:TREATS]->(dis6)
    `);

    console.log("⚠️ Creating patient-allergen relationships...");

    // Patient-Allergen relationships (ALLERGIC_TO)
    await session.run(`
      MATCH (p1:Patient {patient_id: "P001"}), (a1:Allergen {allergen_id: "ALG001"})
      CREATE (p1)-[:ALLERGIC_TO]->(a1)
    `);
    await session.run(`
      MATCH (p3:Patient {patient_id: "P003"}), (a2:Allergen {allergen_id: "ALG002"}), (a6:Allergen {allergen_id: "ALG006"})
      CREATE (p3)-[:ALLERGIC_TO]->(a2)
      CREATE (p3)-[:ALLERGIC_TO]->(a6)
    `);
    await session.run(`
      MATCH (p6:Patient {patient_id: "P006"}), (a3:Allergen {allergen_id: "ALG003"})
      CREATE (p6)-[:ALLERGIC_TO]->(a3)
    `);
    await session.run(`
      MATCH (p9:Patient {patient_id: "P009"}), (a1:Allergen {allergen_id: "ALG001"}), (a5:Allergen {allergen_id: "ALG005"})
      CREATE (p9)-[:ALLERGIC_TO]->(a1)
      CREATE (p9)-[:ALLERGIC_TO]->(a5)
    `);
    await session.run(`
      MATCH (p12:Patient {patient_id: "P012"}), (a4:Allergen {allergen_id: "ALG004"})
      CREATE (p12)-[:ALLERGIC_TO]->(a4)
    `);

    console.log("🔬 Connecting lab results to patients...");

    // Connect lab results to patients
    await session.run(`
      MATCH (p:Patient {patient_id: "P001"}), (lab:LabResult {lab_id: "LAB001"})
      CREATE (p)-[:HAS_LAB_RESULT]->(lab)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P001"}), (lab:LabResult {lab_id: "LAB002"})
      CREATE (p)-[:HAS_LAB_RESULT]->(lab)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P002"}), (lab:LabResult {lab_id: "LAB003"})
      CREATE (p)-[:HAS_LAB_RESULT]->(lab)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P003"}), (lab:LabResult {lab_id: "LAB004"})
      CREATE (p)-[:HAS_LAB_RESULT]->(lab)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P011"}), (lab:LabResult {lab_id: "LAB005"})
      CREATE (p)-[:HAS_LAB_RESULT]->(lab)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P006"}), (lab:LabResult {lab_id: "LAB006"})
      CREATE (p)-[:HAS_LAB_RESULT]->(lab)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P009"}), (lab:LabResult {lab_id: "LAB007"})
      CREATE (p)-[:HAS_LAB_RESULT]->(lab)
    `);
    await session.run(`
      MATCH (p:Patient {patient_id: "P014"}), (lab:LabResult {lab_id: "LAB008"})
      CREATE (p)-[:HAS_LAB_RESULT]->(lab)
    `);

    console.log("💊 Creating drug interactions...");

    // Drug interactions (INTERACTS_WITH)
    await session.run(`
      MATCH (dr1:Drug {drug_id: "DRUG001"}), (dr8:Drug {drug_id: "DRUG008"})
      CREATE (dr1)-[:INTERACTS_WITH {severity: "moderate", description: "May enhance anticoagulant effect"}]->(dr8)
    `);
    await session.run(`
      MATCH (dr2:Drug {drug_id: "DRUG002"}), (dr5:Drug {drug_id: "DRUG005"})
      CREATE (dr2)-[:INTERACTS_WITH {severity: "moderate", description: "NSAIDs may reduce ACE inhibitor efficacy"}]->(dr5)
    `);
    await session.run(`
      MATCH (dr8:Drug {drug_id: "DRUG008"}), (dr12:Drug {drug_id: "DRUG012"})
      CREATE (dr8)-[:INTERACTS_WITH {severity: "high", description: "Increased bleeding risk"}]->(dr12)
    `);

    console.log("✅ Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log("   - 3 Doctors");
    console.log("   - 15 Patients (5 per doctor)");
    console.log("   - 10 Diseases");
    console.log("   - 12 Drugs");
    console.log("   - 12 Symptoms");
    console.log("   - 6 Allergens");
    console.log("   - 8 Lab Results");
    console.log("   - Multiple relationships between entities");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await session.close();
    await closeDriver();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
