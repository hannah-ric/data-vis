import { useState } from 'react';
import { parse } from 'papaparse';

export function useFileProcessor() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      try {
        const result = parse(csv, { header: true });
        if (result.errors && result.errors.length > 0) {
          throw new Error(result.errors[0].message);
        }
        setData(result.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to parse file');
        setData(null);
      }
    };
    reader.readAsText(file);
  };

  return { data, handleFileUpload, error };
}
