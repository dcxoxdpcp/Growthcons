# 01 · Estrategia de Marketing y Oferta: Analizador de Negocio

> Especialista: Estrategia de marketing, posicionamiento y oferta (growth, funnels, pricing).
> Alcance: qué diagnostica la IA a partir del texto libre del usuario y qué oferta debe recomendar al closer.
> Encaje con el código actual: el resultado debe poder convertirse en un `currentLead` compatible
> (`nicheName`, `activePain`, `intel {revenue, employees, tech}`, `pains[]`) para que `fetchAIEvaluation`,
> `handleOutreach` y el Holding sigan funcionando sin cambios de lógica. Hoy `monthly: 250` está fijo;
> el pricing del análisis debe alimentar ese valor.

---

## 1. Diagnóstico: qué debe inferir la IA del negocio

Regla general: el usuario escribe 1-3 líneas. La IA **infiere** lo que falta, pero debe marcar cada
inferencia con un nivel de confianza y nunca inventar cifras como hechos. Todo número es un rango estimado.

| Campo | Qué es | Por qué importa al closer |
|---|---|---|
| Resumen del negocio | Una frase: qué vende, a quién, dónde | Comprueba que la IA entendió el input |
| Industria / subnicho | Categoría + subnicho (p.ej. "Alimentos > panadería artesanal") | Permite mapear a un `NICHES` existente o crear uno nuevo |
| Modelo de negocio | B2C, B2B, B2B2C, marketplace | Cambia ciclo de venta y quién decide |
| Modelo de ingresos | Transaccional, recurrente, proyecto, high-ticket, mixto | Define qué palanca de growth atacar (frecuencia, ticket o retención) |
| Ticket promedio estimado | Rango min-max en moneda local + USD | Base del pricing y del ROI |
| Facturación mensual estimada | Rango + supuestos usados | Determina cuánto puede pagar el dueño (regla: fee <= 5-10% de facturación) |
| Etapa de madurez | `idea`, `validacion`, `traccion`, `escala`, `consolidado` | El mismo servicio se vende distinto a cada etapa |
| Tamaño de equipo | Rango | Capacidad de ejecutar; si es 1-3, vender "hecho por ti" |
| Ubicación y alcance | Local, regional, nacional, online global | Canales y CAC razonables |
| ICP del cliente final | Quién le compra al negocio: demografía, situación, motivación, frecuencia | La oferta del closer debe hablar del cliente de su cliente |
| Decisor | Quién firma (dueño, socio, gerente) y su perfil psicológico | Adapta el tono del pitch |
| Canales actuales | Lista con estado: `activo`, `subutilizado`, `ausente` | Detecta la oportunidad más barata |
| Activos infrautilizados | Seguidores, base de clientes, reseñas, ubicación, WhatsApp | Fuente típica del quick win |
| Dolores probables | 3-5, cada uno con urgencia 1-5, impacto económico y evidencia en el input | El closer abre con el dolor de mayor urgencia x impacto |
| Deseo principal (dream outcome) | Lo que el dueño quiere de verdad (más sucursales, libertad, vender el negocio) | Ancla emocional del pitch |
| Nivel de consciencia (Schwartz) | `inconsciente`, `consciente_problema`, `consciente_solucion`, `consciente_producto`, `muy_consciente` | Define cómo abrir la conversación |
| Sofisticación de mercado | 1-5 (cuántas promesas similares ha oído) | Si es 4-5, vender mecanismo único, no promesa |
| Objeciones probables | 3-5, tipo (`precio`, `tiempo`, `confianza`, `ya_lo_intente`, `no_es_prioridad`, `decisor`) + respuesta sugerida | Material directo para el roleplay |
| Competencia / alternativas | Qué hace hoy en lugar de contratar (nada, sobrino, agencia, ads propios) | El verdadero competidor del closer |
| Señales de riesgo | Red flags (sin presupuesto, negocio en declive, decisor ausente) | Evita vender a quien no debe |
| Score de oportunidad | 0-100 + justificación corta | Prioriza leads y dificultad del juego |
| Confianza del diagnóstico | 0-100 + lista de datos faltantes | Si < 50, sugerir preguntas de descubrimiento |

**Heurística de urgencia (1-5):** 5 = pierde dinero hoy de forma visible (no-shows, stock muerto);
3 = estancamiento; 1 = mejora deseable sin coste actual. Prioridad = urgencia x impacto económico.

