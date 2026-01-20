/**
 * useChat Hook
 * Manages chat state and message handling
 */
import { useState, useCallback } from 'react';
import { sendChatMessage } from '../api';

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

/**
 * Custom hook for chat functionality
 * @returns {object} Chat state and handlers
 */
export function useChat() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Send a message to the chat API
   * @param {string} question - User's question
   * @param {object} context - Role and ID context
   */
  const sendMessage = useCallback(async (question, { role, userId, patientId }) => {
    if (!question.trim()) return;

    // Add user message immediately
    setMessages(prev => [...prev, {
      type: 'user',
      content: question.trim()
    }]);

    setLoading(true);
    setError(null);

    try {
      const data = await sendChatMessage({
        question: question.trim(),
        role,
        userId,
        patientId: role === 'doctor' ? patientId : userId,
      });

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
    } catch (err) {
      setError(err.message);
      setMessages(prev => [...prev, {
        type: 'error',
        content: `Connection error: ${err.message}`
      }]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear all messages and reset to initial state
   */
  const clearMessages = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setError(null);
  }, []);

  /**
   * Generate a quick query string
   * @param {string} queryType - Type of query
   * @param {string} patientId - Patient ID
   * @returns {string} Query string
   */
  const getQuickQuery = useCallback((queryType, patientId) => {
    const queries = {
      diseases: `What diseases does ${patientId} have?`,
      medications: `What medications is ${patientId} currently taking?`,
      symptoms: `What symptoms does ${patientId} have?`,
      lab_results: `Show me ${patientId}'s lab results`,
      allergies: `What allergies does ${patientId} have?`,
      profile: `Show me ${patientId}'s profile information`
    };
    return queries[queryType] || '';
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages,
    getQuickQuery,
  };
}

export default useChat;
