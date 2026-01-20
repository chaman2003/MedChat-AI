/**
 * ChatHeader Component
 * Header for the main chat area
 */
import React from 'react';
import { ThemeToggle } from '../common';

/**
 * @param {object} props
 * @param {boolean} props.darkMode - Current dark mode state
 * @param {function} props.onToggleTheme - Theme toggle callback
 */
export function ChatHeader({ darkMode, onToggleTheme }) {
  return (
    <header className="chat-header">
      <div className="header-left">
        <h2>Medical Assistant</h2>
        <p>Powered by Neo4j Knowledge Graph + Groq LLM</p>
      </div>
      <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
    </header>
  );
}

export default ChatHeader;