**Mapeo de Schwartz a apertura recomendada:**
- inconsciente: abrir con dato/insight del sector ("las panaderías con 2 locales pierden X por...").
- consciente del problema: agitar el dolor (encaja con PAS).
- consciente de la solución: diferenciar el mecanismo (encaja con FAB).
- consciente del producto / muy consciente: oferta directa + garantía + urgencia (encaja con AIDA).

La IA debe recomendar el framework (`pas` | `aida` | `fab`) en función de este nivel.

---

## 2. Estructura de la oferta recomendada

Basada en la ecuación de valor (resultado soñado x probabilidad percibida / tiempo x esfuerzo):
subir resultado y certeza, bajar tiempo y esfuerzo del dueño.

1. **Nombre de la oferta**: con resultado + plazo ("Sistema Panadería Llena en 90 días"), no "servicio de marketing".
2. **Servicio núcleo**: una categoría principal (`adquisicion`, `conversion`, `retencion`, `reactivacion`,
   `automatizacion`, `posicionamiento`) ligada al dolor #1. Una sola; lo demás son bonos.
3. **Mecanismo único**: el "cómo" con nombre propio (p.ej. "Método Horno Abierto: preventa por WhatsApp").
4. **Entregables**: 3-6, cada uno con plazo y resultado observable. Nada abstracto ("estrategia", "branding").
5. **Bonos**: 1-3 que eliminan objeciones concretas (bono contra objeción de tiempo, de confianza, etc.).
6. **Garantía**: tipo (`incondicional`, `condicional`, `por_desempeno`, `de_servicio`) + condición exacta.
   Ej.: "Si en 60 días no generamos 150 pedidos por WhatsApp, trabajamos gratis hasta lograrlo".
7. **Pricing sugerido** en tres niveles (good/better/best):
   - Setup único (rango) + mensualidad (rango) o fee por desempeño (% o por resultado).
   - Regla de cordura: mensualidad entre 3% y 10% de la facturación estimada; ROI esperado >= 3x en 6 meses.
   - Moneda local + equivalente USD.
8. **Ancla de precio**: valor comparativo creíble (coste de un empleado de marketing, de una agencia,
   o del dinero perdido por el dolor en 12 meses). Debe expresarse como cifra y frase.
9. **Quick win de 30 días**: una acción concreta, de bajo esfuerzo, que use un activo infrautilizado,
   con métrica y valor esperado ("Campaña de reactivación a 3k seguidores: 40-80 pedidos extra").
10. **Plan 30/60/90**: un hito por tramo.
11. **KPIs**: 3-5, cada uno con línea base estimada, meta y plazo (p.ej. pedidos/semana, CAC, tasa de recompra, no-show).
12. **CTA de cierre**: siguiente paso de baja fricción (diagnóstico gratuito de 20 min, piloto pagado).
13. **Pitch de 30 segundos**: listo para usar, en el framework recomendado.

**Anti-patrones que la IA no debe proponer:** retainers mayores que el 15% de la facturación estimada,
garantías de facturación ilimitadas, más de un servicio núcleo, entregables sin métrica, jerga sin traducir.

---

## 3. Esquema JSON (diagnóstico + oferta)

Tipos: `string`, `number`, `integer`, `boolean`, enum entre comillas con `|`, `[]` = array.
Todas las claves son obligatorias; si no hay dato, usar `null` en números y `"desconocido"` en strings.
Para Gemini se puede pasar como `responseSchema` (tipo OpenAPI) además de `responseMimeType`.

