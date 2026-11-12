// Proveedor Gemini. Implementa el contrato de proveedor definido en ../index.js:
//   { id, label, generateJSON({system,user,temperature}), generateText({system,user,temperature}) }
// La clave se lee de VITE_GEMINI_API_KEY (.env.local). En el entorno canvas de Gemini
// la clave vacía se inyecta automáticamente, por eso el fallback es "".
// AVISO: en producción la clave no debe vivir en el cliente; usa un proxy/backend.
import { parseJSONLoose } from '../json.js';

const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
const MODEL_NAME = import.meta.env?.VITE_GEMINI_MODEL || 'gemini-2.5-flash-preview-09-2025';

const endpoint = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function request(body, { retries = 2, timeoutMs = 60000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        lastError = new Error(`Gemini HTTP ${res.status}`);
        // 4xx (salvo 429) no se arreglan reintentando.
        if (res.status !== 429 && res.status < 500) break;
      } else {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
        if (!text) throw new Error('Respuesta vacía de Gemini');
        return text;
      }
    } catch (e) {
      lastError = e;
    } finally {
      clearTimeout(timer);
    }
    if (attempt < retries) await sleep(800 * 2 ** attempt);
  }
  throw lastError || new Error('Fallo desconocido de Gemini');
}

async function generateJSON({ system, user, temperature = 0.7, timeoutMs }) {
  const text = await request(
    {
      contents: [{ parts: [{ text: user }] }],
      systemInstruction: { parts: [{ text: system }] },
      generationConfig: { responseMimeType: 'application/json', temperature },
    },
    { timeoutMs },
  );
  return parseJSONLoose(text);
}

async function generateText({ system, user, temperature = 0.8 }) {
  return request({
    contents: [{ parts: [{ text: user }] }],
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: { temperature },
  });
}

export default {
  id: 'gemini',
  label: `Gemini (${MODEL_NAME})`,
  generateJSON,
  generateText,
};
