/**
 * useServerStatus Hook
 * Monitors backend server health
 */
import { useState, useEffect, useCallback } from 'react';
import { checkServerHealth, getServerStatus } from '../api';

/**
 * Custom hook for monitoring server status
 * @param {number} pollInterval - Polling interval in ms (default: 10000)
 * @returns {object} Server status state
 */
export function useServerStatus(pollInterval = 10000) {
  const [online, setOnline] = useState(false);
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  /**
   * Check server status
   */
  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const isOnline = await checkServerHealth();
      setOnline(isOnline);
      
      if (isOnline) {
        const fullStatus = await getServerStatus();
        setStatus(fullStatus);
      } else {
        setStatus(null);
      }
    } catch (error) {
      setOnline(false);
      setStatus({ error: error.message });
    } finally {
      setChecking(false);
    }
  }, []);

  // Initial check and polling
  useEffect(() => {
    checkStatus();
    
    const interval = setInterval(checkStatus, pollInterval);
    return () => clearInterval(interval);
  }, [checkStatus, pollInterval]);

  return {
    online,
    status,
    checking,
    refresh: checkStatus,
  };
}

export default useServerStatus;
