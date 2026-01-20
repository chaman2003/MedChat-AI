/**
 * StatusIndicator Component
 * Shows server/service connection status
 */
import React from 'react';

/**
 * @param {object} props
 * @param {string} props.label - Status label
 * @param {boolean} props.online - Whether the service is online
 * @param {string} props.className - Additional CSS class
 */
export function StatusIndicator({ label, online, className = '' }) {
  return (
    <div className="status-item">
      <span className={`status-dot ${online ? 'online' : ''} ${className}`}></span>
      <span>{label}</span>
    </div>
  );
}

export default StatusIndicator;
