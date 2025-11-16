export const BASE_URL = "http://localhost:3000"; // <- ajuste se necessário

/**
 * Função principal que será chamada pelo React.
 * Ela busca os dados brutos e os processa antes de entregar.
 */
export async function fetchDados() {
  try {
    const res = await fetch(`${BASE_URL}/api/dados`);
    if (!res.ok) throw new Error("Erro na resposta do backend");

    // 1. Pega a lista de eventos brutos da API
    const dadosBrutos = await res.json();

    // 2. Processa a lista para agrupar por sensor
    const dadosProcessados = processarDadosBrutos(dadosBrutos);

    // 3. Retorna os dados já prontos para o App.js
    // Convertemos o objeto em um array para facilitar o .map() no React
    return Object.values(dadosProcessados);

  } catch (err) {
    // Propaga o erro para o UI tratar
    console.error("Erro em fetchDados:", err);
    throw err;
  }
}

/**
 * ------------------------------------------------------------------
 * FUNÇÃO DE PROCESSAMENTO (INTERNA DO API.JS)
 * ------------------------------------------------------------------
 * Converte a lista longa de eventos em um objeto de *sensores*,
 * cada um com seu último valor e histórico.
 * Esta função NÃO é exportada, é usada apenas internamente.
 */
function processarDadosBrutos(dados) {
  if (!dados || dados.length === 0) return {};

  // Mapeia os IDs para nomes amigáveis e define a unidade
  const configSensores = {
    "99efc3b2-3ea5-4e41-8343-d237238cf5f1": {
      title: "Temperatura",
      unit: "°C"
    },
    "9dc544ee-36bd-4a52-a69a-f4cf8cffe578": {
      title: "Teclado",
      unit: ""
    },
    // Adicione outros IDs e nomes aqui se necessário
  };

  const sensores = {};

  // Itera sobre cada evento (leitura) vindo da API
  for (const evento of dados) {
    const id = evento.componentId;

    // Pula se não for um ID que queremos
    if (!configSensores[id]) continue;

    let data;
    try {
      // Garante que 'data' seja um objeto, mesmo que venha como string
      data = typeof evento.data === 'string' ? JSON.parse(evento.data) : evento.data;
    } catch (e) {
      console.warn("Ignorando dado mal formatado:", evento.data);
      continue; // Pula este evento se o JSON for inválido
    }

    const timestamp = new Date(evento.recordedAt).getTime(); // Para ordenação

    // Se é a primeira vez que vemos esse sensor, inicializa seu "objeto"
    if (!sensores[id]) {
      sensores[id] = {
        id: id,
        title: configSensores[id].title,
        unit: configSensores[id].unit,
        history: [], // Histórico de valores
        value: null, // O último valor registrado
        lastUpdate: 0, // O timestamp do último valor
      };
    }

    // Processa os diferentes formatos de dados e extrai o valor
    let valorExtraido = null;

    if (data.temperature) {
      valorExtraido = data.temperature;
    } else if (data.t) {
      valorExtraido = data.t;
    } else if (data.humidity) { // Exemplo se quiser histórico de umidade
      // Se você quiser tratar a umidade como um sensor separado,
      // precisará de um componentId diferente.
      // Aqui, estamos assumindo que é parte do mesmo sensor.
      // Apenas a temperatura será usada como 'valorExtraido' principal.
    } else if (data.h) {
      // idem
    } else if (data.value) { // Sensor do Teclado (digitação)
      valorExtraido = data.value;
    } else if (data.status) { // Sensor do Teclado (status de acesso)
      valorExtraido = data.status;
    } else if (data.senha) { // Ignora dados de senha no histórico
      valorExtraido = "******"; // Mostra asteriscos
    }
    // Adicione mais 'else if' se tiver outros formatos de dados

    // Adiciona o valor ao histórico (se ele foi extraído e não é nulo)
    if (valorExtraido !== null) {
      sensores[id].history.push(valorExtraido);
    }

    // Atualiza o "valor atual" (o que aparece grande no card)
    // se este evento for o mais recente que já vimos para este sensor.
    if (timestamp > sensores[id].lastUpdate) {
      // Não atualiza o valor principal se for 'senha'
      if (!data.senha) {
         sensores[id].value = valorExtraido;
      }
      sensores[id].lastUpdate = timestamp;
    }
  }

  // Retorna o objeto de sensores { "id_temp": {...}, "id_teclado": {...} }
  return sensores;
}