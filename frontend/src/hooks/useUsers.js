/**
 * useUsers Hook
 * Fetches doctors and patients from the database
 */
import { useState, useEffect, useCallback } from 'react';
import { getAllDoctors, getDoctorPatients } from '../api';

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
          setDoctors(response.doctors);
          // Auto-select first doctor
          if (response.doctors.length > 0) {
            setSelectedDoctor(response.doctors[0]);
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
          setPatients(response.patients);
          // Auto-select first patient
          if (response.patients.length > 0) {
            setSelectedPatient(response.patients[0]);
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
