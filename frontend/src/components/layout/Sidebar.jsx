/**
 * Sidebar Component
 * Main navigation and controls sidebar
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickQueries } from '../chat';
import { StatusIndicator } from '../common';

/**
 * @param {object} props
 * @param {object} props.auth - Authentication state from useAuth hook
 * @param {boolean} props.serverOnline - Server online status
 * @param {function} props.onQuickQuery - Callback for quick query selection
 */
export function Sidebar({ auth, serverOnline, onQuickQuery }) {
  const navigate = useNavigate();
  const { role, userId, patientId, setRole, setUserId, setPatientId } = auth;

  const handleRoleChange = (e) => {
    setRole(e.target.value);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo">
        <span className="logo-icon">🏥</span>
        <h1>Med-Chat</h1>
      </div>

      {/* Authentication Section */}
      <div className="sidebar-section">
        <h3>Authentication</h3>
        
        <div className="form-group">
          <label htmlFor="role">I am a</label>
          <select 
            id="role" 
            value={role} 
            onChange={handleRoleChange}
          >
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="userId">My ID</label>
          <input 
            type="text" 
            id="userId" 
            placeholder={role === 'doctor' ? 'e.g., D001' : 'e.g., P001'}
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        {role === 'doctor' && (
          <div className="form-group">
            <label htmlFor="patientId">Query Patient</label>
            <select 
              id="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="P001">P001 - John Doe</option>
              <option value="P002">P002 - Jane Smith</option>
              <option value="P003">P003 - Robert Johnson</option>
            </select>
          </div>
        )}
      </div>

      {/* Quick Queries Section */}
      <div className="sidebar-section">
        <h3>Quick Queries</h3>
        <QuickQueries onQuerySelect={onQuickQuery} />
      </div>

      {/* Graph Visualization */}
      <div className="sidebar-section">
        <h3>Graph Visualization</h3>
        <button 
          className="visualize-btn"
          onClick={() => navigate('/visualize')}
        >
          🕸️ Visualize Neo4j Graph
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
