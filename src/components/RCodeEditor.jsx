import React, { useRef, useEffect } from 'react';

export default function RCodeEditor({ value, onChange, onExecute, disabled, template }) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleKeyDown = (e) => {
    // Handle tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
    
    // Execute on Ctrl+Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!disabled && onExecute) {
        onExecute();
      }
    }
  };

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '8px 16px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontWeight: '500', fontSize: '14px' }}>R Code Editor</span>
          {template && (
            <span style={{ 
              fontSize: '12px', 
              color: '#666',
              backgroundColor: '#e3f2fd',
              padding: '2px 8px',
              borderRadius: '12px'
            }}>
              {template.name}
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Press Ctrl+Enter to execute
        </div>
      </div>
      
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="# Enter R code here..."
          style={{
            width: '100%',
            minHeight: '200px',
            padding: '16px 16px 16px 56px', // Added left padding for line numbers
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            backgroundColor: disabled ? '#f9f9f9' : 'white',
            color: '#333'
          }}
        />
        
        {/* Line numbers (simplified) */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '40px',
          padding: '16px 0',
          backgroundColor: '#f9f9f9',
          borderRight: '1px solid #e0e0e0',
          textAlign: 'right',
          fontSize: '12px',
          color: '#999',
          lineHeight: '1.5',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          {value.split('\n').map((_, i) => (
            <div key={i} style={{ paddingRight: '8px' }}>{i + 1}</div>
          ))}
        </div>
      </div>
      
      <div style={{
        backgroundColor: '#f5f5f5',
        padding: '8px 16px',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
      }}>
        <button
          onClick={() => onChange('')}
          disabled={disabled || !value}
          style={{
            padding: '6px 12px',
            backgroundColor: 'white',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: disabled || !value ? 'not-allowed' : 'pointer'
          }}
        >
          Clear
        </button>
        
        <button
          onClick={onExecute}
          disabled={disabled || !value.trim()}
          style={{
            padding: '6px 16px',
            backgroundColor: disabled || !value.trim() ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          Execute Code
        </button>
      </div>
    </div>
  );
} 