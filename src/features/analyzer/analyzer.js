// Orquestación del Analizador de Negocio.
// 1) "estrategia" (diagnóstico + oferta) se genera primero.
// 2) "narrativa", "copy" y "marca_personal" se generan en paralelo con el diagnóstico como contexto.
// Cada sección se normaliza contra la versión demo para que la UI nunca reciba campos vacíos.
import { generateJSON } from '../../lib/ai/index.js';
import { SECTIONS, buildPrompt } from './prompts.js';
import { demoSection } from './demoEngine.js';

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

/** Rellena campos ausentes o de tipo incorrecto con los valores de `defaults`. */
export function deepFill(value, defaults) {
  if (Array.isArray(defaults)) return Array.isArray(value) && value.length ? value : defaults;
  if (isPlainObject(defaults)) {
    const src = isPlainObject(value) ? value : {};
    const out = { ...src };
    for (const k of Object.keys(defaults)) out[k] = deepFill(src[k], defaults[k]);
    return out;
  }
  if (value === undefined || value === null || value === '') return defaults;
  if (typeof defaults === 'number') {
    const n = Number(value);
    return Number.isFinite(n) ? n : defaults;
  }
  if (typeof defaults === 'boolean') return typeof value === 'boolean' ? value : value === 'true';
  return typeof value === 'object' ? defaults : value;
}

/** Reglas de validación de los especialistas que el modelo a veces no respeta. */
function postProcess(sectionId, data) {
  if (sectionId === 'estrategia') {
    const d = data.diagnostico;
    d.dolor_principal_index = Math.min(Math.max(0, Math.round(d.dolor_principal_index)), d.dolores.length - 1);
    d.confianza_diagnostico = Math.min(100, Math.max(0, Math.round(d.confianza_diagnostico)));
    const p = data.oferta.pricing;
    p.nivel_recomendado_index = Math.min(Math.max(0, Math.round(p.nivel_recomendado_index)), p.niveles.length - 1);
    if (!(p.mensual_recomendado_usd > 0)) p.mensual_recomendado_usd = p.niveles[p.nivel_recomendado_index]?.mensual_usd || 250;
  }
  if (sectionId === 'marca_personal') {
    const total = data.pilares.reduce((acc, x) => acc + (Number(x.porcentaje) || 0), 0);
    if (total > 0 && total !== 100) {
      data.pilares = data.pilares.map((x) => ({ ...x, porcentaje: Math.round(((Number(x.porcentaje) || 0) * 100) / total) }));
    }
    data.hooks = data.hooks.slice(0, 5);
    data.auditoria.nivel_autoridad = Math.min(5, Math.max(1, Math.round(data.auditoria.nivel_autoridad)));
  }
  return data;
}

/**
 * Genera una sección. Si `mode === 'demo'` o el proveedor falla, usa el motor local.
 * Devuelve { data, origin: 'ia' | 'demo', error? }.
 */
export async function generateSection(sectionId, description, { estrategia, mode = 'ia', instruction } = {}) {
  const fallback = demoSection(sectionId, description, estrategia);
  if (mode === 'demo') return { data: fallback, origin: 'demo' };
  const section = SECTIONS.find((s) => s.id === sectionId);
  try {
    const { system, user } = buildPrompt(sectionId, description, estrategia, instruction);
    const raw = await generateJSON({ system, user, temperature: section?.temperature ?? 0.7, tier: 'default' });
    const payload = sectionId === 'estrategia' ? raw : raw?.[sectionId] ?? raw;
    return { data: postProcess(sectionId, deepFill(payload, fallback)), origin: 'ia' };
  } catch (error) {
    console.warn(`[Analizador] ${sectionId}: usando motor demo`, error);
    return { data: fallback, origin: 'demo', error: error.message };
  }
}

/** Ejecuta el análisis completo. `onSection(id, result)` se llama a medida que llega cada sección. */
export async function runAnalysis(description, { mode = 'ia', onSection } = {}) {
  const results = {};
  const estrategia = await generateSection('estrategia', description, { mode });
  results.estrategia = estrategia;
  onSection?.('estrategia', estrategia);

  // Si la IA dice que la entrada no es un negocio, no seguimos gastando llamadas.
  if (estrategia.data.diagnostico.resumen === 'entrada_no_valida') {
    return { results, invalid: true };
  }

  await Promise.all(
    SECTIONS.filter((s) => s.id !== 'estrategia').map(async (s) => {
      const r = await generateSection(s.id, description, { estrategia: estrategia.data, mode });
      results[s.id] = r;
      onSection?.(s.id, r);
    }),
  );
  return { results, invalid: false };
}

/** Convierte un análisis en un lead jugable por el simulador de ventas. */
export function analysisToLead(analysis) {
  const d = analysis.sections.estrategia.diagnostico;
  const o = analysis.sections.estrategia.oferta;
  const canalesActivos = d.canales.filter((c) => c.estado !== 'ausente').map((c) => c.canal);
  const fmt = (n) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`);
  return {
    id: `analysis-${analysis.id}`,
    icon: '🧭',
    name: d.subnicho,
    nicheName: d.subnicho,
    difficulty: d.dificultad_juego,
    activePain: d.dolores[d.dolor_principal_index]?.dolor,
    pains: d.dolores.map((x) => x.dolor),
    intel: {
      revenue: `$${fmt(d.facturacion_mensual_estimada.usd_min)}-$${fmt(d.facturacion_mensual_estimada.usd_max)}/mo`,
      employees: d.equipo_estimado,
      tech: canalesActivos.join(', ') || 'Sin canales digitales',
    },
    monthly: Math.max(100, Math.round(o.pricing.mensual_recomendado_usd / 10)),
    brief: {
      descripcion: analysis.description,
      decisor: d.decisor,
      objeciones: d.objeciones.map((x) => x.frase_probable),
      nivel_consciencia: d.nivel_consciencia,
      framework_recomendado: o.framework_recomendado,
    },
    fromAnalysis: analysis.id,
  };
}
