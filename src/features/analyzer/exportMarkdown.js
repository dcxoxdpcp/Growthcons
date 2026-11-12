// Exporta un análisis completo a Markdown (para pegar en Notion, Google Docs, email...).
import { SECTIONS } from './prompts.js';

const humanize = (key) => {
  const s = String(key).replace(/_/g, ' ').replace(/\bd(\d+)\b/, 'Día $1').replace(/\busd\b/gi, 'USD');
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const isScalar = (v) => v === null || ['string', 'number', 'boolean'].includes(typeof v);
const fmt = (v) => (typeof v === 'boolean' ? (v ? 'sí' : 'no') : typeof v === 'number' ? v.toLocaleString('es') : String(v ?? ''));

function render(value, depth) {
  const heading = '#'.repeat(Math.min(6, depth));
  if (isScalar(value)) return `${fmt(value)}\n`;
  if (Array.isArray(value)) {
    if (value.every(isScalar)) return value.map((v) => `- ${fmt(v)}`).join('\n') + '\n';
    return value
      .map((item) => {
        const entries = Object.entries(item);
        return entries
          .map(([k, v], i) => `${i === 0 ? '- ' : '  '}**${humanize(k)}:** ${isScalar(v) ? fmt(v) : Array.isArray(v) && v.every(isScalar) ? v.map(fmt).join(' · ') : JSON.stringify(v)}`)
          .join('\n');
      })
      .join('\n') + '\n';
  }
  return Object.entries(value)
    .map(([k, v]) => (isScalar(v) ? `**${humanize(k)}:** ${fmt(v)}\n` : `${heading} ${humanize(k)}\n\n${render(v, depth + 1)}`))
    .join('\n');
}

export function analysisToMarkdown(analysis) {
  const date = new Date(analysis.createdAt).toLocaleString('es');
  let md = `# Propuesta comercial — ${analysis.title}\n\n_Generado por Growth Tutor el ${date}_\n\n> ${analysis.description.replace(/\n/g, '\n> ')}\n\n`;
  for (const s of SECTIONS) {
    const data = analysis.sections[s.id];
    if (!data) continue;
    const origin = analysis.origins?.[s.id] === 'demo' ? ' _(modo demo)_' : '';
    md += `## ${s.label}${origin}\n\n${render(data, 3)}\n`;
  }
  return md;
}

export function downloadText(filename, text, mime = 'text/markdown') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para contextos sin permiso de portapapeles (iframes, http).
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
