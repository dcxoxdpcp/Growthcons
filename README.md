# Growth Tutor

Entrenador para closers de ventas: un simulador de agencia de growth y un **Analizador de Negocio**. Describes cualquier negocio y la app arma la propuesta que debes presentar: diagnóstico, oferta, narrativa, copy de venta y estrategia de marca personal.

## Uso

```bash
npm install
cp .env.example .env.local   # añade tu clave de Gemini (opcional)
npm run dev
```

Sin clave, el analizador y el evaluador usan el **modo demo**, con plantillas locales y una rúbrica heurística. La clave queda en el navegador, así que en producción hay que poner un proxy o backend delante.

## Cambiar de proveedor de IA

Toda la app llama a la IA a través de `src/lib/ai/index.js`. Para usar otro modelo:

1. Crea `src/lib/ai/providers/<id>.js` que exporte `{ id, label, generateJSON, generateText }`.
2. Regístralo en `PROVIDERS`.
3. Selecciónalo con `VITE_AI_PROVIDER=<id>`.

## Documentación

- `docs/FASE-2-ANALIZADOR.md`: solicitud optimizada, lo implementado, errores corregidos y hoja de ruta.
- `docs/especialistas/`: especificaciones de los cuatro consultores (estrategia, storytelling, copywriting, redes y autoridad).
