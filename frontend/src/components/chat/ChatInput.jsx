/**
 * ChatInput Component
 * Input form for sending chat messages
 */
import React, { useState } from 'react';

/**
 * @param {object} props
 * @param {function} props.onSubmit - Callback when message is submitted
 * @param {boolean} props.disabled - Whether input is disabled
 * @param {string} props.placeholder - Placeholder text
 */
export function ChatInput({ onSubmit, disabled = false, placeholder }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    
    onSubmit(input.trim());
    setInput('');
  };

  return (
    <form className="chat-input" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={placeholder || "Ask about patient medical records..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !input.trim()}>
        <span>Send</span>
        <SendIcon />
      </button>
    </form>
  );
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"/>
    </svg>
  );
}

export default ChatInput;
