# 03 · Copywriting — Especificación para el "Analizador de Negocio"

Alcance: qué copy genera la app a partir de la descripción libre de un negocio, el contrato JSON con Gemini, el prompt de sistema, la nueva rúbrica de `fetchAIEvaluation` y los frameworks nuevos.
Referencia: `Code_1.txt` (`FRAMEWORKS`, `FRAMEWORK_DEFINITIONS`, `fetchAIEvaluation`, `fetchOptimizedProposal`).

## 1. Piezas de copy que genera la app

Orden = secuencia real de venta. Todas en español neutro, tuteo salvo que el negocio sea corporativo/B2B enterprise (usted opcional vía `tono`).

| # | Pieza | Canal | Longitud | Reglas de estilo |
|---|-------|-------|----------|------------------|
| 1 | DM de apertura en frío | IG/LinkedIn/WhatsApp | 40–80 palabras, máx. 4 líneas | 1 observación específica del negocio en la primera línea; 1 solo dolor; sin enlace; termina en pregunta de sí/no de baja fricción ("¿te lo paso?"). Nada de presentarse primero. |
| 2 | Email en frío | Email | Asunto 3–6 palabras en minúscula, cuerpo 70–120 palabras | Asunto sin clickbait ni emojis; framework obligatorio (PAS por defecto); 1 dato numérico; P.D. opcional con prueba social. |
| 3 | Follow-up 1 (día 3) | Mismo canal | 25–50 palabras | Aporta valor nuevo (insight, mini-caso, cálculo); prohibido "solo quería hacer seguimiento". |
| 4 | Follow-up 2 / break-up (día 7) | Email | 30–60 palabras | Cierra el bucle con elegancia; pregunta de salida ("¿lo archivo?"). |
| 5 | Guion de llamada de descubrimiento | Llamada | 8–12 preguntas SPIN + apertura y cierre | Estructura: marco de 30s (agenda + permiso) → S (2–3) → P (2–3) → I (2–3) → N (2) → resumen espejo → siguiente paso. Cada pregunta con `objetivo` y `señal_a_escuchar`. Máx. 25 palabras por pregunta, abiertas. |
| 6 | Pitch de 60 segundos | Llamada/Loom | 130–160 palabras (≈60 s hablado) | BAB: antes (su realidad con cifra) → después (resultado medible con plazo) → puente (mecanismo en 3 pasos con nombre propio). Frases ≤ 18 palabras, para decir en voz alta. |
| 7 | Respuestas a 3 objeciones principales | Llamada/DM | 50–90 palabras c/u | Las 3 más probables PARA ESE negocio (no genéricas). Estructura: validar → aislar ("¿aparte de eso…?") → reencuadrar con número → pregunta de avance. Prohibido discutir o bajar precio de entrada. |
| 8 | CTA final | Todos | 1 frase ≤ 20 palabras + 1 alternativa suave | Un solo siguiente paso concreto (día/hora o duración: "15 min el jueves"). Variante "soft" para leads fríos. |
| 9 | Oferta resumida (one-liner) | Todos | ≤ 25 palabras | Fórmula: "Ayudamos a [quién] a [resultado medible] en [plazo] sin [miedo principal]". Sirve de ancla para el resto de piezas. |

Reglas transversales:
- Cada pieza referencia al menos 1 detalle literal de la descripción del usuario (nombre, nicho, ciudad, herramienta, cifra).
- Si la descripción no trae números, la IA los estima y los marca como supuestos (`supuestos[]`), nunca los presenta como hechos.
- Lectura nivel 6.º–8.º grado; voz activa; segunda persona; 0 signos de exclamación en frío (máx. 1 en follow-up).

## 2. Esquema JSON de la sección `copy`

Gemini con `responseMimeType: "application/json"` y, si se puede, `responseSchema` equivalente. Todos los campos obligatorios; strings sin markdown.

