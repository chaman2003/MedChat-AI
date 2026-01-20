/**
 * Graph API
 * Handles all graph visualization API calls
 */
import { apiRequest, API_BASE_URL } from './config';

/**
 * Fetch all nodes and edges from Neo4j for visualization
 * @returns {Promise<{nodes: array, links: array}>} Graph data
 */
export async function getGraphData() {
  const response = await fetch(`${API_BASE_URL}/api/graph`);
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
