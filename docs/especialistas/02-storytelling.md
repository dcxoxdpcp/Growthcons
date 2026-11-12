# 02 · Especialista en Storytelling — Analizador de Negocio + Entrenamiento

> Ámbito: capa narrativa de la propuesta que genera el "Analizador de Negocio" y evaluación del storytelling en el modo entrenamiento actual (`fetchAIEvaluation`, `fetchOptimizedProposal`, `FRAMEWORKS`).
> Principio rector: **el héroe es el dueño del negocio, nunca el closer**. El closer es el guía (StoryBrand). Toda historia sirve a una decisión: agendar/avanzar la venta.

---

## 1. Cómo la propuesta incorpora narrativa

### 1.1 Esqueleto obligatorio (StoryBrand SB7 adaptado a la llamada)
| Pieza | Qué debe contener la propuesta | Error que el modelo debe evitar |
|---|---|---|
| **Héroe** | El dueño + su deseo concreto (1 frase, en su lenguaje: "llenar la agenda de martes", no "optimizar el funnel") | Convertir a la agencia/closer en el protagonista |
| **Problema en 3 niveles** | Externo (síntoma medible), Interno (cómo se siente), Filosófico ("no es justo que…") | Quedarse solo en el externo |
| **Villano** | Personificar el obstáculo como algo externo al dueño (p.ej. "el algoritmo", "el no-show", "el intermediario"), nunca culpar al dueño | Villano abstracto ("la falta de procesos") o culpar al cliente |
| **Guía** | Empatía (1 frase "entendemos…") + Autoridad (prueba: dato, método, caso ilustrativo) | Autoridad sin empatía = arrogancia |
| **Plan** | 3 pasos máximo, con nombres simples; elimina el riesgo percibido | Planes de 7 fases |
| **Llamada a la acción** | Directa (agendar diagnóstico) + transicional (recurso gratis) | CTA vaga ("hablamos") |
| **Fracaso** | Coste de no actuar a 90 días, cuantificado si hay datos; tono sobrio, no catastrofista | Miedo exagerado que destruye confianza |
| **Éxito** | Imagen concreta del "después" (un día cualquiera del dueño en 6 meses) | Promesas numéricas inventadas |
| **Transformación** | Identidad: de "X" a "Y" ("de dueño-bombero a dueño-inversor") | — |

### 1.2 Selección de framework narrativo según el negocio
El modelo clasifica primero el negocio (`tipo_negocio`) y elige el framework principal + uno de apoyo:

| Señal en la descripción del usuario | Framework principal | Por qué | Apoyo |
|---|---|---|---|
| Dolor agudo y urgente (no-shows, caja, churn) | **PAS + Villano** | Urgencia; el villano canaliza la agitación | SB7 (plan) |
| Dueño fundador, marca personal, infoproductor, creador | **Epiphany Bridge** (Brunson) | Venden creencias; necesitan su propio "momento ajá" | Hero's Journey |
| B2B, ciclo largo, comité de compra, consultoría | **StoryBrand SB7 + caso de éxito (Situación–Complicación–Resolución)** | Muchos decisores: claridad > emoción | Antes/Después con ROI |
| Producto técnico/SaaS/IA, cliente teme la complejidad | **Analogía + Antes/Después/Puente (BAB)** | La analogía baja la carga cognitiva | FAB solo para el anexo |
| Alto ticket, lujo, estatus (real estate, estética premium) | **Hero's Journey de identidad** (transformación de estatus) | Se compra identidad, no función | Epiphany Bridge |
| Desconfianza del sector (solar, "estafas previas") | **Historia de "falso camino" (False Belief → nuevo vehículo)** | Desactivar la objeción "ya me engañaron" | Caso ilustrativo con garantía |
| Negocio local/tradicional (restaurante, taller) | **BAB simple + historia de vecino ("alguien como tú")** | Lenguaje llano, proximidad | SB7 one-liner |

Regla: si la descripción es ambigua, usar **SB7** por defecto y explicarlo en `narrativa.framework.justificacion`.

### 1.3 Reglas de veracidad (no negociables)
- Todo caso de éxito o cifra no aportada por el usuario se marca `"es_ilustrativo": true` y su texto empieza con "Ejemplo ilustrativo:". Prohibido inventar nombres de empresas reales o testimonios atribuidos.
- Los números del "después" se expresan como rangos/hipótesis con supuesto explícito ("si recuperas 3 de cada 10 no-shows…").
- Los datos que faltan van a `preguntas_para_completar_historia`, no se rellenan.

---

## 2. Esquema JSON de la sección `narrativa`

Se devuelve dentro del objeto global de la propuesta (`{ ..., "narrativa": {...} }`). Tipos estilo TypeScript; todos obligatorios salvo `?`. Longitudes en caracteres aprox.

