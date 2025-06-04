import React, { useState } from 'react';
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
        />
      )}
      {summary && <Visualization data={data} config={chartConfig} />}
    </div>
  );
}

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App