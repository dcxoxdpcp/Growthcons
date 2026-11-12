// Proveedor Claude para la versión publicada como página de claude.ai (Artifact).
// Usa la capacidad "sample" del visor: la página consulta a Claude con la cuenta de quien la abre,
// sin clave de API ni servidor propio. La primera llamada pide permiso al usuario.
// Contrato: { id, label, isAvailable(), generateJSON(opts), generateText(opts) }.
// opts: { system, user, tier?: 'quick'|'default'|'complex' } — "temperature" no aplica aquí.

const ERROR_MESSAGES = {
  not_granted: 'No se dio permiso a esta página para usar Claude. Recarga la página y acepta el permiso.',
  sampling_disabled: 'Claude no está disponible para esta cuenta u organización.',
  not_declared: 'Esta versión de la página no tiene habilitado el acceso a Claude.',
  capability_disabled: 'El acceso a Claude no está disponible en esta vista.',
  rate_limited: 'Demasiadas solicitudes o se alcanzó el límite de uso. Espera unos minutos e inténtalo de nuevo.',
  session_expired: 'Tu sesión expiró. Vuelve a iniciar sesión en claude.ai.',
  refused: 'Claude no aceptó esta solicitud. Reformula el texto e inténtalo de nuevo.',
  invalid_json: 'La respuesta de Claude no tuvo el formato esperado. Inténtalo de nuevo.',
  empty_completion: 'Claude no devolvió contenido. Inténtalo de nuevo.',
  prompt_too_large: 'El texto es demasiado largo. Acórtalo.',
  cancelled: 'Solicitud cancelada.',
  unavailable: 'Esta vista no puede usar Claude: abre la página dentro de claude.ai.',
};

export class AIError extends Error {
  constructor(code, message) {
    super(message || ERROR_MESSAGES[code] || 'Error temporal al contactar a Claude. Inténtalo de nuevo.');
    this.code = code;
  }
}

let samplePromise;
function getSample() {
  if (!samplePromise) {
    samplePromise = typeof window !== 'undefined' && window.claude?.use
      ? window.claude.use('sample').catch(() => null)
      : Promise.resolve(null);
  }
  return samplePromise;
}

const toAIError = (e) => (e instanceof AIError ? e : new AIError(e?.code || 'upstream_error'));

// No hay "system prompt" controlable: las instrucciones van al inicio de la entrada.
const buildInput = (system, user) => `${system}\n\n---\n\n${user}`;

async function generateJSON({ system, user, tier = 'default' }) {
  const sample = await getSample();
  if (!sample) throw new AIError('unavailable');
  try {
    // cache:false — "Generar" y "Regenerar" deben producir siempre una respuesta nueva.
    return await sample.json(buildInput(system, user), { modelTier: tier, cache: false });
  } catch (e) {
    throw toAIError(e);
  }
}

async function generateText({ system, user, tier = 'default' }) {
  const sample = await getSample();
  if (!sample) throw new AIError('unavailable');
  try {
    const { text } = await sample(buildInput(system, user), { modelTier: tier, cache: false });
    return text;
  } catch (e) {
    throw toAIError(e);
  }
}

export default {
  id: 'claude-artifact',
  label: 'Claude',
  isAvailable: async () => (await getSample()) !== null,
  generateJSON,
  generateText,
};
