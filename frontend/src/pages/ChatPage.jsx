/**
 * ChatPage
 * Main chat page component - refactored to use hooks and modular components
 */
import React, { useState } from 'react';
import { Sidebar, ChatHeader } from '../components/layout';
import { ChatMessage, ChatInput, LoadingMessage } from '../components/chat';
import { useChat, useTheme, useServerStatus, useAuth } from '../hooks';

export default function ChatPage() {
  // Custom hooks
  const { messages, loading, sendMessage, getQuickQuery } = useChat();
  const { darkMode, toggleTheme } = useTheme();
  const { online: serverOnline } = useServerStatus();
  const auth = useAuth();

  // Local input state for quick queries
  const [inputValue, setInputValue] = useState('');

  /**
   * Handle quick query selection
   */
  const handleQuickQuery = (queryType) => {
    const patientId = auth.getEffectivePatientId();
    const query = getQuickQuery(queryType, patientId);
    setInputValue(query);
  };

  /**
   * Handle message submission
   */
  const handleSubmit = (message) => {
    sendMessage(message, {
      role: auth.role,
      userId: auth.userId,
      patientId: auth.patientId,
    });
    setInputValue('');
  };

  return (
    <div className="app-container">
      {/* Sidebar with auth controls and quick queries */}
      <Sidebar 
        auth={auth}
        serverOnline={serverOnline}
        onQuickQuery={handleQuickQuery}
      />

      {/* Main Chat Area */}
      <main className="chat-container">
        <ChatHeader 
          darkMode={darkMode} 
          onToggleTheme={toggleTheme} 
        />

        {/* Messages List */}
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          {loading && <LoadingMessage />}
        </div>

        {/* Input Form */}
        <ChatInputWithValue 
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          disabled={loading}
          placeholder="Ask about patient medical records (e.g., What is P001's diagnosis?)"
        />
      </main>
    </div>
  );
}

/**
 * Extended ChatInput with controlled value
 * (Allows setting value from quick queries)
 */
function ChatInputWithValue({ value, onChange, onSubmit, disabled, placeholder }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        <span>Send</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
        </svg>
      </button>
    </form>
  );
}
