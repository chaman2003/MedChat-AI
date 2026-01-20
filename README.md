# Med-Chat: Medical Graph Database Assistant

A POC for querying patient medical data from a **Neo4j Knowledge Graph** with natural language, powered by **Groq LLM**.

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   FRONTEND (Port 5000)               │
│            HTML/CSS/JS - Chat Interface              │
└────────────────┬─────────────────────────────────────┘
                 │ HTTP/JSON
                 ↓
┌──────────────────────────────────────────────────────┐
│                  BACKEND (Port 3001)                 │
│         Node.js/Express API with Neo4j/Groq         │
└────────────────┬─────────────────────────────────────┘
                 │
       ┌─────────┴──────────┐
       ↓                    ↓
  ┌────────────┐      ┌──────────┐
  │  Neo4j DB  │      │ Groq LLM │
  └────────────┘      └──────────┘
```

## Tech Stack

| Component | Technology |
|-----------|------------|
| Database | Neo4j Graph Database |
| LLM | Groq (llama-3.1-70b) |
| Backend | Node.js + Express (Port 3001) |
| Frontend | HTML/CSS/JS (Port 5000) |

## Quick Start (Two Separate Stacks)

### Terminal 1: Start Backend
```bash
cd backend
npm install
npm start
# Runs on http://localhost:3001
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm install
npm start
# Opens http://localhost:5000 automatically
```

## Project Structure

```
med-chat/
├── backend/                 # Independent Backend Stack
│   ├── src/
│   │   ├── server.js        # Express API (Port 3001)
│   │   ├── chat.js          # RAG handler
│   │   ├── neo4j-driver.js  # Neo4j connection
│   │   ├── graph-queries.js # Cypher queries
│   │   ├── entity-extractor.js
│   │   ├── llm.js           # Groq LLM
│   │   └── seed-neo4j.js    # Test data
│   ├── .env                 # Neo4j + Groq credentials
│   ├── package.json         # Backend dependencies
│   └── README.md
│
├── frontend/                # Independent Frontend Stack
│   ├── index.html
│   ├── css/style.css
│   ├── js/app.js
│   ├── package.json         # Frontend dependencies
│   └── README.md
│
└── README.md (this file)
```

## Test Patients

| ID | Name | Conditions |
|----|------|------------|
| P001 | John Doe | Type 2 Diabetes, Hyperlipidemia |
| P002 | Jane Smith | Hypertension, Asthma |
| P003 | Robert Johnson | Diabetes, Hypertension, Arthritis |

## API Endpoints

### POST /chat
```json
{
  "question": "What diseases does P001 have?",
  "role": "doctor",
  "user_id": "D001",
  "patient_id": "P001"
}
```

Response:
```json
{
  "success": true,
  "answer": "Patient P001 (John Doe) has Type 2 Diabetes and Hyperlipidemia...",
  "source": "neo4j",
  "query_type": "diseases",
  "patient_id": "P001",
  "records_retrieved": 2
}
```

### GET /health
Health check endpoint

## Usage

1. **Authenticate** - Select role (Doctor/Patient) and enter ID
2. **Query** - Ask natural language questions like:
   - "What diseases does P001 have?"
   - "What medications is P002 taking?"
   - "Show me P003's lab results"
3. **Get Answer** - Groq LLM generates natural language response from Neo4j graph data

## Graph Schema

```
(Patient)──HAS_DISEASE──>(Disease)──PRESENTS_WITH──>(Symptom)
    │                         │
    │                         └──<──TREATS──(Drug)
    │
    ├──CURRENTLY_TAKING──>(Drug)
    ├──ALLERGIC_TO──>(Allergen)
    └──HAS_LAB_RESULT──>(LabResult)
```
