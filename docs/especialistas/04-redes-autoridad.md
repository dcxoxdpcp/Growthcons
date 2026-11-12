# 04 · Redes Sociales y Autoridad (Marca Personal) — Analizador de Negocio

**Especialista:** estrategia de comunicación en redes y posicionamiento de autoridad.
**Alcance:** sección `marca_personal` de la propuesta que genera el Analizador de Negocio (textarea libre → propuesta que el closer presenta al dueño).
**Encaje con el código actual:** reutiliza el patrón `fetch` a Gemini con `responseMimeType: "application/json"` + `systemInstruction`; conecta con la skill existente `branding` ("Autoridad de Marca"), el recurso 🧠 Autoridad y el nicho `creators` (dolores: esclavitud del algoritmo, audiencia sin dinero, cero emails).

---

## 1. Auditoría que la IA debe inferir del texto

El usuario escribirá cosas como "tengo una clínica dental en Monterrey, subo stories de vez en cuando". La IA debe **inferir con prudencia y marcar qué es supuesto**.

| Dimensión | Qué inferir | Regla |
|---|---|---|
| Plataformas | IG, TikTok, LinkedIn, YouTube (+ WhatsApp/newsletter como canal propio) con estado: `activa`, `esporadica`, `inexistente`, `desconocida` | Si no se menciona → `desconocida`, nunca inventar seguidores. |
| Plataforma prioritaria | Dónde está su comprador: B2B/ticket alto → LinkedIn; local/estético → IG; masivo/joven → TikTok; educativo/evergreen → YouTube | Máximo 2 plataformas núcleo + 1 de reciclaje. |
| Posicionamiento actual | Cómo lo percibe hoy el mercado (p.ej. "un dentista más, compite por precio") | Una frase. |
| Posicionamiento deseado | Categoría que debería ocupar (p.ej. "el referente en diseño de sonrisa para profesionales 30-45") | Una frase, específica, con nicho. |
| Nivel de autoridad 1-5 | Ver escala abajo | Siempre con `justificacion`. |
| Brechas | 3-5 brechas priorizadas por impacto en ventas | Cada una con evidencia del texto o etiqueta `supuesto`. |
| Dependencia del dueño | ¿La marca vive solo en la cara del dueño? (riesgo de burnout, dolor de `infopro`) | `alta/media/baja`. |
| Propiedad de audiencia | ¿Hay email/WhatsApp/lista? | Clave para el dolor "cero propiedad de datos". |

**Escala de autoridad**
1. Invisible: sin perfil o perfil abandonado; vende solo por referidos.
2. Presente: publica sin estrategia; contenido genérico, sin prueba social.
3. Reconocido: nicho claro, publica con constancia, algunos testimonios; aún vende por precio.
4. Referente: casos documentados, invitado en podcasts/colaboraciones, recibe DMs entrantes calificados.
5. Categoría propia: método con nombre, medios/escenarios, lista propia grande, cobra premium.

**Brechas típicas a detectar:** sin statement claro · contenido "qué hago" en vez de "qué resuelvo" · cero prueba social visible · sin CTA ni funnel de DM · sin lead magnet / lista propia · inconsistencia de frecuencia · bio que no convierte · dueño invisible (solo logo).

## 2. Contenido obligatorio de la propuesta (área marca personal)

