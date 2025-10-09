import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function SensorCard({ title, value, unit, history = [], raw }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const numeric = history
      .map(h => {
        if (h == null) return null;
        if (typeof h === "object") return null;
        const n = parseFloat(String(h).replace(",", "."));
        return isNaN(n) ? null : n;
      })
      .filter(v => v !== null);

    const ctx = canvasRef.current.getContext("2d");

    if (chartRef.current) {
      chartRef.current.data.labels = numeric.map((_, i) => i + 1);
      chartRef.current.data.datasets[0].data = numeric;
      chartRef.current.update();
      return;
    }

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: numeric.map((_, i) => i + 1),
        datasets: [
          {
            label: title,
            data: numeric,
            borderColor: "#004aad",
            backgroundColor: "rgba(0,74,173,0.12)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { beginAtZero: true },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [history, title]);

  const hasNumericHistory = history.some(h => !isNaN(parseFloat(h)));

  return (
    <div className="sensor-card">
      <h3>{title}</h3>
      <p className="value">
        {value} {unit}
      </p>
      {hasNumericHistory && (
        <div className="chart-container" style={{ height: "120px" }}>
          <canvas ref={canvasRef}></canvas>
        </div>
      )}
    </div>
  );
}
