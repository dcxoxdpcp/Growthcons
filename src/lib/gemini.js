// Capa de acceso a Gemini compartida por el entrenador y el Analizador de Negocio.
// La clave se lee de VITE_GEMINI_API_KEY (.env.local). En el entorno canvas de Gemini
// la clave vacía se inyecta automáticamente, por eso el fallback es "".
// AVISO: en producción la clave no debe vivir en el cliente; usa un proxy/backend.

export const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
export const MODEL_NAME = import.meta.env?.VITE_GEMINI_MODEL || 'gemini-2.5-flash-preview-09-2025';

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

/** Extrae JSON aunque el modelo lo envuelva en ```json ... ``` o añada texto. */
export function parseJSONLoose(text) {
  try {
    return JSON.parse(text);
  } catch {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenced) {
      try { return JSON.parse(fenced[1]); } catch { /* sigue */ }
    }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(text.slice(start, end + 1));
    throw new Error('No se pudo interpretar el JSON del modelo');
  }
}

export async function generateJSON({ system, user, temperature = 0.7, timeoutMs }) {
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

export async function generateText({ system, user, temperature = 0.8 }) {
  return request({
    contents: [{ parts: [{ text: user }] }],
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: { temperature },
  });
}
