/**
 * LoadingMessage Component
 * Animated loading indicator for chat
 */
import React from 'react';

export function LoadingMessage() {
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

export default LoadingMessage;
