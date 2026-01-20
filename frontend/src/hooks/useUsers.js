/**
 * useUsers Hook
 * Fetches doctors and patients from the database
 */
import { useState, useEffect, useCallback } from 'react';
import { getAllDoctors, getDoctorPatients } from '../api';

/**
 * Sanitize data by converting non-serializable objects to strings
 */
function sanitizeData(obj) {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeData);
  }
  
  const sanitized = {};
  for (const key in obj) {
    const value = obj[key];
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Check if it's a Neo4j BigInt object with {low, high}
      if ('low' in value && 'high' in value) {
        // Convert BigInt to a proper number if possible
        const num = (value.high << 32) + value.low;
        sanitized[key] = num;
      } else if (value.toString && value.toString() !== '[object Object]') {
        // Use toString for any object that has a proper toString
        sanitized[key] = value.toString();
      } else {
        // Recursively sanitize nested objects
        sanitized[key] = sanitizeData(value);
      }
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Custom hook for managing doctors and patients data
 * @returns {object} Users state and methods
 */
export function useUsers() {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await getAllDoctors();
        if (response.success) {
          const sanitizedDoctors = sanitizeData(response.doctors);
          setDoctors(sanitizedDoctors);
          // Auto-select first doctor
          if (sanitizedDoctors.length > 0) {
            setSelectedDoctor(sanitizedDoctors[0]);
          }
        } else {
          setError(response.error || 'Failed to fetch doctors');
        }
      } catch (err) {
        setError(`Connection error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch patients when doctor changes
  useEffect(() => {
    const fetchPatients = async () => {
      if (!selectedDoctor) {
        setPatients([]);
        return;
      }

      try {
        const response = await getDoctorPatients(selectedDoctor.id);
        if (response.success) {
          const sanitizedPatients = sanitizeData(response.patients);
          setPatients(sanitizedPatients);
          // Auto-select first patient
          if (sanitizedPatients.length > 0) {
            setSelectedPatient(sanitizedPatients[0]);
          } else {
            setSelectedPatient(null);
          }
        } else {
          setPatients([]);
          setError(response.error || 'Failed to fetch patients');
        }
      } catch (err) {
        setPatients([]);
        setError(`Connection error: ${err.message}`);
      }
    };

    fetchPatients();
  }, [selectedDoctor]);

  /**
   * Change the selected doctor
   * @param {string} doctorId - Doctor ID to select
   */
  const selectDoctor = useCallback((doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctor);
    }
  }, [doctors]);

  /**
   * Change the selected patient
   * @param {string} patientId - Patient ID to select
   */
  const selectPatient = useCallback((patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
    }
  }, [patients]);

  /**
   * Refresh doctors list
   */
  const refreshDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllDoctors();
      if (response.success) {
        setDoctors(response.doctors);
      }
    } catch (err) {
      setError(`Connection error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Data
    doctors,
    patients,
    selectedDoctor,
    selectedPatient,
    // State
    loading,
    error,
    // Actions
    selectDoctor,
    selectPatient,
    refreshDoctors,
    // Setters for direct control
    setSelectedDoctor,
    setSelectedPatient,
  };
}

export default useUsers;
