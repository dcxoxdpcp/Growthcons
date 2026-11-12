# Fase 2 — Analizador de Negocio

## 1. Solicitud optimizada

> **Objetivo:** convertir Growth Tutor, además de simulador de ventas, en una herramienta real de preparación comercial.
>
> **Entrada:** un campo de texto libre donde el closer describe *cualquier* negocio (qué vende, a quién, dónde, tamaño, redes, ticket, dolores conocidos).
>
> **Salida:** la propuesta completa que el closer debe presentar al dueño, generada por cuatro especialistas:
>
> | Especialista | Entrega |
> |---|---|
> | Estrategia de marketing | Diagnóstico (modelo, ticket, facturación estimada, consciencia de Schwartz, dolores priorizados con impacto en USD, objeciones en la voz del dueño, preguntas de descubrimiento) + oferta (mecanismo único, entregables, garantía, pricing en 3 niveles, ancla, quick win de 30 días, plan 30/60/90, KPIs, pitch de 30 s) |
> | Storytelling | Villano, problema en 3 niveles, one-liner, historia de apertura, analogía, caso de éxito (marcado como ilustrativo), antes/después, plan en 3 pasos, costo de no actuar |
> | Copywriting | DM en frío, email, 2 seguimientos, guion SPIN, pitch de 60 s, respuesta a 3 objeciones, CTA |
> | Redes y autoridad | Auditoría de presencia digital, statement de posicionamiento, bio, pilares, plan de 30 días, 5 hooks, lead magnet con secuencia de DM, activos de autoridad, métrica norte |
>
> **Restricciones:** español neutro LATAM; ningún número inventado presentado como hecho (rangos + supuestos explícitos); funciona sin clave de IA (modo demo); proveedor de IA intercambiable.
>
> **Integración con el juego:** el negocio analizado se convierte en un lead jugable ("Practicar el cierre"), con su dolor real, objeciones esperadas, framework recomendado y un retainer calculado a partir del pricing sugerido.

## 2. Qué se implementó

- `src/lib/ai/` — capa de IA con contrato de proveedor (`generateJSON`, `generateText`). Gemini es el proveedor actual; para añadir otro (Claude, OpenAI, backend propio) se crea un archivo en `providers/` y se registra en `index.js`. Se elige con `VITE_AI_PROVIDER`.
- `src/features/analyzer/`
  - `prompts.js` — esquemas JSON y system prompts por sección, condensados de `docs/especialistas/`.
  - `analyzer.js` — genera la estrategia primero y las otras tres secciones en paralelo con ella como contexto; normaliza la respuesta (rellena campos faltantes, valida índices, porcentajes y número de hooks); convierte el análisis en lead del simulador.
  - `demoEngine.js` — motor local por arquetipos (11 tipos de negocio, detección de país/moneda, ciudad, seguidores, sucursales, redes) con el mismo esquema que la IA. Es también el respaldo automático si la IA falla.
  - `history.js` — historial en `localStorage` (25 análisis).
  - `exportMarkdown.js` — exportar/copiar la propuesta completa.
  - `AnalyzerView.jsx` — la interfaz: ejemplos, interruptor IA/Demo, pestañas por especialista, regenerar por sección con indicación opcional, botones de copiar en cada pieza, historial, exportar y practicar.
- Simulador (`src/game/`):
  - Rúbrica de 7 criterios del copywriter (+ storytelling) con reacción determinista por nota, reescrituras sugeridas y clichés detectados.
  - Evaluador local heurístico cuando no hay IA (antes devolvía siempre 65 y no se podía cerrar).
  - 6 frameworks nuevos: BAB, StoryBrand, QUEST, 4U, SPIN, STAR.
  - "Copywriting Pro" ahora tiene efecto: +2 puntos por nivel.

### Errores del original corregidos

| Error | Corrección |
|---|---|
| Umbral de éxito inconsistente (>65 en la lógica, >60 en la UI) | Unificado en 70 (`SUCCESS_THRESHOLD`) |
| Sin clave de IA, la nota era siempre 65 → nunca se cerraba un cliente | Evaluador local con rúbrica |
| Los clientes perdidos en el cierre del día seguían cobrando ese día | Solo pagan los clientes que siguen activos |
| Energía mostrada como `/10` fijo | Usa `maxEnergy` |
| "Cerrar ciclo" solo con energía < 2 (con 2 de energía y sin clientes el jugador quedaba bloqueado) | Aparece con energía < 3 |
| "Daily Net" del SaaS ignoraba la skill Arquitectura SaaS | Incluye el bonus |
| La skill Copywriting Pro no hacía nada | +2 puntos por nivel |
| Cashflow en Holding mostraba 250 fijo | Muestra el retainer real |

