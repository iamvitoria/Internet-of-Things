import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function SensorCard({ title, value, unit, history = [], raw }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  // Determina se o sensor é um teclado baseado no título
  const isKeyboardSensor = title && title.toLowerCase().includes("teclado");

  useEffect(() => {
    // Se for um sensor de teclado, não tentamos renderizar um gráfico.
    // O useEffect é ignorado para esses sensores.
    if (isKeyboardSensor) {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      return;
    }

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
  }, [history, title, isKeyboardSensor]); // Adicionado isKeyboardSensor às dependências

  // Verificação para exibir o histórico numérico apenas se não for um sensor de teclado
  const hasNumericHistory = !isKeyboardSensor && history.some(h => !isNaN(parseFloat(h)));

  return (
    <div className="sensor-card">
      <h3>{title}</h3>
      {isKeyboardSensor ? (
        // Se for um sensor de teclado, exibe o valor como um bloco de texto formatado
        <pre className="keyboard-output">{value}</pre>
      ) : (
        // Caso contrário, exibe o valor normal com a unidade
        <p className="value">
          {value} {unit}
        </p>
      )}

      {hasNumericHistory && (
        <div className="chart-container" style={{ height: "120px" }}>
          <canvas ref={canvasRef}></canvas>
        </div>
      )}
    </div>
  );
}