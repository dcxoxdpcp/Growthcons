// Datos del simulador: nichos, frameworks y su definición paso a paso.

export const NICHES = [
  { id: 'infopro', name: 'Infoproductor', icon: '🎓', difficulty: 'Baja', 
    intel: { revenue: '$20k-$50k/mo', employees: '2-5', tech: 'Kajabi, Meta Ads' },
    pains: ['Burnout de Marca: El dueño no puede dejar de publicar.', 'Baja Tasa de Finalización: Alumnos no terminan el curso.', 'CAC Insostenible en Meta Ads.'] },
  { id: 'ecommerce', name: 'E-commerce Streetwear', icon: '👕', difficulty: 'Media', 
    intel: { revenue: '$10k-$30k/mo', employees: '1-3', tech: 'Shopify, Klaviyo' },
    pains: ['Trampa del Inventario: Capital bloqueado en stock muerto.', 'Guerra de Descuentos: Márgenes destruidos.', 'Logística de Pesadilla: 15% de devoluciones.'] },
  { id: 'clinic', name: 'Clínica Estética', icon: '🦷', difficulty: 'Media', 
    intel: { revenue: '$40k-$80k/mo', employees: '5-10', tech: 'WhatsApp Business, CRM Local' },
    pains: ['Cáncer del No-Show: Pacientes no asisten a citas.', 'Leads de Solo Precio en WhatsApp.', 'Incapacidad de delegar la venta.'] },
  { id: 'b2b', name: 'Consultoría B2B', icon: '🏢', difficulty: 'Alta', 
    intel: { revenue: '$50k-$150k/mo', employees: '10-20', tech: 'LinkedIn Sales Nav, Salesforce' },
    pains: ['Ciclos de venta de 6 meses.', 'Commodity B2B: Comparación solo por precio.', 'El Gatekeeper Infranqueable.'] },
  { id: 'ai_agency', name: 'Agencia de IA', icon: '🤖', difficulty: 'Alta', 
    intel: { revenue: '$5k-$15k/mo', employees: '1-2', tech: 'Make, OpenAI API' },
    pains: ['Miedo a la complejidad tecnológica.', 'Falta de casos de uso reales.', 'Resistencia del equipo del cliente.'] },
  { id: 'real_estate', name: 'Real Estate Luxury', icon: '🏰', difficulty: 'Alta', 
    intel: { revenue: '$100k-$500k/mo', employees: '15-30', tech: 'Custom CRM, Zillow' },
    pains: ['Turismo Inmobiliario: Leads sin dinero.', 'Propiedades quemadas en el mercado.', 'Falta de exclusivas con dueños.'] },
  { id: 'microsaas', name: 'Micro-SaaS B2B', icon: '💻', difficulty: 'Experto', 
    intel: { revenue: '$2k-$10k/mo', employees: '1-2', tech: 'AWS, Stripe' },
    pains: ['Churn altísimo por falla de onboarding.', 'Deuda técnica que frena la venta.', 'Ventas artesanales no escalables.'] },
  { id: 'creators', name: 'Marcas Personales', icon: '🤳', difficulty: 'Media', 
    intel: { revenue: '$5k-$100k/mo', employees: '1-5', tech: 'YouTube, Patreon' },
    pains: ['Esclavitud del algoritmo.', 'Audiencia masiva pero sin dinero.', 'Cero propiedad de los datos (emails).'] },
  { id: 'wellness', name: 'Wellness Corp', icon: '🧘', difficulty: 'Alta', 
    intel: { revenue: '$10k-$40k/mo', employees: '3-8', tech: 'Zoom, Teachable' },
    pains: ['Dificultad para medir ROI de salud mental.', 'Estigma de "debilidad" en directivos.', 'RRHH sin presupuesto asignado.'] },
  { id: 'renewables', name: 'Energía Solar', icon: '☀️', difficulty: 'Alta', 
    intel: { revenue: '$100k-$1M/mo', employees: '20-50', tech: 'ERP Industrial, CAD' },
    pains: ['Desconfianza por estafas previas.', 'Burocracia de subvenciones de 12 meses.', 'Falta de opciones de financiación.'] }
];


export const FRAMEWORKS = [
  { id: 'pas', name: 'PAS', desc: 'Problema, Agitación, Solución. Ataca el dolor directo.' },
  { id: 'aida', name: 'AIDA', desc: 'Atención, Interés, Deseo, Acción. Para conversión.' },
  { id: 'fab', name: 'FAB', desc: 'Features, Advantages, Benefits. Centrado en el producto.' },
  { id: 'bab', name: 'BAB', desc: 'Before, After, Bridge. Pinta el contraste y tiende el puente.' },
  { id: 'sb7', name: 'StoryBrand', desc: 'El cliente es el héroe; tú eres el guía con un plan.' },
  { id: 'quest', name: 'QUEST', desc: 'Qualify, Understand, Educate, Stimulate, Transition. Para leads tibios.' },
  { id: '4u', name: '4U', desc: 'Útil, Urgente, Único, Ultra-específico. Para asuntos y ganchos.' },
  { id: 'spin', name: 'SPIN', desc: 'Situación, Problema, Implicación, Necesidad. Para descubrimiento.' },
  { id: 'star', name: 'STAR', desc: 'Situación, Tarea, Acción, Resultado. Para casos de éxito.' }
];


