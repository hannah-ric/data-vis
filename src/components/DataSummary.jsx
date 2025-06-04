import React from 'react';

export default function DataSummary({ summary }) {
  if (!summary) return null;

  return (
    <div>
      <h2>Data Summary</h2>
      <p>Rows: {summary.rowCount}</p>
      <p>Columns:</p>
      <ul>
        {summary.columns.map((col) => (
          <li key={col}>{col}</li>
        ))}
      </ul>
    </div>
  );
}
