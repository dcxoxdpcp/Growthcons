// Empaqueta la app en un único HTML autocontenido (JS y CSS en línea) para publicarla
// como página privada de claude.ai (Artifact), que se puede abrir desde el teléfono.
// En ese entorno las llamadas externas y las descargas están bloqueadas, así que se compila
// en modo demo y sin el botón de exportar. Uso: npm run build:artifact
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = 'dist-artifact';
execSync(`npx vite build --outDir ${outDir}/build --emptyOutDir`, {
  stdio: 'inherit',
  env: { ...process.env, VITE_AI_MODE: 'demo', VITE_DISABLE_DOWNLOADS: '1' },
});

const assets = join(outDir, 'build', 'assets');
const files = readdirSync(assets);
const css = readFileSync(join(assets, files.find((f) => f.endsWith('.css'))), 'utf8');
// Un "</script" literal dentro del JS cerraría la etiqueta antes de tiempo.
const js = readFileSync(join(assets, files.find((f) => f.endsWith('.js'))), 'utf8').replace(/<\/script/gi, '<\\/script');

// La página publicada recibe su propio esqueleto <html>/<head>/<body>: aquí solo va el contenido.
const html = `<title>Growth Tutor</title>
<style>
:root { color-scheme: dark; --bg: #000000; --fg: #e2e8f0; }
body { background: var(--bg); color: var(--fg); }
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'growth-tutor.html'), html);
console.log(`OK: ${join(outDir, 'growth-tutor.html')} (${Math.round(html.length / 1024)} KB)`);