```json
{
  "copy": {
    "framework_principal": "pas|aida|fab|bab|quest|4u|spin|star",
    "tono": "cercano|profesional|ejecutivo",
    "oferta_one_liner": "string (<=25 palabras)",
    "supuestos": ["string"],
    "dm_apertura": {
      "canal": "instagram|linkedin|whatsapp",
      "texto": "string (40-80 palabras)",
      "personalizacion_usada": "string (qué dato del negocio se usó)"
    },
    "email_frio": {
      "asunto": "string (3-6 palabras)",
      "cuerpo": "string (70-120 palabras)",
      "pasos_framework": [{ "paso": "Problema", "fragmento": "string" }]
    },
    "follow_ups": [
      { "dia": 3, "canal": "string", "texto": "string", "valor_aportado": "string" },
      { "dia": 7, "canal": "email", "texto": "string", "valor_aportado": "string" }
    ],
    "guion_descubrimiento": {
      "apertura": "string",
      "preguntas": [
        { "tipo": "S|P|I|N", "pregunta": "string", "objetivo": "string", "senal_a_escuchar": "string" }
      ],
      "resumen_espejo": "string",
      "cierre_siguiente_paso": "string"
    },
    "pitch_60s": {
      "texto": "string (130-160 palabras)",
      "antes": "string", "despues": "string", "puente": "string",
      "mecanismo_nombre": "string"
    },
    "objeciones": [
      {
        "objecion": "string (literal, como la diría el cliente)",
        "tipo": "precio|tiempo|confianza|necesidad|autoridad|competencia",
        "probabilidad": 0.0,
        "respuesta": "string (50-90 palabras)",
        "pregunta_de_avance": "string"
      }
    ],
    "cta": { "principal": "string", "alternativa_suave": "string" },
    "metricas_citadas": [{ "valor": "string", "origen": "descripcion|estimado" }]
  }
}
```
Restricciones: `preguntas` 8–12 con ≥2 de cada tipo; `objeciones` exactamente 3 ordenadas por `probabilidad` desc; `follow_ups` exactamente 2.

## 3. Bloque de system prompt sugerido (generación)

```
Eres un copywriter senior de respuesta directa y closer B2B/B2C con 15 años vendiendo servicios de crecimiento.
Recibes la descripción libre de un negocio. Produce el copy que un closer usará con su DUEÑO/CEO.
Devuelve SOLO JSON válido según el esquema "copy". Nada fuera del JSON.

PROCESO (interno, no lo escribas): 1) identifica nicho, ticket, canal de adquisición y dolor raíz
(el que cuesta dinero medible); 2) define la oferta one-liner; 3) escribe cada pieza derivándola de ella.

REGLAS ANTI-GENÉRICAS (incumplir una = reescribir):
- Prohibido: "espero que estés bien", "llevar tu negocio al siguiente nivel", "soluciones integrales",
  "sinergia", "potenciar", "revolucionar", "game changer", "somos líderes", "¿tienes 5 minutos?",
  "solo quería hacer seguimiento", "no dudes en contactarme", "innovador", "de calidad".
- Cada pieza incluye ≥1 número concreto (%, €/$, días, nº de leads). Sin rangos vagos tipo "mucho más".
  Si el dato no está en la descripción, estímalo de forma conservadora y añádelo a "supuestos".
- Cada pieza menciona ≥1 detalle literal del negocio descrito. Si sirviera para otro negocio, está mal.
- Un dolor por mensaje en frío. Habla del cliente ("tú") 3 veces más que de nosotros ("yo/nosotros").
- No prometas resultados garantizados ni cifras de ingresos imposibles de verificar.

TONO POR CANAL:
- DM: conversacional, frases cortas, sin saludo formal, sin enlaces, pregunta final de sí/no.
- Email: profesional-directo, asunto en minúscula, párrafos de 1-2 líneas.
- Llamada: hablado, frases ≤18 palabras, preguntas abiertas, pausas implícitas.
- Objeciones: empático primero, nunca a la defensiva, terminar siempre en pregunta.
Respeta las longitudes indicadas en el esquema. Idioma: español neutro.
```

## 4. Rúbrica mejorada para `fetchAIEvaluation`

