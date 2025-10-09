import React, { useEffect, useState, useRef } from "react";
import SensorCard from "./SensorCard";
import { fetchDados } from "../api";

// lista dos sensores/atuadores (nomes e chaves esperadas nos dados)
const SENSORS = [
  { key: "temperatura", title: "Sensor de Temperatura — DS18B20", unit: "°C" },
  { key: "mpu", title: "Acelerômetro / Giroscópio — MPU6050", unit: "" },
  { key: "gesto", title: "Sensor de Gestos e Cor — APDS-9960", unit: "" },
  { key: "velocidade", title: "Sensor de Velocidade — Encoder", unit: "pulsos" },
  { key: "distancia", title: "Sensor de Distância — HC-SR04", unit: "cm" },
  { key: "rele", title: "Módulo Relé 5V 10A — JQC3F", unit: "" },
  { key: "servo", title: "Micro Servo Motor 9g — SG90", unit: "°" },
  { key: "joystick", title: "Joystick KY023 3 Eixos", unit: "" },
  { key: "teclado", title: "Teclado Matricial 4x4", unit: "" },
  { key: "ir", title: "Controle Remoto IR + Receptor", unit: "" },
];

function randomSample() {
  // Gera um objeto com campos simulados (útil para desenvolvimento sem backend)
  return {
    device_id: "ESP32_TTGO_01",
    timestamp: new Date().toISOString(),
    temperatura: (20 + Math.random() * 10).toFixed(1),
    mpu: Math.random().toFixed(2),
    gesto: Math.floor(Math.random() * 6),
    velocidade: Math.floor(Math.random() * 200),
    distancia: Math.floor(10 + Math.random() * 200),
    rele: Math.random() > 0.5,
    servo: Math.floor(Math.random() * 180),
    joystick: { x: (Math.random() * 2 - 1).toFixed(2), y: (Math.random() * 2 - 1).toFixed(2) },
    teclado: ["A","B","C","D","1","2","3","#"][Math.floor(Math.random()*8)],
    ir: "0x" + Math.floor(Math.random()*0xffffffff).toString(16),
  };
}

export default function Dashboard() {
  const [history, setHistory] = useState([]); // array de leituras (últimas)
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [backendOk, setBackendOk] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    async function update() {
      try {
        const res = await fetchDados();
        setBackendOk(true);
        // assume-se que res é um array de leituras ou um objeto com histórico
        let latestArray = [];
        if (Array.isArray(res)) {
          latestArray = res;
        } else if (typeof res === "object" && res !== null) {
          // caso o backend retorne um único objeto, empilha-o
          latestArray = [res];
        } else {
          latestArray = [];
        }
        // Mantém histórico curto (até 30)
        setHistory(prev => {
          const merged = [...prev, ...latestArray];
          return merged.slice(-30);
        });
        const devs = [...new Set((latestArray || []).map(d => d.device_id).filter(Boolean))];
        setConnectedDevices(prev => {
          const merged = [...new Set([...prev, ...devs])];
          return merged;
        });
      } catch (err) {
        // se falhar, usa simulação e marca backend como offline
        setBackendOk(false);
        const sim = randomSample();
        setHistory(prev => {
          const merged = [...prev, sim];
          return merged.slice(-30);
        });
        setConnectedDevices(prev => {
          const merged = [...new Set([...prev, sim.device_id])];
          return merged;
        });
      }
    }

    // primeira atualização imediata
    update();

    // intervalo a cada 2s
    intervalRef.current = setInterval(update, 2000);

    return () => clearInterval(intervalRef.current);
  }, []);

  // pega a última leitura do histórico
  const latest = history.length ? history[history.length - 1] : null;

  return (
    <main className="dashboard-main">
      <div className="top-row">
        <div className="summary-card">
          <h3>Sensor monitorado</h3>
          <p className="big">{latest ? latest.device_id : "--"}</p>
          <p>Última leitura: {latest ? new Date(latest.timestamp).toLocaleString() : "--"}</p>
          <p>Status backend: <strong className={backendOk ? "ok":"nok"}>{backendOk ? "Online" : "Offline (modo simulado)"}</strong></p>
        </div>

        <div className="devices-card">
          <h3>Dispositivos Conectados</h3>
          <ul>
            {connectedDevices.length ? connectedDevices.map(d => <li key={d}>🟢 {d}</li>) : <li>— nenhum —</li>}
          </ul>
        </div>
      </div>

      <section className="grid-cards">
        {SENSORS.map(s => (
          <SensorCard
            key={s.key}
            title={s.title}
            value={extractValue(latest, s.key)}
            unit={s.unit}
            history={history.map(h => extractValue(h, s.key))}
            raw={latest}
          />
        ))}
      </section>
    </main>
  );
}

// função utilitária para extrair valor normalizado de cada sensor
function extractValue(obj, key) {
  if (!obj) return null;
  switch (key) {
    case "joystick":
      if (obj.joystick) return typeof obj.joystick === "string" ? obj.joystick : `${obj.joystick.x}, ${obj.joystick.y}`;
      return null;
    case "rele":
      return obj.rele === true || obj.rele === "true" ? "Ligado" : "Desligado";
    case "teclado":
    case "ir":
      return obj[key] ?? "-";
    default:
      // campos simples (string/number)
      return obj[key] ?? null;
  }
}