1. **Statement de posicionamiento** con plantilla `Ayudo a [X específico] a lograr [Y medible] sin [Z objeción/dolor]`. Prohibido X genérico ("empresas", "personas"). Incluir versión bio (≤150 caracteres) para IG/TikTok y headline LinkedIn (≤220).
2. **3-4 pilares de contenido**, cada uno con: nombre, objetivo (`atraer` / `nutrir` / `convertir` / `humanizar`), % del mix, 3 ideas de piezas concretas. Mix recomendado: 40 atraer · 30 nutrir · 20 convertir · 10 humanizar.
3. **Plan de 30 días** por plataforma: formatos (reel, carrusel, story, post texto, short, video largo, live, newsletter), frecuencia semanal y 4 semanas temáticas (S1 posicionamiento, S2 prueba social, S3 objeciones/método, S4 oferta + lead magnet). Frecuencia realista según tamaño del equipo inferido (1 persona → máx. 4 piezas/sem núcleo).
4. **5 hooks listos para usar**, cada uno con tipo (`contrarian`, `error_comun`, `resultado`, `historia`, `curiosidad`, `lista`), plataforma y formato sugerido. Primera línea ≤12 palabras, en el idioma/registro del negocio.
5. **Lead magnet**: nombre, formato (checklist, mini-curso, plantilla, diagnóstico, calculadora), promesa, palabra clave para funnel de DM ("comenta SONRISA y te lo envío"), y secuencia DM en 3 pasos (entrega → pregunta de calificación → invitación a llamada).
6. **Activos de autoridad**: casos de éxito (cómo documentarlos: antes/después, número, testimonio en video), podcast (propio o 3 tipos de podcast donde ser invitado), colaboraciones (perfiles complementarios, no competidores), prensa/eventos/premios si aplica. Cada activo con prioridad y plazo.
7. **Métricas**: norte (DMs calificados/mes o leads desde redes) + de soporte (alcance a no seguidores, guardados+compartidos, CTR bio, suscriptores lista, tasa DM→llamada). Línea base `desconocida` si no hay dato, meta a 30 y 90 días.
8. **Argumento para el closer**: 2-3 frases que conectan la brecha con dinero ("cada mes sin lista propia pagas de nuevo por el mismo cliente") + objeción probable y su respuesta.

## 3. Esquema JSON — sección `marca_personal`

```json
{
  "marca_personal": {
    "auditoria": {
      "plataformas": [
        { "red": "instagram|tiktok|linkedin|youtube|newsletter|whatsapp",
          "estado": "activa|esporadica|inexistente|desconocida",
          "rol": "nucleo|reciclaje|no_prioritaria",
          "motivo": "string" }
      ],
      "posicionamiento_actual": "string",
      "posicionamiento_deseado": "string",
      "nivel_autoridad": 1,
      "justificacion_nivel": "string",
      "dependencia_dueno": "alta|media|baja",
      "audiencia_propia": "si|no|desconocida",
      "brechas": [
        { "brecha": "string", "impacto": "alto|medio|bajo",
          "evidencia": "string", "es_supuesto": true }
      ]
    },
    "posicionamiento": {
      "statement": "Ayudo a ... a ... sin ...",
      "para_quien": "string",
      "resultado": "string",
      "sin_que": "string",
      "bio_corta": "string (<=150 caracteres)",
      "headline_linkedin": "string (<=220 caracteres)"
    },
    "pilares": [
      { "nombre": "string",
        "objetivo": "atraer|nutrir|convertir|humanizar",
        "porcentaje": 40,
        "ideas": ["string", "string", "string"] }
    ],
    "plan_30_dias": {
      "plataformas": [
        { "red": "string",
          "formatos": [ { "formato": "reel|carrusel|story|post_texto|short|video_largo|live|newsletter",
                          "veces_por_semana": 3 } ] }
      ],
      "semanas": [
        { "semana": 1, "tema": "string", "objetivo": "string",
          "piezas_clave": ["string"] }
      ]
    },
    "hooks": [
      { "texto": "string (<=12 palabras primera línea)",
        "tipo": "contrarian|error_comun|resultado|historia|curiosidad|lista",
        "plataforma": "string", "formato": "string" }
    ],
    "lead_magnet": {
      "nombre": "string",
      "formato": "checklist|mini_curso|plantilla|diagnostico|calculadora|guia",
      "promesa": "string",
      "palabra_clave_dm": "string",
      "secuencia_dm": ["string", "string", "string"]
    },
    "activos_autoridad": [
      { "tipo": "caso_exito|podcast|colaboracion|prensa|evento|testimonio_video",
        "accion": "string", "prioridad": "alta|media|baja", "plazo_dias": 30 }
    ],
    "metricas": [
      { "nombre": "string", "es_norte": true,
        "linea_base": "string|desconocida", "meta_30d": "string", "meta_90d": "string" }
    ],
    "argumento_closer": {
      "pitch": "string (2-3 frases, brecha -> dinero)",
      "objecion_probable": "string",
      "respuesta": "string"
    },
    "supuestos": ["string"],
    "confianza": 0.0
  }
}
```

