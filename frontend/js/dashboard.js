function criarGrafico(id, label, color) {
  const ctx = document.getElementById(id).getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label,
          data: [],
          borderColor: color,
          backgroundColor: color + "33",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: "Tempo" } },
        y: { beginAtZero: true, title: { display: true, text: "Valor" } },
      },
    },
  });
}

// Gráficos principais
const charts = {
  velocidade: criarGrafico("chartVelocidade", "Velocidade (pulsos)", "#004aad"),
  temperatura: criarGrafico("chartTemperatura", "Temperatura (°C)", "#ff5733"),
  distancia: criarGrafico("chartDistancia", "Distância (cm)", "#36a2eb"),
  mpu: criarGrafico("chartMPU", "Movimento", "#8e44ad"),
  gestos: criarGrafico("chartGestos", "Gestos/Cor", "#ffcd56"),
  joystick: criarGrafico("chartJoystick", "Joystick", "#27ae60"),
};

// Atualiza dashboard a cada 2 segundos
async function atualizarDashboard() {
  try {
    const res = await fetch("/api/dados"); // Endpoint Flask
    const data = await res.json();

    const ultima = data[data.length - 1];

    document.getElementById("ultimaVelocidade").textContent = ultima?.velocidade ?? "--";
    document.getElementById("tempAtual").textContent = ultima?.temperatura ?? "--";
    document.getElementById("distAtual").textContent = ultima?.distancia ?? "--";
    document.getElementById("mpuAtual").textContent = ultima?.movimento ?? "--";
    document.getElementById("gestoAtual").textContent = ultima?.gesto ?? "--";
    document.getElementById("joyX").textContent = ultima?.joystick_x ?? "--";
    document.getElementById("joyY").textContent = ultima?.joystick_y ?? "--";
    document.getElementById("servoAngulo").textContent = ultima?.servo ?? "--";
    document.getElementById("statusRele").textContent = ultima?.rele ? "Ligado" : "Desligado";
    document.getElementById("teclaPressionada").textContent = ultima?.teclado ?? "--";
    document.getElementById("codigoIR").textContent = ultima?.ir ?? "--";

    // Atualiza gráficos
    const tempo = new Date().toLocaleTimeString();
    Object.entries(charts).forEach(([key, chart]) => {
      const valor = ultima?.[key] ?? 0;
      chart.data.labels.push(tempo);
      chart.data.datasets[0].data.push(valor);
      if (chart.data.labels.length > 10) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
      }
      chart.update();
    });

    // Atualiza lista de dispositivos
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
