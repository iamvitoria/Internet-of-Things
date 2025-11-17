import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function SensorCard({ title, value, unit, history = [], raw }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const isKeyboard = title.toLowerCase().includes("teclado");

  // 🔻 TIPOS que foram desativados:
  // const isRele = title.toLowerCase().includes("relé");
  // const isIR = title.toLowerCase().includes("infravermelho") || title.toLowerCase().includes("ir");

  const isTemp = title.toLowerCase().includes("temperatura");

  // Antes: teclado ou relé
  // Agora: apenas teclado não terá gráfico
  const semGrafico = isKeyboard;
  // const semGrafico = isKeyboard || isRele || isIR;

  useEffect(() => {
    if (semGrafico) {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      return;
    }

    if (!canvasRef.current) return;

    const numeric = history
      .map(h => {
        const n = parseFloat(h);
        return isNaN(n) ? null : n;
      })
      .filter(n => n !== null);

    const ctx = canvasRef.current.getContext("2d");
    if (!numeric.length) return;

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
        datasets: [{
          label: title,
          data: numeric,
          borderColor: "#004aad",
          backgroundColor: "rgba(0,74,173,0.2)",
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { beginAtZero: true }
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };

  }, [history, semGrafico, title]);

  const renderKeyboard = () => {
    if (value === "acesso_liberado")
      return <p className="keyboard-status liberado">Acesso Liberado</p>;
    if (value === "acesso_negado")
      return <p className="keyboard-status negado">Acesso Negado</p>;
    return <pre className="keyboard-output">{value}</pre>;
  };

  // 🔻 Render do Relé removido temporariamente
  /*
  const renderRele = () => {
    if (value === "ON")
      return <p className="rele-on">Relé Ligado</p>;
    return <p className="rele-off">Relé Desligado</p>;
  };
  */

  // 🔻 Render IR removido temporariamente
  /*
  const renderIR = () => (
    <p className="ir-status">{value}</p>
  );
  */

  return (
    <div className="sensor-card">
      <h3>{title}</h3>

      {isKeyboard ? (
        renderKeyboard()
      ) :
      // 🔻 Trechos removidos:
      // isRele ? (
      //   renderRele()
      // ) : isIR ? (
      //   renderIR()
      // ) :
      isTemp ? (
        <p className="value">
          {value}°C — {raw?.humidity ?? "--"}%
        </p>
      ) : (
        <p className="value">{value} {unit}</p>
      )}

      {!semGrafico && history.length > 1 && (
        <div className="chart-container" style={{ height: "120px" }}>
          <canvas ref={canvasRef}></canvas>
        </div>
      )}
    </div>
  );
}
