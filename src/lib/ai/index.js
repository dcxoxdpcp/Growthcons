// Punto único de acceso a modelos de IA.
//
// Para añadir otro proveedor (Claude, OpenAI, un backend propio...):
//   1. Crea src/lib/ai/providers/<id>.js exportando por defecto
//      { id, label, generateJSON({ system, user, temperature }), generateText({ system, user, temperature }) }
//   2. Regístralo en PROVIDERS.
//   3. Selecciónalo con VITE_AI_PROVIDER=<id> en .env.local.
// El resto de la app (analizador, evaluador del simulador) solo usa las funciones de este archivo.
import gemini from './providers/gemini.js';

const PROVIDERS = { gemini };

const DEFAULT_PROVIDER = import.meta.env?.VITE_AI_PROVIDER || 'gemini';

export function getProvider(id = DEFAULT_PROVIDER) {
  const provider = PROVIDERS[id];
  if (!provider) throw new Error(`Proveedor de IA desconocido: ${id}`);
  return provider;
}

export const providerLabel = () => getProvider().label;

export const generateJSON = (opts) => getProvider().generateJSON(opts);
export const generateText = (opts) => getProvider().generateText(opts);
