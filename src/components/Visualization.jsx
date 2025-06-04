import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

export default function Visualization({ data, config }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || !config.x || !config.y) return;

    const ctx = canvasRef.current.getContext('2d');
    const chart = new Chart(ctx, {
      type: config.type,
      data: {
        labels: data.map((row) => row[config.x]),
        datasets: [
          {
            label: config.y,
            data: data.map((row) => row[config.y]),
          },
        ],
      },
    });
    return () => chart.destroy();
  }, [data, config]);

  return <canvas ref={canvasRef}></canvas>;
}
