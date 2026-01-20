/**
 * ChatHeader Component
 * Header for the main chat area - shows current doctor/patient context
 */
import React from 'react';
import { ThemeToggle, StatusIndicator } from '../common';

/**
 * @param {object} props
 * @param {boolean} props.darkMode - Current dark mode state
 * @param {function} props.onToggleTheme - Theme toggle callback
 * @param {object} props.selectedDoctor - Currently selected doctor
 * @param {object} props.selectedPatient - Currently selected patient
 * @param {boolean} props.serverOnline - Server online status
 */
export function ChatHeader({ darkMode, onToggleTheme, selectedDoctor, selectedPatient, serverOnline }) {
  return (
    <header className="chat-header">
      <div className="header-left">
        <h2>Medical Assistant</h2>
        <p>
          {selectedDoctor && selectedPatient ? (
            <>
              <span className="context-badge doctor">👨‍⚕️ {selectedDoctor.name}</span>
              <span className="context-separator">→</span>
              <span className="context-badge patient">👤 {selectedPatient.name}</span>
            </>
          ) : (
            'Powered by Neo4j Knowledge Graph + Groq LLM'
          )}
        </p>
      </div>
      <div className="header-right" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px' }}>
          <StatusIndicator label="API" online={serverOnline} />
          <StatusIndicator label="DB" online={serverOnline} className="neo4j" />
          <StatusIndicator label="LLM" online={serverOnline} className="groq" />
        </div>
        <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
      </div>
    </header>
  );
}

export default ChatHeader;
