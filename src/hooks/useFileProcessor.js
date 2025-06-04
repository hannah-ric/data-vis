import { useState } from 'react';
import { parse } from 'papaparse';

export function useFileProcessor() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target.result;
        const result = parse(csv, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        });
        if (result.errors.length) {
          throw new Error(result.errors[0].message);
        }
        setData(result.data);
        setError(null);
      } catch (err) {
        setData(null);
        setError(err.message || 'Failed to parse file');
      }
    };
    reader.onerror = () => setError('Failed to read file');
    reader.readAsText(file);
  };

  return { data, error, handleFileUpload };
}
