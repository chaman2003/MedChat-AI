# Backend - Independent Full Stack

## Setup
```bash
cd backend
npm install
```

## Run
```bash
npm start
# Runs on http://localhost:3001
```

## Seed Data
```bash
npm run seed
```

## API Endpoints

### POST /chat
Query patient medical data
```json
{
  "question": "What diseases does P001 have?",
  "role": "doctor",
  "user_id": "D001",
  "patient_id": "P001"
}
```

### GET /health
Health check endpoint