```json
{
  "narrativa": {
    "framework": {
      "principal": "SB7 | PAS_VILLANO | EPIPHANY_BRIDGE | HEROS_JOURNEY | BAB | SCR | FALSO_CAMINO",
      "apoyo": "SB7 | PAS_VILLANO | EPIPHANY_BRIDGE | HEROS_JOURNEY | BAB | SCR | FALSO_CAMINO | null",
      "justificacion": "string (<=200) — por qué encaja con este negocio"
    },
    "personajes": {
      "heroe": { "quien": "string", "deseo": "string (<=120, lenguaje del dueño)" },
      "villano": { "nombre": "string (personificado, <=40)", "descripcion": "string (<=160)" },
      "problema": {
        "externo": "string",
        "interno": "string",
        "filosofico": "string"
      },
      "guia": {
        "empatia": "string (1 frase)",
        "autoridad": "string (prueba concreta; si es inventada => ilustrativa)"
      }
    },
    "one_liner": {
      "texto": "string (<=280) — Problema + Solución + Resultado",
      "problema": "string",
      "solucion": "string",
      "resultado": "string"
    },
    "historia_apertura": {
      "texto": "string (60-120 palabras, hablable en <45 s)",
      "tipo": "EPIPHANY | CLIENTE_SIMILAR | OBSERVACION_DEL_SECTOR | PERSONAL_DEL_CLOSER",
      "pregunta_puente": "string — pregunta que devuelve el foco al dueño tras la historia",
      "es_ilustrativo": "boolean"
    },
    "analogia": {
      "texto": "string (<=200)",
      "concepto_que_explica": "string",
      "dominio_familiar": "string (p.ej. 'cocina', 'fútbol', 'fontanería')"
    },
    "caso_exito": {
      "es_ilustrativo": "boolean (true salvo que el usuario aporte el caso)",
      "etiqueta": "string — 'Ejemplo ilustrativo' si es_ilustrativo",
      "situacion": "string",
      "complicacion": "string",
      "resolucion": "string",
      "resultado": "string (rango + supuesto, nunca cifra exacta inventada)"
    },
    "antes_despues": {
      "antes": ["string (3 viñetas concretas del día a día actual)"],
      "despues": ["string (3 viñetas espejo, mismo orden)"],
      "puente": "string — el mecanismo que conecta ambos (=nuestro plan)",
      "transformacion_identidad": { "de": "string", "a": "string" }
    },
    "plan": [
      { "paso": "integer (1-3)", "nombre": "string (<=30)", "descripcion": "string (<=120)" }
    ],
    "cta": { "directa": "string", "transicional": "string" },
    "riesgo_de_no_actuar": {
      "texto": "string (<=200)",
      "horizonte_dias": "integer (30|90|180)",
      "cuantificado": "boolean"
    },
    "objecion_narrativa": {
      "objecion_probable": "string",
      "historia_respuesta": "string (<=300, mini-historia 'falso camino' o 'cliente similar')"
    },
    "preguntas_para_completar_historia": ["string (máx 5)"],
    "advertencias_veracidad": ["string — qué partes son supuestos"]
  }
}
```

Validación en cliente (sin código aquí, solo reglas): rechazar/regenerar si `caso_exito.es_ilustrativo === true` y `etiqueta` no contiene "ilustrativo"; si `plan.length > 3`; si `antes.length !== despues.length`; si `historia_apertura.texto` supera 150 palabras.

---

## 3. Bloque de system prompt (sección narrativa)

Insertar tras el bloque de diagnóstico del negocio (lo definen otros especialistas). Usar `responseMimeType: "application/json"` y, si se adopta, `responseSchema` equivalente al de §2.

```
### ROL NARRATIVO
Eres además un estratega de storytelling de ventas (StoryBrand SB7, Epiphany Bridge, Hero's Journey, BAB, SCR).
El HÉROE es siempre el dueño del negocio descrito. El closer y su servicio son el GUÍA. Nunca conviertas al closer en protagonista.

### PROCESO
1. Clasifica el negocio y elige framework.principal y framework.apoyo con esta tabla:
   dolor urgente->PAS_VILLANO; fundador/creador/infoproducto->EPIPHANY_BRIDGE; B2B ciclo largo->SB7 (+SCR);
   tech/SaaS/IA con miedo a complejidad->BAB (+analogía); lujo/estatus->HEROS_JOURNEY; sector con desconfianza->FALSO_CAMINO;
   local/tradicional->BAB; ambiguo->SB7. Justifica en <=200 caracteres.
2. Personifica UN villano externo al dueño. Nunca culpes al dueño.
3. Describe el problema en 3 niveles: externo, interno, filosófico.
4. Escribe un one-liner: [problema que siente] + [cómo lo resolvemos] + [resultado deseado], <=280 caracteres.
5. Historia de apertura hablable (60-120 palabras) que termine con una pregunta puente hacia el dueño.
6. Una analogía de un dominio cotidiano que explique el mecanismo de la solución.
7. Caso de éxito en formato Situación-Complicación-Resolución-Resultado.
8. Antes/Después con 3 viñetas espejo y una transformación de identidad "de X a Y".
9. Plan de máximo 3 pasos con nombres simples. CTA directa + transicional.
10. Coste de no actuar sobrio y, si hay datos del usuario, cuantificado con supuesto explícito.

### VERACIDAD (OBLIGATORIO)
- Si no tienes datos reales del usuario, el caso de éxito y la historia de apertura son ILUSTRATIVOS:
  es_ilustrativo=true y el texto empieza por "Ejemplo ilustrativo:".
- Prohibido inventar nombres de empresas reales, testimonios con nombre o cifras exactas. Usa rangos con supuesto ("si...").
- Lo que falte para una historia real va en preguntas_para_completar_historia (máx 5).
- Lista en advertencias_veracidad todo supuesto que hayas hecho.

### ESTILO
Español neutro, frases cortas, lenguaje del sector del dueño, cero jerga de marketing ("funnel", "leverage") salvo que el dueño la use.
Devuelve SOLO el objeto "narrativa" con el esquema indicado, sin texto fuera del JSON.
```

