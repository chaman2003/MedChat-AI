/**
 * useTheme Hook
 * Manages dark/light theme state
 */
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for theme management
 * @returns {object} Theme state and toggle function
 */
export function useTheme() {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  /**
   * Toggle between dark and light mode
   */
  const toggleTheme = useCallback(() => {
    setDarkMode(prev => {
      const newDarkMode = !prev;
      localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
      document.body.classList.toggle('dark-mode', newDarkMode);
      return newDarkMode;
    });
  }, []);

  /**
   * Set specific theme
   * @param {boolean} isDark - True for dark mode
   */
  const setTheme = useCallback((isDark) => {
    setDarkMode(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode', isDark);
  }, []);

  return {
    darkMode,
    toggleTheme,
    setTheme,
  };
}

export default useTheme;
