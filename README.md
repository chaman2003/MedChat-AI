# Med-Chat: Hybrid Medical Knowledge Graph with Vector Search

🏥 **RAG-based Medical Chat Assistant** leveraging Neo4j Knowledge Graph + Supabase pgvector for semantic search, powered by Groq LLM and HuggingFace embeddings.

**Built for CEO presentation demonstrating:**
- ✅ Neo4j Graph Database integration with hybrid search
- ✅ Supabase pgvector for semantic vector embeddings
- ✅ Free HuggingFace embeddings (all-MiniLM-L6-v2)
- ✅ Groq LLM for fast responses
- ✅ Interactive Neo4j graph visualization
- ✅ Toggle-based embeddings feature control
- ✅ Production-ready deployment on Render

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                      │
│              Port 5000 - Chat & Graph Visualization             │
│  - Chat Interface (RAG QA)                                      │
│  - Neo4j Graph Visualization (interactive force graph)          │
│  - Dark/Light Theme                                             │
└────────────────────────────┬──────────────────────────────────┘
                             │ REST API (JSON)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                        │
│                    Port 3001 - Hybrid Engine                    │
├──────────────────────────────────────────────────────────────────┤
│ 🧠 RAG Pipeline                                                 │
│  ├─ User Question                                               │
│  ├─ Neo4j Graph Query (Cypher)                                  │
│  ├─ Semantic Vector Search (if enabled)                         │
│  ├─ Context Enrichment                                          │
│  └─ Groq LLM Response Generation                                │
└─────┬────────────────────────────┬─────────────────────┬────────┘
      │                            │                     │
      ↓                            ↓                     ↓
  ┌─────────────┐        ┌──────────────────┐    ┌──────────────┐
  │  Neo4j DB   │        │  Supabase        │    │  Groq API    │
  │  (Graph)    │        │  pgvector        │    │  (LLM)       │
  │  Medical    │        │  (Semantic)      │    │              │
  │  Knowledge  │        │  Embeddings      │    │              │
  └─────────────┘        └──────────────────┘    └──────────────┘
                                │
                                ↓
                    ┌──────────────────────┐
                    │  HuggingFace API     │
                    │  (Free Embeddings)   │
                    │  all-MiniLM-L6-v2    │
                    └──────────────────────┘
```

## 📊 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite + React Router | Chat UI + Graph Visualization |
| **Graph Rendering** | react-force-graph-2d | Interactive 2D force-directed graph |
| **Backend API** | Node.js + Express | REST endpoints & RAG engine |
| **Graph DB** | Neo4j 5.14 | Medical knowledge graph |
| **Vector DB** | Supabase PostgreSQL + pgvector | Semantic search embeddings |
| **LLM** | Groq (openai/gpt-oss-120b) | Fast response generation |
| **Embeddings** | HuggingFace (all-MiniLM-L6-v2) | Free semantic embeddings (384-dim) |
| **Styling** | CSS3 + CSS Variables | Dark/Light themes |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Neo4j cloud/local instance running
- Supabase PostgreSQL instance (pgvector pre-enabled)
- Groq API key
- HuggingFace API token (free tier)

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
npm run dev
# Runs on http://localhost:5000
```

Visit **http://localhost:5000** in your browser

## 🔑 Environment Configuration

Create `backend/.env`:
```env
# Neo4j
NEO4J_URI=neo4j+s://your-instance-uri.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# Supabase (PostgreSQL with pgvector)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_DB_URL=postgres://user:password@db.your-project.supabase.co:5432/postgres

# Groq LLM
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-120b

# HuggingFace (Free embeddings)
HUGGINGFACE_API_KEY=your-hf-api-token

# Feature Toggle
ENABLE_EMBEDDINGS=yes  # Set to 'no' to disable vector search
```

## 📚 Database Schema

### Neo4j Medical Knowledge Graph
```
Nodes:
├─ Patient (patient_id, name, age, gender, blood_type, email, phone)
├─ Disease (disease_id, name, icd_code, description)
├─ Drug (drug_id, name, category, dosage, frequency)
├─ Symptom (symptom_id, name, severity)
├─ Allergen (allergen_id, name, reaction, severity)
└─ LabResult (lab_id, test_name, value, unit, date, status)

Relationships:
├─ Patient -[HAS_DISEASE]-> Disease
├─ Disease -[PRESENTS_WITH]-> Symptom
├─ Disease -[TREATED_BY]-> Drug
├─ Drug -[TREATS]-> Disease
├─ Patient -[CURRENTLY_TAKING]-> Drug
├─ Patient -[ALLERGIC_TO]-> Allergen
├─ Patient -[HAS_LAB_RESULT]-> LabResult
└─ Drug -[INTERACTS_WITH]-> Drug
```

