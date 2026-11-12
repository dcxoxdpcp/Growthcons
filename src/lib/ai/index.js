// Punto único de acceso a modelos de IA.
//
// Para añadir otro proveedor (Claude, OpenAI, un backend propio...):
//   1. Crea src/lib/ai/providers/<id>.js exportando por defecto
//      { id, label, isAvailable?(), generateJSON({ system, user, temperature, tier }), generateText(...) }
//      (temperature y tier son orientativos: cada proveedor usa los que soporta)
//   2. Regístralo en PROVIDERS.
//   3. Selecciónalo con VITE_AI_PROVIDER=<id> en .env.local.
// El resto de la app (analizador, evaluador del simulador) solo usa las funciones de este archivo.
import gemini from './providers/gemini.js';
import claudeArtifact from './providers/claudeArtifact.js';

// gemini: llamada directa a la API de Google (desarrollo local con VITE_GEMINI_API_KEY).
// claude-artifact: Claude a través del visor de claude.ai (versión publicada como página).
const PROVIDERS = { gemini, 'claude-artifact': claudeArtifact };

const DEFAULT_PROVIDER = import.meta.env?.VITE_AI_PROVIDER || 'gemini';

export function getProvider(id = DEFAULT_PROVIDER) {
  const provider = PROVIDERS[id];
  if (!provider) throw new Error(`Proveedor de IA desconocido: ${id}`);
  return provider;
}

/** Modo por defecto: 'ia' o 'demo' (VITE_AI_MODE). La versión publicada como página usa 'demo'. */
export const DEFAULT_MODE = import.meta.env?.VITE_AI_MODE === 'demo' ? 'demo' : 'ia';

/** Algunos entornos (páginas publicadas) bloquean las descargas de archivos. */
export const DOWNLOADS_ENABLED = import.meta.env?.VITE_DISABLE_DOWNLOADS !== '1';

export const providerLabel = () => getProvider().label;

/** ¿Puede este entorno usar el proveedor? (p.ej. Claude solo funciona dentro de claude.ai). */
export const isAIAvailable = async () => {
  const p = getProvider();
  return p.isAvailable ? p.isAvailable() : true;
};

export const generateJSON = (opts) => getProvider().generateJSON(opts);
export const generateText = (opts) => getProvider().generateText(opts);