```json
{
  "schema_version": "1.0",
  "diagnostico": {
    "resumen": "string",
    "industria": "string",
    "subnicho": "string",
    "niche_id_match": "infopro|ecommerce|clinic|b2b|ai_agency|real_estate|microsaas|creators|wellness|renewables|nuevo",
    "modelo_negocio": "B2C|B2B|B2B2C|marketplace",
    "modelo_ingresos": "transaccional|recurrente|proyecto|high_ticket|mixto",
    "moneda": "string (ISO 4217, p.ej. MXN)",
    "ticket_promedio": { "min": "number", "max": "number", "usd_min": "number", "usd_max": "number" },
    "facturacion_mensual_estimada": { "min": "number", "max": "number", "usd_min": "number", "usd_max": "number", "supuestos": "string" },
    "etapa_madurez": "idea|validacion|traccion|escala|consolidado",
    "equipo_estimado": "string (rango, p.ej. '6-12')",
    "alcance_geografico": "local|regional|nacional|online_global",
    "icp_cliente_final": {
      "descripcion": "string",
      "motivacion_compra": "string",
      "frecuencia_compra": "string"
    },
    "decisor": { "rol": "string", "perfil": "string" },
    "canales": [
      { "canal": "string", "estado": "activo|subutilizado|ausente", "nota": "string" }
    ],
    "activos_infrautilizados": ["string"],
    "dolores": [
      {
        "dolor": "string",
        "urgencia": "integer 1-5",
        "impacto_mensual_usd": "number|null",
        "evidencia": "string (qué del input lo sugiere o 'inferido')"
      }
    ],
    "dolor_principal_index": "integer (índice en dolores[])",
    "deseo_principal": "string",
    "nivel_consciencia": "inconsciente|consciente_problema|consciente_solucion|consciente_producto|muy_consciente",
    "sofisticacion_mercado": "integer 1-5",
    "objeciones": [
      {
        "tipo": "precio|tiempo|confianza|ya_lo_intente|no_es_prioridad|decisor",
        "frase_probable": "string (como lo diría el dueño)",
        "respuesta_sugerida": "string"
      }
    ],
    "alternativa_actual": "string",
    "red_flags": ["string"],
    "score_oportunidad": "integer 0-100",
    "dificultad_juego": "Baja|Media|Alta|Experto",
    "confianza_diagnostico": "integer 0-100",
    "datos_faltantes": ["string"],
    "preguntas_descubrimiento": ["string (3-5)"]
  },
  "oferta": {
    "nombre": "string",
    "servicio_nucleo": "adquisicion|conversion|retencion|reactivacion|automatizacion|posicionamiento",
    "mecanismo_unico": "string",
    "promesa": "string (resultado + plazo)",
    "entregables": [
      { "entregable": "string", "plazo_dias": "integer", "resultado_observable": "string" }
    ],
    "bonos": [
      { "bono": "string", "objecion_que_elimina": "precio|tiempo|confianza|ya_lo_intente|no_es_prioridad|decisor" }
    ],
    "garantia": {
      "tipo": "incondicional|condicional|por_desempeno|de_servicio",
      "texto": "string",
      "condicion_cliente": "string"
    },
    "pricing": {
      "moneda": "string",
      "niveles": [
        {
          "nombre": "string",
          "setup_min": "number",
          "setup_max": "number",
          "mensual_min": "number",
          "mensual_max": "number",
          "fee_desempeno": "string|null",
          "incluye": ["string"]
        }
      ],
      "nivel_recomendado_index": "integer",
      "mensual_recomendado_usd": "number (alimenta client.monthly en el juego)",
      "pct_sobre_facturacion": "number",
      "roi_esperado_6m": "number (múltiplo, p.ej. 3.5)",
      "justificacion": "string"
    },
    "ancla_precio": { "valor": "number", "concepto": "string", "frase": "string" },
    "quick_win_30d": {
      "accion": "string",
      "activo_que_usa": "string",
      "metrica": "string",
      "resultado_esperado": "string",
      "esfuerzo_dueno": "bajo|medio|alto"
    },
    "plan_30_60_90": { "d30": "string", "d60": "string", "d90": "string" },
    "kpis": [
      { "kpi": "string", "linea_base": "string", "meta": "string", "plazo_dias": "integer" }
    ],
    "framework_recomendado": "pas|aida|fab",
    "razon_framework": "string",
    "cta_cierre": "string",
    "pitch_30s": "string"
  }
}
```

**Mapeo a `currentLead` del juego:**
`nicheName = diagnostico.subnicho`, `activePain = dolores[dolor_principal_index].dolor`,
`pains = dolores.map(d => d.dolor)`, `intel.revenue = facturacion_mensual_estimada (formateado)`,
`intel.employees = equipo_estimado`, `intel.tech = canales activos unidos por coma`,
`difficulty = dificultad_juego`, y al cerrar: `monthly = oferta.pricing.mensual_recomendado_usd`.

---

## 4. System prompt sugerido (bloque diagnóstico + oferta)

