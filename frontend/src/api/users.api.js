/**
 * Users API
 * API calls for doctors and patients
 */
import { apiRequest } from './config';

/**
 * Fetch all doctors
 */
export async function getAllDoctors() {
  return apiRequest('/api/users/doctors');
}

/**
 * Fetch a specific doctor by ID
 */
export async function getDoctorById(doctorId) {
  return apiRequest(`/api/users/doctors/${doctorId}`);
}

/**
 * Fetch patients for a specific doctor
 */
export async function getDoctorPatients(doctorId) {
  return apiRequest(`/api/users/doctors/${doctorId}/patients`);
}

/**
 * Fetch all patients
 */
export async function getAllPatients() {
  return apiRequest('/api/users/patients');
}

/**
 * Fetch a specific patient by ID
 */
export async function getPatientById(patientId) {
  return apiRequest(`/api/users/patients/${patientId}`);
}
