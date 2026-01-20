/**
 * Graph API
 * Handles all graph visualization API calls
 */
import { apiRequest, API_BASE_URL } from './config';

/**
 * Fetch graph data from Neo4j for visualization
 * @param {object} options - Filter options
 * @param {string} options.doctorId - Filter by doctor's patients
 * @param {string} options.patientId - Filter by specific patient
 * @returns {Promise<{nodes: array, links: array}>} Graph data
 */
export async function getGraphData(options = {}) {
  const params = new URLSearchParams();
  
  if (options.doctorId) {
    params.append('doctorId', options.doctorId);
  }
  if (options.patientId) {
    params.append('patientId', options.patientId);
  }
  
  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/graph${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch graph data: ${response.status}`);
  }
  return response.json();
}

/**
 * Get graph statistics
 * @returns {Promise<object>} Statistics about nodes and relationships
 */
export async function getGraphStats() {
  return apiRequest('/api/graph/stats');
}

export default {
  getGraphData,
  getGraphStats,
};
