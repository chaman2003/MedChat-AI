/**
 * useAuth Hook
 * Manages user authentication state (role, IDs)
 */
import { useState, useCallback } from 'react';

/**
 * Custom hook for authentication state management
 * @returns {object} Auth state and handlers
 */
export function useAuth() {
  const [role, setRole] = useState('doctor');
  const [userId, setUserId] = useState('D001');
  const [patientId, setPatientId] = useState('P001');

  /**
   * Handle role change - also updates default userId
   * @param {string} newRole - 'doctor' or 'patient'
   */
  const handleRoleChange = useCallback((newRole) => {
    setRole(newRole);
    setUserId(newRole === 'doctor' ? 'D001' : 'P001');
  }, []);

  /**
   * Get the effective patient ID based on role
   * @returns {string} Patient ID to use in queries
   */
  const getEffectivePatientId = useCallback(() => {
    return role === 'doctor' ? patientId : userId;
  }, [role, patientId, userId]);

  return {
    role,
    userId,
    patientId,
    setRole: handleRoleChange,
    setUserId,
    setPatientId,
    getEffectivePatientId,
  };
}

export default useAuth;