### Supabase Vector Table
```sql
CREATE TABLE IF NOT EXISTS embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(384),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

## 🔌 API Endpoints

### Core Chat Endpoint
```http
POST /chat
Content-Type: application/json

{
  "question": "What diseases does P001 have?",
  "role": "doctor",
  "user_id": "D001",
  "patient_id": "P001"
}

Response:
{
  "success": true,
  "answer": "Patient P001 (John Doe) has...",
  "source": "neo4j",
  "query_type": "patient_diseases",
  "patient_id": "P001",
  "records_retrieved": 2
}
```

### Semantic Vector Search
```http
POST /search
Content-Type: application/json

{
  "query": "medications for diabetes",
  "type": "drug",
  "limit": 5
}

Response (if ENABLE_EMBEDDINGS=yes):
{
  "success": true,
  "query": "medications for diabetes",
  "type": "drug",
  "results": [...],
  "count": 5
}
```

### Graph Visualization Data
```http
GET /graph

Response:
{
  "success": true,
  "graph": {
    "nodes": [...],      // 33 nodes (patients, diseases, drugs, etc)
    "links": [...]       // 41 relationships with types
  },
  "nodeTypes": {
    "Patient": 3,
    "Disease": 5,
    "Drug": 7,
    "Symptom": 8,
    "Allergen": 4,
    "LabResult": 6
  },
  "stats": {
    "totalNodes": 33,
    "totalEdges": 41
  }
}
```

### Health Status
```http
GET /health

Response:
{
  "status": "ok",
  "timestamp": "2026-01-21T...",
  "llm_provider": "groq",
  "database": "neo4j",
  "embeddings_enabled": true,
  "vector_db": "supabase",
  "embedding_cache": {...}
}
```

## 💾 Database Seeding

```bash
# Seed Neo4j with medical data (patients, diseases, drugs, etc)
cd backend && npm run seed

# Seed Supabase with vector embeddings (27 embeddings)
cd backend && npm run seed:vectors
```

Sample data loaded:
- 3 Patients (P001-P003)
- 5 Diseases with ICD codes
- 7 Medications with dosages
- 8 Symptoms with severity
- 4 Allergens with reactions
- 6 Lab results with dates

## 🎨 Frontend Features

### 💬 Chat Interface
- Real-time Q&A about patient medical records
- Role-based access (Doctor/Patient)
- Patient selection for doctors
- Quick query buttons (Diseases, Medications, Lab Results, etc)
- Dark/Light theme toggle
- Server status indicator
- Message history with metadata

### 🕸️ Graph Visualization Page (`/visualize`)
- **Interactive Force-Directed Graph**
  - Drag nodes to reposition
  - Scroll to zoom in/out
  - Click and drag to pan
  - Auto-fit to view (press F)
  - Keyboard shortcuts (+/- to zoom)

- **Node Filters**
  - Toggle visibility by type (Patient, Disease, Drug, Symptom, etc)
  - Live count of each node type
  - Color-coded by category

- **Relationship Legend**
  - HAS_DISEASE (red)
  - CURRENTLY_TAKING (green)
  - TREATS (light green)
  - PRESENTS_WITH (yellow)
  - ALLERGIC_TO (orange)
  - HAS_LAB_RESULT (purple)
  - And more...

- **Node Details Panel**
  - Click any node to see properties
  - Shows all metadata
  - Connection count
  - Auto-zoom on selection

## 🔧 Feature Toggle: Enable/Disable Embeddings

Control vector search via environment variable:

```env
ENABLE_EMBEDDINGS=yes   # Enables Supabase pgvector + HuggingFace embeddings
ENABLE_EMBEDDINGS=no    # Uses only Neo4j graph queries (faster)
```

**When enabled:**
- `/search` endpoint performs semantic vector search
- `/treatments` endpoint uses embedding similarity
- Chat enriches context with vector results
- Higher quality responses

**When disabled:**
- `/search` returns error
- `/treatments` returns error
- Chat uses only graph data
- Faster inference, no API costs

## 📈 Performance & Optimization

| Metric | Value |
|--------|-------|
| **Graph Nodes** | 33 |
| **Graph Edges** | 41 |
| **Vector Dimensions** | 384 |
| **Embedding Cache** | ~100 vectors |
| **LLM Model** | Groq 120B parameters |
| **LLM Latency** | < 1s per response |
| **Vector Search Latency** | < 100ms |
| **Graph Query Latency** | < 500ms |

## 🚢 Deployment

### Render.com (Recommended for Free Tier)

**Backend Deployment:**
1. Connect GitHub repo to Render
2. Create Web Service (Node.js)
3. Set environment variables
4. Deploy from `backend/` directory
5. Runs on free dyno (0.5 CPU, 512MB RAM)

**Frontend Deployment:**
1. Build: `npm run build` (creates `dist/`)
2. Deploy to Vercel, Netlify, or Render Static Site
3. Update API_URL to production backend URL

## 🎯 Use Cases

1. **Clinical Decision Support** - Query patient history instantly
2. **Drug Interaction Checking** - Find potential medication conflicts
3. **Treatment Recommendations** - Suggest therapies based on symptoms
4. **Patient Education** - Explain diseases in plain language
5. **Data Exploration** - Visualize complex patient relationships

## 📊 Graph Statistics

```
Total Nodes: 33
├─ Patients: 3
├─ Diseases: 5
├─ Drugs: 7
├─ Symptoms: 8
├─ Allergens: 4
└─ Lab Results: 6

