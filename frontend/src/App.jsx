import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LLMParser } from './utils/LLMParser';

const API_URL = "http://localhost:3001";

const INITIAL_MESSAGE = {
  type: 'assistant',
  content: `# Welcome to Med-Chat

I'm your intelligent medical assistant powered by **Neo4j Knowledge Graph** and **Groq LLM**.

## Getting Started

Try any of these queries:
- "What diseases does P001 have?"
- "Show me patient P002's medications"
- "What are P003's lab results?"
- "List allergies for P001"

Use the quick buttons below or type your custom questions directly.`
};

export default function App() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);
  
  // Auth state
  const [role, setRole] = useState('doctor');
  const [userId, setUserId] = useState('D001');
  const [patientId, setPatientId] = useState('P001');

  // Initialize dark mode from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    setDarkMode(isDark);
    if (isDark) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Check server status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        setServerOnline(response.ok);
      } catch {
        setServerOnline(false);
      }
    };
    
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Toggle dark mode
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-mode');
  };

  // Handle role change
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setRole(newRole);
    setUserId(newRole === 'doctor' ? 'D001' : 'P001');
  };

  // Send message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage
    }]);

    setLoading(true);

    try {
      const patientIdToUse = role === 'doctor' ? patientId : userId;
      
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMessage,
          role,
          user_id: userId,
          patient_id: patientIdToUse
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          type: 'assistant',
          content: data.answer,
          metadata: {
            source: data.source,
            queryType: data.query_type,
            patientId: data.patient_id,
            records: data.records_retrieved
          }
        }]);
      } else {
        setMessages(prev => [...prev, {
          type: 'error',
          content: data.error || 'An error occurred'
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Connection error: ${error.message}`
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Quick query helper
  const quickQuery = (queryType) => {
    const patientIdToUse = role === 'doctor' ? patientId : userId;
    const queries = {
      diseases: `What diseases does ${patientIdToUse} have?`,
      medications: `What medications is ${patientIdToUse} currently taking?`,
      symptoms: `What symptoms does ${patientIdToUse} have?`,
      lab_results: `Show me ${patientIdToUse}'s lab results`,
      allergies: `What allergies does ${patientIdToUse} have?`,
      profile: `Show me ${patientIdToUse}'s profile information`
    };
    setInput(queries[queryType]);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">🏥</span>
          <h1>Med-Chat</h1>
        </div>

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

        <div className="sidebar-section">
          <h3>Quick Queries</h3>
          <div className="quick-queries">
            <button onClick={() => quickQuery('diseases')}>🦠 Diseases</button>
            <button onClick={() => quickQuery('medications')}>💊 Medications</button>
            <button onClick={() => quickQuery('symptoms')}>🤒 Symptoms</button>
            <button onClick={() => quickQuery('lab_results')}>🧪 Lab Results</button>
            <button onClick={() => quickQuery('allergies')}>⚠️ Allergies</button>
            <button onClick={() => quickQuery('profile')}>👤 Profile</button>
          </div>
        </div>

        <div className="sidebar-section">
          <h3>Graph Visualization</h3>
          <button 
            className="visualize-btn"
            onClick={() => navigate('/visualize')}
          >
            🕸️ Visualize Neo4j Graph
          </button>
        </div>

        <div className="sidebar-section status">
          <h3>System Status</h3>
          <div className="status-item">
            <p className={`status-dot ${serverOnline ? 'online' : ''}`}></p>
            <span>Backend API</span>
          </div>
          <div className="status-item">
            <p className="status-dot neo4j"></p>
            <span>Neo4j Graph DB</span>
          </div>
          <div className="status-item">
            <p className="status-dot groq"></p>
            <span>Groq LLM</span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="chat-container">
        <header className="chat-header">
          <div className="header-left">
            <h2>Medical Assistant</h2>
            <p>Powered by Neo4j Knowledge Graph + Groq LLM</p>
          </div>
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            title="Toggle dark/light mode"
          >
            {darkMode ? (
              <svg className="moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg className="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>
        </header>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <MessageComponent key={idx} message={msg} />
          ))}
          {loading && <LoadingMessage />}
        </div>

        <form className="chat-input" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask about patient medical records (e.g., What is P001's diagnosis?)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            <span>Send</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
            </svg>
          </button>
        </form>
      </main>
    </div>
  );
}

function MessageComponent({ message }) {
  const isParsed = message.type === 'assistant';
  const content = isParsed 
    ? <div dangerouslySetInnerHTML={{ __html: LLMParser.parse(message.content) }} />
    : <p>{message.content}</p>;

  return (
    <div className={`message ${message.type}`}>
      <div className="message-content">
        {content}
        {message.metadata && (
          <div className="message-meta">
            <span>📊 Source: {message.metadata.source}</span>
            <span>🔍 Query: {message.metadata.queryType}</span>
            <span>👤 Patient: {message.metadata.patientId}</span>
            {message.metadata.records && <span>📄 Records: {message.metadata.records}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="message assistant">
      <div className="message-content">
        <div className="loading">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
