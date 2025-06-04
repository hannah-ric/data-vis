import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

export default function Visualization({ data, config }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const render = () => {
      if (!data || !config.x || !config.y) return;
      if (chartRef.current) chartRef.current.destroy();
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight || 300;
      chartRef.current = new Chart(canvas.getContext('2d'), {
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
    };
    render();
    window.addEventListener('resize', render);
    return () => {
      window.removeEventListener('resize', render);
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [data, config]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '300px' }} />;
}