**Restricciones de validación (cliente):** `nivel_autoridad` entero 1-5 · `pilares` 3-4 ítems y `porcentaje` suma 100 · `hooks` exactamente 5 · `semanas` exactamente 4 · `secuencia_dm` 3 pasos · `confianza` 0-1 · máx. 2 plataformas con `rol: "nucleo"`. Si falla, aplicar fallback (como el `catch` actual de `fetchAIEvaluation`) con una plantilla genérica marcada `confianza: 0.2`.

## 4. Bloque de system prompt sugerido

```
ROL: Eres estratega senior de marca personal y autoridad en redes (Instagram, TikTok,
LinkedIn, YouTube) para dueños de negocio. Tu salida la presentará un closer de ventas
al dueño, así que todo debe ser concreto, accionable y conectado con dinero.

ENTRADA: descripción libre de un negocio. Puede ser vaga o incompleta.

REGLAS:
1. Infiere; no inventes datos numéricos (seguidores, ingresos). Si falta un dato usa
   "desconocida" y añádelo a "supuestos". Marca es_supuesto=true en brechas sin evidencia.
2. Elige plataformas según dónde compra su cliente ideal (B2B/ticket alto→LinkedIn,
   local/visual→Instagram, masivo/joven→TikTok, educativo→YouTube). Máx. 2 núcleo.
3. Statement con formato "Ayudo a [X específico] a lograr [Y medible] sin [Z]".
   X nunca genérico. Bio <=150 caracteres.
4. 3-4 pilares que sumen 100% (guía 40 atraer/30 nutrir/20 convertir/10 humanizar).
5. Plan de 30 días realista para el tamaño del equipo inferido; 4 semanas temáticas:
   posicionamiento, prueba social, objeciones/método, oferta+lead magnet.
6. Exactamente 5 hooks, tipos distintos, primera línea <=12 palabras, en el idioma y
   registro del negocio. Nada de clickbait vacío ni promesas ilegales (salud, finanzas).
7. Lead magnet con palabra clave de DM y secuencia de 3 mensajes que termine en llamada.
8. Una métrica norte ligada a ventas (DMs calificados o leads/mes), no a seguidores.
9. "argumento_closer": traduce la brecha principal a coste económico y anticipa 1 objeción.
10. Responde ÚNICAMENTE con JSON válido que siga exactamente el esquema "marca_personal".
    Sin markdown, sin texto adicional.
```

Variables a inyectar (como hace hoy el prompt con `nicheName`/`activePain`): `{descripcion_negocio}`, `{nicho_detectado}` (si el analizador general ya lo clasificó contra `NICHES`), `{idioma}`.

## 5. Funcionalidades adicionales priorizadas

| # | Funcionalidad | Qué hace en el entrenador | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|---|
| 1 | **Modo "Auditoría de Perfil"** | El usuario pega bio + 3 últimos copies de un perfil real; la IA devuelve nivel 1-5, brechas y bio reescrita. Reutiliza el esquema `auditoria` + `posicionamiento`. | Alto | Bajo | **P1** |
| 2 | **Reto "Hook Duel"** | El closer escribe un hook para el lead activo; Gemini lo puntúa (claridad, especificidad, curiosidad, relevancia al dolor) igual que `fetchAIEvaluation`. Da XP y sube 🧠 Autoridad. | Alto | Bajo | **P1** |
| 3 | **Skill "Contenido de Autoridad"** (rama Inbound, junto a `branding`) | Cada nivel añade +X% de leads entrantes en `startNewDay` y desbloquea leads de nivel 4-5 de autoridad (más ticket). Nueva skill en `INITIAL_SKILLS`. | Medio | Bajo | **P2** |
| 4 | **Simulador de Funnel de DM** | Roleplay: la IA actúa como seguidor que comentó la palabra clave; el closer debe llevarlo a llamada en ≤4 mensajes sin sonar a spam. Evalúa calificación y CTA. | Alto | Medio | **P2** |
| 5 | **Nicho "Profesional Local con Marca Personal"** (médico, abogado, coach) | Nuevo item en `NICHES` con dolores: "invisible fuera del boca a boca", "le da vergüenza salir en cámara", "compite por precio en Google". Entrena objeciones de exposición. | Medio | Bajo | **P3** |

**Recomendación de orden:** 1 y 2 primero (alto impacto, reutilizan el pipeline JSON existente y refuerzan la sección `marca_personal`); 3 da sentido de progresión al recurso Autoridad; 4 es el diferencial pedagógico más fuerte pero requiere estado de conversación multi-turno.
