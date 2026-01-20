/**
 * Application Constants
 * Note: Doctors and patients are now fetched from the database
 */

// User roles
export const ROLES = {
  DOCTOR: 'doctor',
  PATIENT: 'patient',
};

// Query types for quick actions
export const QUERY_TYPES = {
  DISEASES: 'diseases',
  MEDICATIONS: 'medications',
  SYMPTOMS: 'symptoms',
  LAB_RESULTS: 'lab_results',
  ALLERGIES: 'allergies',
  PROFILE: 'profile',
};

// Node colors for graph visualization
export const NODE_COLORS = {
  Patient: '#4a9eff',
  Disease: '#ff6b6b',
  Drug: '#51cf66',
  Symptom: '#ffd43b',
  Allergen: '#ff922b',
  LabResult: '#845ef7',
  Doctor: '#20c997',
};

// Edge colors for graph visualization
export const EDGE_COLORS = {
  HAS_DISEASE: '#ff6b6b',
  CURRENTLY_TAKING: '#51cf66',
  TREATS: '#69db7c',
  PRESENTS_WITH: '#ffd43b',
  ALLERGIC_TO: '#ff922b',
  HAS_LAB_RESULT: '#845ef7',
  PRESCRIBED_BY: '#20c997',
  CAUSES: '#f783ac',
  INTERACTS_WITH: '#ff8787',
  default: '#868e96',
};
