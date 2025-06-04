import { useState } from 'react';
import { parse } from 'papaparse';

export function useFileProcessor() {
  const [data, setData] = useState(null);

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target.result;
      const result = parse(csv, { header: true });
      setData(result.data);
    };
    reader.readAsText(file);
  };

  return { data, handleFileUpload };
}
