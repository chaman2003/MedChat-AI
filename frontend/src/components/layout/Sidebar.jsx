/**
 * Sidebar Component
 * Main navigation and controls sidebar with dynamic doctor/patient selection
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickQueries } from '../chat';
import { StatusIndicator } from '../common';

/**
 * @param {object} props
 * @param {object} props.users - Users state from useUsers hook
 * @param {boolean} props.serverOnline - Server online status
 * @param {function} props.onQuickQuery - Callback for quick query selection
 */
export function Sidebar({ users, serverOnline, onQuickQuery }) {
  const navigate = useNavigate();
  const { 
    doctors, 
    patients, 
    selectedDoctor, 
    selectedPatient, 
    selectDoctor, 
    selectPatient,
    loading 
  } = users;

  const handleDoctorChange = (e) => {
    selectDoctor(e.target.value);
  };

  const handlePatientChange = (e) => {
    selectPatient(e.target.value);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo">
        <span className="logo-icon">🏥</span>
        <h1>Med-Chat</h1>
      </div>

      {/* Doctor Selection */}
      <div className="sidebar-section">
        <h3>👨‍⚕️ Select Doctor</h3>
        
        <div className="form-group">
          <label htmlFor="doctorId">Doctor</label>
          <select 
            id="doctorId" 
            value={selectedDoctor?.id || ''} 
            onChange={handleDoctorChange}
            disabled={loading || doctors.length === 0}
          >
            {loading ? (
              <option>Loading...</option>
            ) : doctors.length === 0 ? (
              <option>No doctors available</option>
            ) : (
              doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialty}
                </option>
              ))
            )}
          </select>
        </div>

        {selectedDoctor && (
          <div className="doctor-info">
            <small>📧 {selectedDoctor.email}</small>
          </div>
        )}
      </div>

      {/* Patient Selection */}
      <div className="sidebar-section">
        <h3>👤 Select Patient</h3>
        
        <div className="form-group">
          <label htmlFor="patientId">Patient ({patients.length} patients)</label>
          <select 
            id="patientId"
            value={selectedPatient?.id || ''}
            onChange={handlePatientChange}
            disabled={loading || patients.length === 0}
          >
            {loading ? (
              <option>Loading...</option>
            ) : patients.length === 0 ? (
              <option>No patients for this doctor</option>
            ) : (
              patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.id} - {patient.name}
                </option>
              ))
            )}
          </select>
        </div>

        {selectedPatient && (
          <div className="patient-info">
            <small>Age: {selectedPatient.age} | {selectedPatient.gender} | {selectedPatient.blood_type}</small>
          </div>
        )}
      </div>

      {/* Quick Queries Section */}
      <div className="sidebar-section">
        <h3>Quick Queries</h3>
        <QuickQueries onQuerySelect={onQuickQuery} disabled={!selectedPatient} />
      </div>

      {/* Graph Visualization */}
      <div className="sidebar-section">
        <h3>Graph Visualization</h3>
        <button 
          className="visualize-btn"
          onClick={() => navigate('/visualize', { 
            state: { 
              doctorId: selectedDoctor?.id,
              patientId: selectedPatient?.id 
            } 
          })}
        >
          🕸️ Visualize Graph
        </button>
      </div>

      {/* System Status */}
      <div className="sidebar-section status">
        <h3>System Status</h3>
        <StatusIndicator label="Backend API" online={serverOnline} />
        <StatusIndicator label="Neo4j Graph DB" online={serverOnline} className="neo4j" />
        <StatusIndicator label="Groq LLM" online={serverOnline} className="groq" />
      </div>
    </aside>
  );
}

export default Sidebar;