Problema actual: el prompt pide un score 1–100 sin criterios, `reaction` sin enum cerrado y `feedback` libre → notas infladas e inconsistentes, y el umbral de éxito (>65 en lógica, >60 en UI) no se apoya en nada. Además no recibe el canal ni compara con el dolor.

Criterios (suma 100):

| Criterio | Peso | Qué mide | 0 / máx |
|----------|------|----------|---------|
| Ajuste al framework | 25 | Cada paso presente, en orden y con sustancia (ver `pasos`) | Pasos ausentes / todos ≥ 7/10 |
| Relevancia del dolor | 20 | Ataca `activePain` concreto y su coste | Dolor genérico / dolor + consecuencia cuantificada |
| Especificidad | 15 | Números, detalles del nicho, cero clichés | ≥2 clichés / ≥1 número + 1 detalle nicho, 0 clichés |
| Enfoque en cliente | 10 | Ratio tú/yo, beneficio > característica | Habla de sí mismo / ratio ≥ 3:1 |
| CTA | 10 | Único, concreto, baja fricción | Sin CTA o varios / 1 CTA con tiempo acotado |
| Brevedad y canal | 10 | Longitud y tono adecuados al canal | >2x límite / dentro de rango |
| Credibilidad | 10 | Prueba, mecanismo, sin promesas absurdas | Promesa inverosímil / mecanismo + prueba |

Reglas de cálculo: `score = suma(criterios)`; tope 40 si falta CTA o el mensaje no menciona el dolor; −5 por cliché detectado (máx −15). Mapeo de `reaction` determinista: ≥85 `STOKED`, 70–84 `INTERESTED`, 55–69 `SKEPTICAL`, 35–54 `OBJECTION`, <35 `GHOSTED`. Éxito de cierre = `reaction` ∈ {STOKED, INTERESTED} (unificar el umbral en 70). `xp_gained = round(score/4)` + 5 si 0 clichés.

JSON de evaluación (retrocompatible: conserva `score`, `reaction`, `client_reply`, `feedback`, `xp_gained`):

```json
{
  "score": 0,
  "reaction": "STOKED|INTERESTED|SKEPTICAL|OBJECTION|GHOSTED",
  "client_reply": "string (respuesta realista del CEO, 1-3 frases, coherente con reaction)",
  "feedback": "string (resumen de 2-3 frases: lo mejor, lo peor, la próxima acción)",
  "xp_gained": 0,
  "criterios": [
    { "id": "framework|dolor|especificidad|cliente|cta|canal|credibilidad",
      "puntos": 0, "max": 25, "justificacion": "string (<=25 palabras)" }
  ],
  "pasos": [
    { "paso": "Problema", "presente": true, "score": 0, "fragmento_detectado": "string|null",
      "comentario": "string" }
  ],
  "cliches_detectados": ["string"],
  "reescrituras": [
    { "original": "string (cita literal)", "problema": "string",
      "sugerencia": "string", "criterio": "string" }
  ],
  "objecion_probable": "string (lo que respondería el CEO si no compra)",
  "siguiente_ejercicio": "string (una práctica concreta para subir el criterio más bajo)"
}
```
`pasos[].score` 0–10; `reescrituras` entre 1 y 3, solo frases que existen literalmente en el mensaje.

Prompt de evaluación (añadir al actual): pasar `framework` con sus `steps` de `FRAMEWORK_DEFINITIONS`, `nicheName`, `intel`, `activePain` y canal; instrucción "Sé un CEO ocupado y escéptico: la nota media de un junior es 45–60. No regales puntos. Cita literalmente." y temperatura 0.3 para consistencia. `fetchOptimizedProposal` debe reutilizar el system prompt de §3 y recibir `reescrituras` para que la "Propuesta de Titán" corrija exactamente esos fallos.

## 5. Frameworks a añadir