export const FRAMEWORK_DEFINITIONS = {
  pas: {
    title: "Framework PAS (El más efectivo para dolores agudos)",
    steps: [
      { key: "Problema", val: "Identifica el problema principal del cliente claramente." },
      { key: "Agitación", val: "Haz que el cliente sienta las consecuencias de no resolverlo hoy." },
      { key: "Solución", val: "Presenta tu servicio como la medicina específica para ese dolor." }
    ]
  },
  aida: {
    title: "Framework AIDA (Clásico de marketing de respuesta directa)",
    steps: [
      { key: "Atención", val: "Capta el interés con un gancho (hook) disruptivo." },
      { key: "Interés", val: "Muestra datos o insights que mantengan la curiosidad." },
      { key: "Deseo", val: "Explica cómo cambiará su vida/negocio con tu ayuda." },
      { key: "Acción", val: "Una llamada a la acción clara y de baja fricción." }
    ]
  },
  fab: {
    title: "Framework FAB (Ideal para venta de software o sistemas)",
    steps: [
      { key: "Features", val: "Características técnicas de lo que haces." },
      { key: "Advantages", val: "Por qué esas características son mejores que el resto." },
      { key: "Benefits", val: "El resultado final tangible que el cliente obtendrá." }
    ]
  },
  bab: {
    title: "Framework BAB (Ideal para pitch y transformaciones visibles)",
    steps: [
      { key: "Before", val: "Describe su situación actual con un dato que le duela reconocer." },
      { key: "After", val: "Muestra el estado deseado con resultado medible y plazo." },
      { key: "Bridge", val: "Presenta tu mecanismo como el camino concreto entre ambos." }
    ]
  },
  sb7: {
    title: "Framework StoryBrand SB7 (El dueño es el héroe, tú el guía)",
    steps: [
      { key: "Héroe y deseo", val: "Nombra al dueño y lo que quiere lograr, no lo que tú vendes." },
      { key: "Villano y problema", val: "Personifica el obstáculo externo (nunca culpes al dueño) y su coste." },
      { key: "Guía", val: "Muestra empatía (lo entiendo) y autoridad (lo he resuelto antes)." },
      { key: "Plan", val: "Máximo 3 pasos con nombres simples." },
      { key: "Llamada a la acción", val: "Un siguiente paso directo y uno transicional de bajo compromiso." },
      { key: "Éxito vs. fracaso", val: "Qué gana si actúa y qué pierde si no lo hace." }
    ]
  },
  quest: {
    title: "Framework QUEST (Para prospectos que ya conocen el problema)",
    steps: [
      { key: "Qualify", val: "Filtra: deja claro para quién es (y para quién no)." },
      { key: "Understand", val: "Demuestra que entiendes su contexto con un detalle específico." },
      { key: "Educate", val: "Enseña un insight que no sabía y reencuadra el problema." },
      { key: "Stimulate", val: "Despierta deseo con prueba o resultado de un caso similar." },
      { key: "Transition", val: "Convierte el interés en un siguiente paso concreto." }
    ]
  },
  '4u': {
    title: "Framework 4U (Para asuntos de email y primeras líneas)",
    steps: [
      { key: "Útil", val: "Promete un beneficio claro para el lector." },
      { key: "Urgente", val: "Da una razón para actuar ahora (coste de esperar, fecha)." },
      { key: "Único", val: "Diferénciate: algo que nadie más le está diciendo." },
      { key: "Ultra-específico", val: "Usa números, nombres y plazos exactos." }
    ]
  },
  spin: {
    title: "Framework SPIN (Para llamadas de descubrimiento)",
    steps: [
      { key: "Situación", val: "Preguntas de contexto: cómo funciona hoy su proceso." },
      { key: "Problema", val: "Preguntas que revelan dificultades e insatisfacción." },
      { key: "Implicación", val: "Preguntas que cuantifican el coste de no resolverlo." },
      { key: "Necesidad", val: "Preguntas que hacen que el cliente verbalice el valor de la solución." }
    ]
  },
  star: {
    title: "Framework STAR (Para casos de éxito y prueba social)",
    steps: [
      { key: "Situación", val: "Cliente similar y su punto de partida con cifra." },
      { key: "Tarea", val: "El reto concreto que había que resolver." },
      { key: "Acción", val: "Qué hiciste, en 2-3 pasos con nombre." },
      { key: "Resultado", val: "Resultado medible y plazo; enlázalo al prospecto." }
    ]
  }
};

/** Placeholder del textarea según el tipo de framework (SPIN se escribe como guion de preguntas). */
export const FRAMEWORK_PLACEHOLDERS = {
  spin: 'Escribe tu guion de descubrimiento: 2+ preguntas de cada tipo (Situación, Problema, Implicación, Necesidad)...',
  star: 'Cuenta un caso de éxito: Situación, Tarea, Acción, Resultado...',
  '4u': 'Escribe un asunto de email + primeras líneas que cumplan las 4U...',
};
