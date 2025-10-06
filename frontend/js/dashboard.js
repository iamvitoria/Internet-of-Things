const ctx = document.getElementById("velocidadeChart").getContext("2d");
const chartData = {
  labels: [],
  datasets: [
    {
      label: "Pulsos detectados",
      data: [],
      borderColor: "#004aad",
      backgroundColor: "rgba(0, 74, 173, 0.2)",
      borderWidth: 2,
      fill: true,
      tension: 0.3,
    },
  ],
};

const velocidadeChart = new Chart(ctx, {
  type: "line",
  data: chartData,
  options: {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "Tempo" },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "Detecções" },
      },
    },
  },
});

async function atualizarDashboard() {
  try {
    const res = await fetch("/api/dados"); 
    const data = await res.json();

    const ultima = data[data.length - 1];
    document.getElementById("ultimaLeitura").textContent = ultima?.timestamp || "--";
    document.getElementById("totalDeteccoes").textContent = ultima?.deteccoes || "0";

    velocidadeChart.data.labels = data.map(d => d.timestamp);
    velocidadeChart.data.datasets[0].data = data.map(d => d.deteccoes);
    velocidadeChart.update();

    const lista = document.getElementById("listaDispositivos");
    lista.innerHTML = "";
    const dispositivos = [...new Set(data.map(d => d.device_id))];
    dispositivos.forEach(dev => {
      const li = document.createElement("li");
      li.textContent = `🟢 ${dev}`;
      lista.appendChild(li);
    });
  } catch (err) {
    console.error("Erro ao atualizar dashboard:", err);
  }
}

setInterval(atualizarDashboard, 2000);