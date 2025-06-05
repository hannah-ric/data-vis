import React, { useState, useEffect } from 'react';

export default function PromptInput({ value, onChange, onSubmit, disabled, placeholder }) {
  const [localValue, setLocalValue] = useState(value || '');

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localValue.trim() && !disabled) {
      onSubmit(localValue);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'stretch'
      }}>
        <div style={{
          flex: 1,
          position: 'relative'
        }}>
          <input
            type="text"
            value={localValue}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder || "Describe what you want to visualize..."}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #e0e0e0',
              borderRadius: '4px',
              outline: 'none',
              transition: 'border-color 0.2s',
              backgroundColor: disabled ? '#f5f5f5' : 'white'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2196f3';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
            }}
          />
          
          {/* Prompt suggestions */}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            Examples: "Show correlation matrix" • "Create scatter plot of X vs Y" • "Visualize distribution of sales"
          </div>
        </div>
        
        <button
          type="submit"
          disabled={disabled || !localValue.trim()}
          style={{
            padding: '12px 24px',
            backgroundColor: disabled || !localValue.trim() ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: disabled || !localValue.trim() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!disabled && localValue.trim()) {
              e.target.style.backgroundColor = '#45a049';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && localValue.trim()) {
              e.target.style.backgroundColor = '#4caf50';
            }
          }}
        >
          Generate
        </button>
      </div>
    </form>
  );
} 