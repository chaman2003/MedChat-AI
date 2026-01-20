/**
 * API Configuration
 * Central configuration for all API calls
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * API request helper with error handling
 * @param {string} endpoint - API endpoint (e.g., '/chat')
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    // Re-throw with more context
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. Please ensure the backend is running.');
    }
    throw error;
  }
}

export default {
  API_BASE_URL,
  apiRequest,
};
