import { useMemo } from 'react';

export default function useDataAnalysis(data) {
  return useMemo(() => {
    if (!data || data.length === 0) return null;
    const columns = Object.keys(data[0]);
    const rowCount = data.length;
    return { columns, rowCount };
  }, [data]);
}
