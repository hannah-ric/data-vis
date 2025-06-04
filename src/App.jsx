import React, { useState, useEffect } from 'react';
import { useFileProcessor } from './hooks/useFileProcessor';
import useDataAnalysis from './hooks/useDataAnalysis';
import FileUpload from './components/FileUpload';
import DataSummary from './components/DataSummary';
import ChartConfiguration from './components/ChartConfiguration';
import Visualization from './components/Visualization';

export default function App() {
  const { data, handleFileUpload } = useFileProcessor();
  const summary = useDataAnalysis(data);
  const [chartConfig, setChartConfig] = useState({ type: 'bar', x: '', y: '' });

  useEffect(() => {
    if (summary && summary.columns.length >= 2) {
      setChartConfig((prev) => {
        if (prev.x || prev.y) return prev;
        return { ...prev, x: summary.columns[0], y: summary.columns[1] };
      });
    }
  }, [summary]);

  const resetConfig = () => {
    if (summary && summary.columns.length >= 2) {
      setChartConfig({ type: 'bar', x: summary.columns[0], y: summary.columns[1] });
    } else {
      setChartConfig({ type: 'bar', x: '', y: '' });
    }
  };

  return (
    <div>
      <h1>Data Visualization App</h1>
      <FileUpload onFileLoaded={handleFileUpload} />
      <DataSummary summary={summary} />
      {summary && (
        <ChartConfiguration
          columns={summary.columns}
          config={chartConfig}
          onChange={setChartConfig}
          onReset={resetConfig}
        />
      )}
      {summary && <Visualization data={data} config={chartConfig} />}
    </div>
  );
}
