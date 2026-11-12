// Historial de análisis en localStorage (solo en este navegador).
// Toda lectura/escritura va protegida: en modo privado o con almacenamiento bloqueado
// la app sigue funcionando, simplemente sin historial persistente.
const KEY = 'growth-tutor:analyses:v1';
const MAX_ITEMS = 25;

export function loadHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ITEMS)));
  } catch {
    /* almacenamiento lleno o bloqueado: se ignora */
  }
}

export function upsertAnalysis(analysis) {
  const list = loadHistory().filter((a) => a.id !== analysis.id);
  const next = [analysis, ...list].slice(0, MAX_ITEMS);
  save(next);
  return next;
}

export function deleteAnalysis(id) {
  const next = loadHistory().filter((a) => a.id !== id);
  save(next);
  return next;
}
