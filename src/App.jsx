import React, { useEffect, useState } from 'react';
import { useFileProcessor } from './hooks/useFileProcessor';
import useDataAnalysis from './hooks/useDataAnalysis';
import FileUpload from './components/FileUpload';
import DataSummary from './components/DataSummary';
import ChartConfiguration from './components/ChartConfiguration';
import Visualization from './components/Visualization';

export default function App() {
  const { data, error, handleFileUpload } = useFileProcessor();
  const summary = useDataAnalysis(data);
  const [chartConfig, setChartConfig] = useState({ type: 'bar', x: '', y: '' });

  useEffect(() => {
    if (summary && summary.columns.length >= 2) {
      setChartConfig(cfg => ({
        ...cfg,
        x: summary.columns[0],
        y: summary.columns[1],
      }));
    }
  }, [summary]);

  return (
    <div>
      <h1>Data Visualization App</h1>
      <FileUpload onFileLoaded={handleFileUpload} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <DataSummary summary={summary} />
      {summary && (
        <ChartConfiguration
          columns={summary.columns}
          config={chartConfig}
          onChange={setChartConfig}
        />
      )}
      {summary && <Visualization data={data} config={chartConfig} />}
    </div>
  );
}