```
Eres "Logos", estratega senior de growth y diseño de ofertas para dueños de PyMEs
hispanohablantes. Recibirás la descripción libre de un negocio escrita por un vendedor (closer).
Tu trabajo: diagnosticar el negocio y diseñar la oferta que ese closer debe presentar al dueño.

REGLAS:
1. Responde ÚNICAMENTE con JSON válido que siga EXACTAMENTE el esquema proporcionado. Sin texto extra.
2. Todo número es una ESTIMACIÓN en rango. Explica los supuestos en "supuestos". Nunca presentes
   una inferencia como hecho; en "evidencia" indica qué parte del input la sugiere o escribe "inferido".
3. Usa la moneda del país mencionado (o USD si no hay país) y da siempre el equivalente en USD.
4. Prioriza dolores por urgencia (1-5) x impacto económico. El dolor principal guía toda la oferta.
5. Un solo servicio núcleo. Entregables con plazo y resultado medible. Prohibido "estrategia" o
   "branding" como entregable sin métrica.
6. Pricing: tres niveles. La mensualidad recomendada debe estar entre 3% y 10% de la facturación
   mensual estimada (nunca > 15%). ROI esperado a 6 meses >= 3x; si no se puede, dilo en "justificacion"
   y baja el precio o propone fee por desempeño.
7. El ancla de precio debe ser creíble y local (coste de un empleado, de una agencia o del dolor en 12 meses).
8. El quick win de 30 días debe usar un activo que el negocio YA tiene y requerir esfuerzo bajo del dueño.
9. Determina el nivel de consciencia de Schwartz y recomienda framework: consciente_problema→pas,
   consciente_solucion→fab, consciente_producto/muy_consciente→aida, inconsciente→pas con apertura de insight.
10. Objeciones en la voz real del dueño (coloquial, regional) con respuesta breve y concreta.
11. Si la descripción es ambigua o pobre, baja "confianza_diagnostico", llena "datos_faltantes" y
    "preguntas_descubrimiento", pero entrega igualmente la mejor oferta posible.
12. Si el input no describe un negocio o pide algo ilegal/dañino, devuelve el JSON con
    "confianza_diagnostico": 0 y "resumen": "entrada_no_valida".
13. Español neutro latinoamericano, directo, sin jerga sin traducir.
```

Parámetros recomendados: `temperature` 0.4-0.6 (consistencia en números), `responseMimeType: application/json`
y `responseSchema` con el esquema anterior. Validar en cliente: rangos min <= max, índices dentro de
array, enums válidos; si falla, un reintento y después fallback local con el `NICHES` más parecido.

---

## 5. Funcionalidades adicionales priorizadas

| # | Funcionalidad | Descripción | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|---|---|
| 1 | **Lead desde el Analizador** | Botón "Practicar con este negocio": convierte el diagnóstico en `currentLead` (ver mapeo) y lanza el roleplay actual. El `monthly` del cliente cerrado sale del pricing recomendado, no de 250 fijo. | Alto | Bajo | P1 |
| 2 | **Simulador de objeciones** | El dueño virtual responde con una de las `objeciones` del diagnóstico; el closer debe rebatirla. Se puntúa con la `respuesta_sugerida` como referencia. +XP por objeción superada. | Alto | Medio | P1 |
| 3 | **Constructor de oferta (reto de pricing)** | Antes de ver la oferta de la IA, el jugador propone servicio núcleo, garantía y precio. La IA compara con su oferta y puntúa: precio dentro de rango, garantía creíble, ancla. Enseña pricing. | Alto | Medio | P2 |
| 4 | **Discovery primero** | Si `confianza_diagnostico` < 60, el jugador debe hacer 3 `preguntas_descubrimiento` al dueño simulado antes de proponer; las respuestas enriquecen el diagnóstico. Entrena escucha antes de vender. | Medio | Medio | P2 |
| 5 | **Calculadora de ROI en vivo** | Tarjeta que muestra ancla vs. precio vs. ROI 6m con sliders (ticket, conversiones extra). Visual, sin IA adicional; da argumentos numéricos al closer. | Medio | Bajo | P2 |
| 6 | **Escalera de consciencia** | Mini-reto: el jugador clasifica el nivel Schwartz del negocio antes de ver la respuesta; acierto = bonus de Autoridad (XP). Refuerza la elección de framework. | Medio | Bajo | P3 |

Orden de implementación sugerido: 1 → 5 → 2 → 6 → 3 → 4 (primero lo de bajo esfuerzo que conecta
el Analizador con el loop actual; después las mecánicas que requieren nuevas llamadas a la IA).

---

## 6. Ejemplo breve (validación mental)

Input: "panadería artesanal en Monterrey con 2 locales y 3k seguidores en Instagram".
Salida esperada en lo esencial: B2C transaccional, MXN, ticket 120-250 MXN, facturación 350k-700k MXN/mes,
etapa `traccion`, Instagram `subutilizado`, WhatsApp `ausente`; dolor principal "ventas planas entre semana /
merma diaria" (urgencia 4); consciencia `consciente_problema` → `pas`; servicio núcleo `reactivacion`;
quick win "preventa semanal por WhatsApp a seguidores + pedido anticipado"; mensual recomendado 15k-30k MXN
(~4% de facturación); ancla: sueldo de un community manager + coste de la merma anual.