Total Relationships: 41
├─ HAS_DISEASE: 6
├─ CURRENTLY_TAKING: 10
├─ TREATS: 7
├─ PRESENTS_WITH: 8
├─ ALLERGIC_TO: 4
└─ HAS_LAB_RESULT: 6
```

## 🔐 Security

- Environment variables for sensitive credentials
- Role-based access control (Doctor/Patient)
- Patient ID isolation in queries
- Input validation on all endpoints
- CORS enabled for cross-origin requests
- No sensitive data logged

## 📝 Example Queries

```
"What diseases does P001 have?"
"Show me P002's medications"
"What are P003's lab results?"
"List all allergies for P001"
"What symptoms does Type 2 Diabetes cause?"
"Which drugs treat Hypertension?"
"Show me P001's profile information"
"What are the drug interactions for P003?"
```

## 🛠️ Development

### Backend File Structure
```
backend/
├─ src/
│  ├─ server.js              (Express app & endpoints)
│  ├─ neo4j-driver.js        (Neo4j connection)
│  ├─ chat.js                (RAG pipeline)
│  ├─ graph-queries.js       (Cypher queries)
│  ├─ supabase-driver.js     (Vector DB connection)
│  ├─ embedding-service.js   (HuggingFace integration)
│  ├─ vector-search.js       (Hybrid search logic)
│  ├─ seed-neo4j.js          (Data seeding)
│  └─ seed-vectors.js        (Embedding seeding)
├─ .env                       (Configuration)
└─ package.json
```

### Frontend File Structure
```
frontend/
├─ src/
│  ├─ App.jsx                (Main chat interface)
│  ├─ main.jsx               (React Router setup)
│  ├─ index.css              (Global styles)
│  ├─ components/
│  │  └─ GraphVisualization.jsx  (Graph viz page)
│  └─ utils/
│     └─ LLMParser.js        (Markdown rendering)
├─ vite.config.js
└─ package.json
```

## 🐛 Troubleshooting

**Graph not loading?**
- Check `/health` endpoint
- Verify Neo4j connection
- Check firewall rules

**Embeddings disabled?**
- Check `.env` file: `ENABLE_EMBEDDINGS=yes`
- Verify Supabase credentials
- Check HuggingFace API key

**LLM slow response?**
- Default is Groq free tier (limited RPS)
- Check network connectivity
- Verify API key validity

## 📄 License

MIT - Open source for educational purposes

## 👥 Contributors

Built for CEO presentation demonstrating production-ready medical AI architecture.

**Key Features Implemented:**
- ✅ Hybrid Neo4j + pgvector search
- ✅ Free HuggingFace embeddings
- ✅ Interactive graph visualization  
- ✅ Feature toggles (embeddings on/off)
- ✅ RAG pipeline with Groq LLM
- ✅ Dark/Light themes
- ✅ Responsive design
- ✅ Production deployment ready

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
