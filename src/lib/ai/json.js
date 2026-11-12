/** Extrae JSON aunque el modelo lo envuelva en ```json ... ``` o añada texto alrededor. */
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
