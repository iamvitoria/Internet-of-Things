import React, { useEffect, useState, useRef } from "react";
import SensorCard from "./SensorCard";
import { fetchDados } from "../api";

const SENSORS = [
  { key: "temperatura", title: "Sensor de Temperatura — DS18B20", unit: "°C" },
  { key: "mpu", title: "Acelerômetro / Giroscópio — MPU6050", unit: "" },
  { key: "gesto", title: "Sensor de Gestos — APDS-9960", unit: "" },
  { key: "velocidade", title: "Sensor de Velocidade", unit: "pulsos" },
  { key: "distancia", title: "Sensor Ultrassônico", unit: "cm" },
  { key: "rele", title: "Relé", unit: "" },
  { key: "servo", title: "Servo Motor", unit: "°" },
  { key: "joystick", title: "Joystick", unit: "" },
  { key: "teclado", title: "Teclado Matricial", unit: "" },
  { key: "ir", title: "Receptor IR", unit: "" }
];

function gerarFake() {
  return {
    temperatura: null,
    umidade: null,
    rele: null,

    mpu: Math.random().toFixed(2),
    gesto: Math.floor(Math.random() * 6),
    velocidade: Math.floor(Math.random() * 200),
    distancia: Math.floor(10 + Math.random() * 200),
    servo: Math.floor(Math.random() * 180),
    joystick: `${(Math.random() * 2 - 1).toFixed(2)}, ${(Math.random() * 2 - 1).toFixed(2)}`,
    teclado: "-",
    ir: "0x" + Math.floor(Math.random() * 0xffffffff).toString(16),
  };
}

function aplicarReais(fake, reais) {
  reais.forEach(s => {
    if (s.title === "Temperatura") {
      fake.temperatura = s.value;
      fake.umidade = s.humidity;
    }
    if (s.title === "Teclado") {
      fake.teclado = s.value;
    }
    if (s.title === "Relé") {
      fake.rele = s.value;
    }
  });
  return fake;
}

export default function Dashboard() {
  const [historico, setHistorico] = useState({});
  const [backendOk, setBackendOk] = useState(true);

  const intervalRef = useRef(null);

  useEffect(() => {
    async function update() {

      let reais = [];
      try {
        reais = await fetchDados();
        setBackendOk(true);
      } catch {
        setBackendOk(false);
      }

      const fake = gerarFake();
      const combinado = aplicarReais(fake, reais);

      setHistorico(prev => {
        const novo = { ...prev };

        SENSORS.forEach(s => {
          if (!novo[s.key]) novo[s.key] = [];

          const novoValor = combinado[s.key];

          if (s.key === "temperatura" || s.key === "rele") {
            if (novoValor !== null && novoValor !== undefined) {
              novo[s.key] = [...novo[s.key], novoValor].slice(-20);
            }
          } else {
            novo[s.key] = [...novo[s.key], novoValor].slice(-20);
          }
        });

        return novo;
      });
    }

    update();
    intervalRef.current = setInterval(update, 1500);

    return () => clearInterval(intervalRef.current);

  }, []);

  const latest = {};
  SENSORS.forEach(s => {
    const ultimo = historico[s.key]?.slice(-1)[0];
    latest[s.key] = ultimo !== null && ultimo !== undefined ? ultimo : "--";
  });

  return (
    <main className="dashboard-main">

      <div className="top-row">
        <div className="summary-card">
          <h3>Sensores</h3>
          <p>
            Backend:{" "}
            <strong className={backendOk ? "ok" : "nok"}>
              {backendOk ? "Online" : "Offline"}
            </strong>
          </p>
        </div>
      </div>

      <section className="grid-cards">
        {SENSORS.map(s => (
          <SensorCard
            key={s.key}
            title={s.title}
            value={latest[s.key]}
            history={historico[s.key] ?? []}
            unit={s.unit}
            raw={latest}
          />
        ))}
      </section>

    </main>
  );
}
