/**
 * ChatHeader Component
 * Header for the main chat area - shows current doctor/patient context
 */
import React from 'react';
import { ThemeToggle } from '../common';

/**
 * @param {object} props
 * @param {boolean} props.darkMode - Current dark mode state
 * @param {function} props.onToggleTheme - Theme toggle callback
 * @param {object} props.selectedDoctor - Currently selected doctor
 * @param {object} props.selectedPatient - Currently selected patient
 */
export function ChatHeader({ darkMode, onToggleTheme, selectedDoctor, selectedPatient }) {
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
      <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
    </header>
  );
}

export default ChatHeader;
