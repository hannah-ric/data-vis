import React, { useState } from 'react';
import { useFileProcessor } from './hooks/useFileProcessor';
import useDataAnalysis from './hooks/useDataAnalysis';
import FileUpload from './components/FileUpload';
import DataSummary from './components/DataSummary';
import ChartConfiguration from './components/ChartConfiguration';
import Visualization from './components/Visualization';

export default function App() {
  const { data, handleFileUpload, error } = useFileProcessor();
  const summary = useDataAnalysis(data);
  const [chartConfig, setChartConfig] = useState({ type: 'bar', x: '', y: '' });

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