## 3. Hoja de ruta sugerida (priorizada por el equipo)

| Prioridad | Funcionalidad | Origen | Impacto / esfuerzo |
|---|---|---|---|
| ✅ | **Simulador de objeciones en vivo** — implementado (ver §4) | Copy + Estrategia | Alto / medio |
| P1 | **Reescribe y compara**: reescribir solo las frases marcadas y ver el delta por criterio | Copy | Alto / bajo |
| P1 | **Auditoría de perfil**: pegar la bio y 3 publicaciones de un dueño y recibir diagnóstico de autoridad | Redes | Alto / bajo |
| P1 | **Hook Duel**: 5 hooks contra reloj, puntuados por la IA | Redes | Alto / bajo |
| P2 | **Discovery obligatorio** si la confianza del diagnóstico es < 60: el jugador debe hacer preguntas SPIN antes de proponer | Estrategia | Alto / medio |
| P2 | **Reto de pricing**: el jugador propone precio y se compara con el rango sugerido (3–10% de facturación, ROI ≥ 3x) | Estrategia | Medio / bajo |
| P2 | **Calculadora de ROI** compartible con el prospecto | Estrategia | Medio / bajo |
| P2 | **Reto one-liner en 280 caracteres** (1 ⚡) | Storytelling | Medio / bajo |
| P2 | **Skill "Contenido de Autoridad"** y simulador de funnel por DM | Redes | Medio / medio |
| P3 | **Banco de mensajes ganadores** (≥ 85) por nicho y framework; biblioteca "Historias de guerra" | Copy + Storytelling | Medio / medio |
| P3 | Villano personificado por cada dolor de `NICHES` como pista desbloqueable | Storytelling | Medio / bajo |
| P3 | Persistencia de la partida del jugador y proxy/backend para no exponer la clave de IA en el cliente | Técnico | Alto / medio |

Las especificaciones completas de cada especialista están en `docs/especialistas/`.

## 4. Simulador de objeciones en vivo (implementado)

**Cómo se juega.** El CEO lanza una objeción y el closer responde hasta **3 veces**. Cada respuesta se puntúa de 0 a 25 en cuatro etapas, de 0 a 100 en total:

1. **Validar:** empatizar sin darle la razón al miedo.
2. **Aislar:** confirmar que es la única traba.
3. **Reencuadrar:** costo de no actuar, inversión frente a gasto, prueba o garantía.
4. **Avanzar:** cerrar con una pregunta que proponga un siguiente paso concreto.

**Resistencia del CEO.** Empieza en 60, 70, 80 o 90 según la dificultad del lead, y cada turno cambia en `-(nota - 35) × 0,8`. El trato se gana si la resistencia baja de 25. Se pierde si llega a 100 o se acaban los turnos. El resultado se calcula en `src/game/objections.js`, no lo decide la IA. La IA solo puntúa y redacta las dos réplicas posibles del CEO: una si se convence y otra si sigue resistiendo. Sin IA, un evaluador local puntúa por patrones: empatía, aislamiento, datos, pregunta final y penalización por tono defensivo.

| Entrada | Dónde | Costo | Recompensa |
|---|---|---|---|
| **Rescatar el trato** | Tras una propuesta que no cerró (SKEPTICAL u OBJECTION); usa la objeción probable de la evaluación | 2 ⚡ | XP; si gana, el cliente entra al Holding con 70% de satisfacción |
| **Practicar su objeción** | Tras una propuesta que sí cerró | 2 ⚡ | XP |
| **Entrenar objeciones** | Analizador de Negocio; se elige entre las objeciones reales del análisis y las genéricas (precio, tiempo, confianza, necesidad, autoridad, competencia) | Gratis | XP |

XP de la sesión: suma de las notas / 10, más 20 si se gana. Si el CEO deja en visto (GHOSTED), no hay objeción que responder.
