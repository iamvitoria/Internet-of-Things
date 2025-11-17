export const BASE_URL = "https://api-cogr.onrender.com/readings";

/**
 * Busca os dados na API e retorna sensores normalizados
 */
export async function fetchDados() {
  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Erro no backend");

    const dados = await res.json();
    return Object.values(processar(dados));

  } catch (err) {
    console.error("Erro fetchDados:", err);
    throw err;
  }
}

/**
 * Processa o array de eventos retornados pelo /readings
 */
function processar(lista) {
  if (!lista || !lista.length) return {};

  const config = {
    "99efc3b2-3ea5-4e41-8343-d237238cf5f1": { title: "Temperatura", unit: "°C" },
    "9dc544ee-36bd-4a52-a69a-f4cf8cffe578": { title: "Teclado", unit: "" },
    "1335bab9-5f60-4619-a73c-8070deded4c3": { title: "Relé", unit: "" },
  };

  const sensores = {};

  for (const evt of lista) {
    if (!config[evt.componentId]) continue;

    let data;
    try {
      data = typeof evt.data === "string" ? JSON.parse(evt.data) : evt.data;
    } catch {
      continue;
    }

    const id = evt.componentId;
    const ts = new Date(evt.recordedAt).getTime();

    if (!sensores[id]) {
      sensores[id] = {
        id,
        title: config[id].title,
        unit: config[id].unit,
        value: null,
        humidity: null,
        history: [],
        lastUpdate: 0
      };
    }

    let valor = null;

    // ───────────────────────────────────────────────
    // ✔ 1) TEMPERATURA REAL (t ou temperature)
    // ───────────────────────────────────────────────
    if (data.temperature || data.t) {
      valor = data.temperature ?? data.t;
      sensores[id].humidity = data.humidity ?? data.h ?? null;
    }

    // ───────────────────────────────────────────────
    // ✔ 2) Teclado e Relé (caso venham em "value")
    // ───────────────────────────────────────────────
    else if (data.value !== undefined) {
      valor = data.value;
    }

    // ───────────────────────────────────────────────
    // ✔ 3) Ignorar "status" para TEMPERATURA
    //    (ex: {status:"temp_alta"} não deve virar valor)
    // ───────────────────────────────────────────────
    else if (data.status && config[id].title !== "Temperatura") {
      valor = data.status;
    }

    // Se não for nada disso, ignora completamente
    else {
      continue;
    }

    // ───────────────────────────────────────────────
    // ✔ Atualiza histórico e último valor
    // ───────────────────────────────────────────────
    if (valor !== null) {
      sensores[id].history.push(valor);
      sensores[id].history = sensores[id].history.slice(-25);
    }

    if (ts > sensores[id].lastUpdate) {
      sensores[id].value = valor;
      sensores[id].lastUpdate = ts;
    }
  }

  return sensores;
}
