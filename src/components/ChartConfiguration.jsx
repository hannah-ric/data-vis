import React from 'react';

const chartTypes = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'scatter', label: 'Scatter' }
];

export default function ChartConfiguration({ columns, config, onChange, onReset }) {
  if (!columns) return null;

  const handleSelect = (e) => {
    const { name, value } = e.target;
    onChange({ ...config, [name]: value });
  };

  return (
    <div>
      <h2>Chart Configuration</h2>
      <label>
        Chart Type:
        <select name="type" value={config.type} onChange={handleSelect}>
          {chartTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>
      <label>
        X:
        <select name="x" value={config.x} onChange={handleSelect}>
          <option value="">Select column</option>
          {columns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <label>
        Y:
        <select name="y" value={config.y} onChange={handleSelect}>
          <option value="">Select column</option>
          {columns.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
      <button type="button" onClick={onReset}>Reset</button>
    </div>
  );
}
