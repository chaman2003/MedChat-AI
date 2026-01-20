/**
 * QuickQueries Component
 * Quick action buttons for common queries
 */
import React from 'react';

const QUERY_TYPES = [
  { id: 'diseases', icon: '🦠', label: 'Diseases' },
  { id: 'medications', icon: '💊', label: 'Medications' },
  { id: 'symptoms', icon: '🤒', label: 'Symptoms' },
  { id: 'lab_results', icon: '🧪', label: 'Lab Results' },
  { id: 'allergies', icon: '⚠️', label: 'Allergies' },
  { id: 'profile', icon: '👤', label: 'Profile' },
];

/**
 * @param {object} props
 * @param {function} props.onQuerySelect - Callback when a query type is selected
 */
export function QuickQueries({ onQuerySelect }) {
  return (
    <div className="quick-queries">
      {QUERY_TYPES.map(({ id, icon, label }) => (
        <button 
          key={id} 
          onClick={() => onQuerySelect(id)}
          title={`Query ${label}`}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
}

export default QuickQueries;
