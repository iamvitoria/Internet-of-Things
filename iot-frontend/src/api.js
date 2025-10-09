export const BASE_URL = "http://localhost:3000"; // <- ajuste se necessário

export async function fetchDados() {
  try {
    const res = await fetch(`${BASE_URL}/api/dados`);
    if (!res.ok) throw new Error("Erro na resposta do backend");
    const data = await res.json();
    // Espera-se que o backend retorne um array/lista de leituras ordenadas (ou objeto de leituras)
    return data;
  } catch (err) {
    // Propaga o erro para o UI tratar (usaremos fallback de simulação)
    throw err;
  }
}