---

## 4. Rúbrica 0-100 para el storytelling del jugador (modo entrenamiento)

Se añade como sub-puntuación `story_score` en `fetchAIEvaluation` (el `score` global puede ponderarla p.ej. 30%). El evaluador devuelve también `story_breakdown` (puntos por criterio) y `story_tip` (1 mejora concreta, reescribiendo una frase del jugador).

| # | Criterio | Pts | 0 | Medio | Máximo |
|---|---|---|---|---|---|
| 1 | **Héroe correcto** | 15 | Habla de sí mismo/"nosotros" > 60% | Mezcla | El CEO es sujeto de la mayoría de frases; usa "tú/tu negocio" |
| 2 | **Villano / obstáculo nítido** | 15 | Ningún obstáculo nombrado | Obstáculo genérico | Obstáculo específico del nicho y del `activePain`, externo al CEO |
| 3 | **Problema en niveles** | 10 | Solo producto | Externo | Externo + interno (emoción) ± filosófico |
| 4 | **Guía creíble** | 10 | Sin empatía ni prueba | Una de las dos | Empatía + autoridad concreta (dato, método, caso marcado) |
| 5 | **Plan claro** | 10 | Sin siguiente paso | Pasos vagos | 1-3 pasos que reducen riesgo |
| 6 | **Stakes (éxito/fracaso)** | 10 | Ausentes | Solo éxito o solo fracaso | Ambos, proporcionados, imagen concreta |
| 7 | **Concreción y sensorialidad** | 10 | Abstracto ("mejorar resultados") | Algún detalle | Escena/imagen/cifra del día a día del CEO |
| 8 | **Coherencia con el framework elegido** | 10 | No se reconoce | Parcial | Las etapas del framework (PAS/AIDA/FAB/SB7…) aparecen en orden |
| 9 | **CTA narrativa** | 5 | Ausente | Genérica | Cierra el arco: invita a dar el primer paso del plan |
| 10 | **Veracidad y tono** | 5 | Promesas falsas/cifras inventadas o manipulación | Exageraciones | Afirmaciones verosímiles; supuestos explícitos |

Penalizaciones: −10 si supera ~180 palabras (los CEO no leen muros); −15 si inventa un testimonio con nombre. Tope inferior 0.
Bandas para el feedback: 0-39 "Folleto" · 40-59 "Pitch" · 60-79 "Historia" · 80-100 "Historia que vende".
Instrucción al evaluador: citar textualmente la frase del jugador que más resta y proponer su reescritura.

---

## 5. Funcionalidades adicionales priorizadas

| Prioridad | Funcionalidad | Impacto | Esfuerzo | Nota de implementación |
|---|---|---|---|---|
| **P1** | **Añadir StoryBrand (SB7) y BAB a `FRAMEWORKS` + `FRAMEWORK_DEFINITIONS`** | Alto | Bajo | SB7: Héroe, Problema, Guía, Plan, CTA, Fracaso, Éxito. BAB: Antes, Después, Puente. Reutiliza el modal de guía existente; solo datos. |
| **P2** | **`story_score` + `story_breakdown` en la evaluación** (rúbrica §4) | Alto | Bajo | Ampliar el JSON del systemPrompt actual; mostrar barra por criterio en la tarjeta de feedback. |
| **P3** | **Reto "One-liner en 280 caracteres"** antes del mensaje completo | Medio-alto | Bajo | Mini-turno de 1 energía: el jugador escribe su one-liner para el lead; IA puntúa claridad (problema+solución+resultado). Entrena síntesis. |
| **P4** | **Villano del lead**: cada `pain` de `NICHES` lleva un `villain` personificado ("El Fantasma del No-Show") mostrado como pista desbloqueable con la skill `hook` | Medio | Bajo-medio | Solo datos en NICHES + pista en UI; refuerza el criterio 2. |
| **P5** | **Biblioteca de "Historias de guerra"**: las propuestas del jugador con `story_score ≥ 80` se guardan como historias reutilizables (etiquetadas por nicho) y nueva skill **"Narrador"** en `INITIAL_SKILLS` que da bonus de autoridad al usarlas | Medio | Medio | Gamifica el hábito de coleccionar casos reales; conecta con `historia_apertura` del Analizador. |

Orden recomendado: P1 → P2 (misma iteración, solo prompts/datos) → P3 → P4 → P5.