`FRAMEWORKS` (nuevas entradas):
```js
{ id: 'bab',   name: 'BAB',   desc: 'Before, After, Bridge. Pinta el contraste y tiende el puente.' },
{ id: 'quest', name: 'QUEST', desc: 'Qualify, Understand, Educate, Stimulate, Transition. Para leads tibios.' },
{ id: '4u',    name: '4U',    desc: 'Útil, Urgente, Único, Ultra-específico. Para asuntos y ganchos.' },
{ id: 'spin',  name: 'SPIN',  desc: 'Situación, Problema, Implicación, Necesidad. Para descubrimiento.' },
{ id: 'star',  name: 'STAR',  desc: 'Situación, Tarea, Acción, Resultado. Para casos de éxito y prueba social.' }
```
`FRAMEWORK_DEFINITIONS` (mismo formato):
```js
bab: { title: "Framework BAB (Ideal para pitch y transformaciones visibles)", steps: [
  { key: "Before", val: "Describe su situación actual con un dato que le duela reconocer." },
  { key: "After", val: "Muestra el estado deseado con resultado medible y plazo." },
  { key: "Bridge", val: "Presenta tu mecanismo como el camino concreto entre ambos." } ] },
quest: { title: "Framework QUEST (Para prospectos que ya conocen el problema)", steps: [
  { key: "Qualify", val: "Filtra: deja claro para quién es (y para quién no)." },
  { key: "Understand", val: "Demuestra que entiendes su contexto con un detalle específico." },
  { key: "Educate", val: "Enseña un insight que no sabía y reencuadra el problema." },
  { key: "Stimulate", val: "Despierta deseo con prueba o resultado de un caso similar." },
  { key: "Transition", val: "Convierte el interés en un siguiente paso concreto." } ] },
'4u': { title: "Framework 4U (Para asuntos de email y primeras líneas)", steps: [
  { key: "Útil", val: "Promete un beneficio claro para el lector." },
  { key: "Urgente", val: "Da una razón para actuar ahora (coste de esperar, fecha)." },
  { key: "Único", val: "Diferénciate: algo que nadie más le está diciendo." },
  { key: "Ultra-específico", val: "Usa números, nombres y plazos exactos." } ] },
spin: { title: "Framework SPIN (Para llamadas de descubrimiento)", steps: [
  { key: "Situación", val: "Preguntas de contexto: cómo funciona hoy su proceso." },
  { key: "Problema", val: "Preguntas que revelan dificultades e insatisfacción." },
  { key: "Implicación", val: "Preguntas que cuantifican el coste de no resolverlo." },
  { key: "Necesidad", val: "Preguntas que hacen que el cliente verbalice el valor de la solución." } ] },
star: { title: "Framework STAR (Para casos de éxito y prueba social)", steps: [
  { key: "Situación", val: "Cliente similar y su punto de partida con cifra." },
  { key: "Tarea", val: "El reto concreto que había que resolver." },
  { key: "Acción", val: "Qué hiciste, en 2-3 pasos con nombre." },
  { key: "Resultado", val: "Resultado medible y plazo; enlázalo al prospecto." } ] }
```
Nota: SPIN se evalúa sobre un guion/lista de preguntas, no sobre un DM; la UI debe cambiar el placeholder según framework.

## 6. Funcionalidades adicionales (priorizadas)

1. **P1 — Modo "Reescribe y compara"**: tras la evaluación, el jugador reescribe solo las frases de `reescrituras`; se re-evalúa y se muestra el delta por criterio. Bucle de práctica deliberada; reutiliza el JSON nuevo.
2. **P1 — Simulador de objeciones en vivo**: el CEO responde con `objecion_probable` y el jugador contesta en 2–3 turnos; se puntúa con la estructura validar→aislar→reencuadrar→avanzar. Cierra el hueco entre "mensaje" y "cierre".
3. **P2 — Detector de clichés local**: lista de frases prohibidas (la de §3) resaltada en el textarea mientras se escribe, sin coste de API; resta puntos coherentes con la rúbrica.
4. **P2 — Secuencia multicanal**: desde el Analizador, exportar/copiar la cadencia (DM → follow-up día 3 → email día 7 → llamada) con cada pieza lista para pegar.
5. **P3 — Banco de swipes del jugador**: guardar mensajes con score ≥85 por nicho y framework para reutilizarlos como plantillas y medir progreso por criterio a lo largo de los días de juego.
