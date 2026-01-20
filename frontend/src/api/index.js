/**
 * API Index
 * Central export for all API modules
 */
export { API_BASE_URL, apiRequest } from './config';
export { sendChatMessage, getChatHistory } from './chat.api';
export { getGraphData, getGraphStats } from './graph.api';
export { checkServerHealth, getServerStatus } from './health.api';

// Re-export as named modules
export { default as chatApi } from './chat.api';
export { default as graphApi } from './graph.api';
export { default as healthApi } from './health.api';
