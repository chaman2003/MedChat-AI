/**
 * Health API
 * Handles server health checks
 */
import { API_BASE_URL } from './config';

/**
 * Check if the backend server is online
 * @returns {Promise<boolean>} True if server is online
 */
export async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get detailed server status
 * @returns {Promise<object>} Server status details
 */
export async function getServerStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (!response.ok) {
      return { online: false, error: `HTTP ${response.status}` };
    }
    const data = await response.json();
    return { online: true, ...data };
  } catch (error) {
    return { online: false, error: error.message };
  }
}

export default {
  checkServerHealth,
  getServerStatus,
};
