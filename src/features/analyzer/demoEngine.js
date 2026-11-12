// Motor local "sin IA" del Analizador de Negocio.
// Genera una propuesta con plantillas a partir de palabras clave del texto, usando EXACTAMENTE
// el mismo esquema que la IA (ver prompts.js). Se usa en modo demo o si el proveedor falla.

const ARCHETYPES = [
  {
    id: 'comida', re: /panader|restaur|caf[eé]|pizz|taquer|comida|cocina|reposter|pasteler|helad|hamburgues|sushi|food|bar\b/i,
    niche: 'nuevo', industria: 'Alimentos y bebidas', modelo: 'B2C', ingresos: 'transaccional', ticket: [5, 20], fact: [8000, 40000],
    alcance: 'local', decisor: 'Dueño-operador que está en el mostrador o la cocina',
    icp: 'Vecinos y oficinistas de la zona que compran por cercanía y antojo', motivacion: 'Calidad, cercanía y sentirse reconocidos',
    dolores: [
      ['Ventas planas entre semana: los locales se llenan solo el fin de semana', 4, 2500],
      ['Merma diaria por producir sin pedidos anticipados', 4, 1500],
      ['Dependencia de apps de delivery que se quedan con 25-30% de cada pedido', 3, 1800],
    ],
    deseo: 'Llenar los días valle con clientes que vuelven sin depender de apps',
    villano: ['La Comisión Invisible', 'Las apps de delivery y el algoritmo que deciden quién te ve y cuánto ganas'],
    servicio: 'reactivacion', mecanismo: 'Sistema Mostrador-a-WhatsApp', fwOferta: 'pas', fwNarr: 'BAB', fwCopy: 'pas',
    quick: ['Preventa semanal por WhatsApp a los clientes y seguidores actuales con pedido anticipado', 'Lista de clientes frecuentes + perfil de Instagram'],
    analogia: ['Es como pasar de esperar a que pasen peces frente al local a tener tu propio estanque.', 'Base de clientes propia vs. tráfico prestado'],
    plataformas: [['instagram', 'nucleo'], ['whatsapp', 'nucleo'], ['tiktok', 'reciclaje']],
    magnet: ['Club del pan de la semana', 'diagnostico', 'Reserva tu pedido del día antes de que se agote', 'CLUB'],
  },
  {
    id: 'salud', re: /cl[ií]nica|dent|est[eé]tic|spa\b|fisio|nutri[oó]|psic[oó]l|m[eé]dic|consultorio|dermat|barber|sal[oó]n|uñas|odontol|veterin/i,
    niche: 'clinic', industria: 'Salud y estética', modelo: 'B2C', ingresos: 'transaccional', ticket: [40, 300], fact: [15000, 80000],
    alcance: 'local', decisor: 'Profesional titular que también atiende pacientes',
    icp: 'Pacientes de 25-55 años que buscan un resultado visible y confianza', motivacion: 'Confianza en el profesional y resultados comprobables',
    dolores: [
      ['Citas perdidas (no-shows) que dejan huecos en la agenda', 5, 3000],
      ['Leads de WhatsApp que solo preguntan precio y desaparecen', 4, 2500],
      ['El titular no puede delegar la venta: todo depende de su tiempo', 3, 2000],
    ],
    deseo: 'Agenda llena con pacientes que llegan ya convencidos y pagan valor, no precio',
    villano: ['El Cazador de Precios', 'La cultura del "¿cuánto cuesta?" que convierte tu experiencia en una mercancía'],
    servicio: 'conversion', mecanismo: 'Protocolo Agenda Blindada', fwOferta: 'pas', fwNarr: 'PAS_VILLANO', fwCopy: 'pas',
    quick: ['Secuencia de confirmación y recordatorio por WhatsApp + reactivación de pacientes de los últimos 12 meses', 'Base de pacientes históricos'],
    analogia: ['Una agenda sin confirmaciones es como un avión que vende asientos sin check-in: despega medio vacío.', 'Confirmación y compromiso previo'],
    plataformas: [['instagram', 'nucleo'], ['whatsapp', 'nucleo'], ['tiktok', 'reciclaje']],
    magnet: ['Evaluación gratuita de 15 minutos', 'diagnostico', 'Descubre qué tratamiento necesitas antes de gastar', 'EVALUACION'],
  },
  {
    id: 'ecommerce', re: /tienda|ropa|e-?commerce|shopify|boutique|zapat|joyer|cosm[eé]t|venta online|marca de|accesorios|streetwear/i,
    niche: 'ecommerce', industria: 'Comercio electrónico', modelo: 'B2C', ingresos: 'transaccional', ticket: [25, 90], fact: [10000, 50000],
    alcance: 'nacional', decisor: 'Fundador que maneja producto, anuncios y operación',
    icp: 'Compradores de 18-35 años que descubren marcas en Instagram y TikTok', motivacion: 'Identidad, tendencia y prueba social',
    dolores: [
      ['Costo por adquisición en Meta Ads que se come el margen', 5, 3000],
      ['Clientes que compran una vez y nunca regresan', 4, 2500],
      ['Capital atrapado en inventario que no rota', 3, 2000],
    ],
    deseo: 'Vender más a los mismos clientes y depender menos de los anuncios',
    villano: ['El Impuesto de Meta', 'Pagar cada mes por volver a conquistar a clientes que ya te compraron'],
    servicio: 'retencion', mecanismo: 'Motor de Recompra 90', fwOferta: 'aida', fwNarr: 'PAS_VILLANO', fwCopy: 'aida',
    quick: ['Flujos de email/WhatsApp de carrito abandonado y segunda compra sobre la lista actual', 'Base de compradores y tráfico actual'],
    analogia: ['Gastar todo en anuncios sin retención es llenar una cubeta con agujeros.', 'Retención antes que adquisición'],
    plataformas: [['instagram', 'nucleo'], ['tiktok', 'nucleo'], ['newsletter', 'reciclaje']],
    magnet: ['Acceso anticipado al próximo drop', 'guia', 'Entérate antes que nadie y con precio de lanzamiento', 'DROP'],
  },
  {
    id: 'educacion', re: /curso|mentor|coach|academia|escuela|clases|formaci[oó]n|infoproduct|programa online|taller/i,
    niche: 'infopro', industria: 'Educación e infoproductos', modelo: 'B2C', ingresos: 'high_ticket', ticket: [200, 2000], fact: [10000, 50000],
    alcance: 'online_global', decisor: 'Experto-fundador que es la cara de la marca',
    icp: 'Profesionales que quieren un resultado concreto y rápido', motivacion: 'Transformación y estatus',
    dolores: [
      ['El fundador no puede dejar de publicar: si para, paran las ventas', 5, 4000],
      ['Lanzamientos irregulares con ingresos de montaña rusa', 4, 3000],
      ['Alumnos que no terminan el programa y no generan testimonios', 3, 1500],
    ],
    deseo: 'Ingresos predecibles sin estar atado a la cámara todos los días',
    villano: ['La Rueda del Contenido', 'La exigencia de publicar todos los días para que el algoritmo no te olvide'],
    servicio: 'adquisicion', mecanismo: 'Embudo Evergreen de Autoridad', fwOferta: 'pas', fwNarr: 'EPIPHANY_BRIDGE', fwCopy: 'pas',
    quick: ['Webinar evergreen con el mejor contenido ya grabado + secuencia de DMs a interesados', 'Contenido y lista de interesados existentes'],
    analogia: ['Vender solo en lanzamientos es como abrir tu restaurante tres días al año.', 'Ventas evergreen'],
    plataformas: [['instagram', 'nucleo'], ['youtube', 'nucleo'], ['newsletter', 'reciclaje']],
    magnet: ['Clase gratuita de 20 minutos', 'mini_curso', 'El primer resultado en 7 días', 'CLASE'],
  },
  {
    id: 'b2b', re: /consultor|agencia|despacho|contad|abogad|b2b|empresas|log[ií]stic|distribuid|mayorista|outsourcing|reclutamiento/i,
    niche: 'b2b', industria: 'Servicios profesionales B2B', modelo: 'B2B', ingresos: 'recurrente', ticket: [800, 5000], fact: [20000, 120000],
    alcance: 'nacional', decisor: 'Socio director con poco tiempo y mucha desconfianza',
    icp: 'Gerentes y directores de empresas medianas que compran por confianza y referencia', motivacion: 'Reducir riesgo y verse bien ante su jefe',
    dolores: [
      ['Dependencia total de referidos: no hay un sistema predecible de clientes', 5, 6000],
      ['Ciclos de venta de 3-6 meses que congelan el flujo de caja', 4, 5000],
      ['Comparación solo por precio contra competidores más baratos', 3, 3000],
    ],
    deseo: 'Un flujo predecible de reuniones con empresas que valoran la experiencia',
    villano: ['La Licitación del Precio Más Bajo', 'Compras que tratan tu experiencia como un commodity'],
    servicio: 'adquisicion', mecanismo: 'Sistema Autoridad Outbound', fwOferta: 'fab', fwNarr: 'SB7', fwCopy: 'quest',
    quick: ['Campaña de reactivación a 50 contactos y exclientes de LinkedIn con un diagnóstico gratuito', 'Red de contactos y exclientes'],
    analogia: ['Vivir de referidos es como depender de que llueva para regar tu cosecha.', 'Sistema de adquisición propio'],
    plataformas: [['linkedin', 'nucleo'], ['newsletter', 'nucleo'], ['youtube', 'reciclaje']],
    magnet: ['Diagnóstico de 30 minutos para directores', 'diagnostico', 'Detecta en una llamada dónde pierde dinero tu área', 'DIAGNOSTICO'],
  },
  {
    id: 'tech', re: /saas|\bapp\b|software|plataforma|startup|inteligencia artificial|\bia\b|automatizaci[oó]n|tecnolog/i,
    niche: 'microsaas', industria: 'Tecnología y software', modelo: 'B2B', ingresos: 'recurrente', ticket: [30, 300], fact: [3000, 25000],
    alcance: 'online_global', decisor: 'Fundador técnico que odia vender',
    icp: 'Equipos pequeños que quieren ahorrar horas sin complicarse', motivacion: 'Ahorro de tiempo y simplicidad',
    dolores: [
      ['Usuarios que se registran y abandonan en la primera semana (churn por onboarding)', 5, 3000],
      ['Ventas artesanales una por una que no escalan', 4, 2500],
      ['Miedo del cliente a la complejidad técnica', 3, 1500],
    ],
    deseo: 'Crecimiento recurrente predecible sin que el fundador sea el vendedor',
    villano: ['El Abismo del Día 7', 'El momento en que el usuario se pierde y nadie lo nota'],
    servicio: 'retencion', mecanismo: 'Onboarding de Primer Valor', fwOferta: 'fab', fwNarr: 'BAB', fwCopy: 'fab',
    quick: ['Secuencia de onboarding de 5 emails + llamada de activación a usuarios recientes', 'Usuarios registrados recientes'],
    analogia: ['Un SaaS sin onboarding es un gimnasio que te da la llave y nunca te enseña las máquinas.', 'Activación del usuario'],
    plataformas: [['linkedin', 'nucleo'], ['youtube', 'nucleo'], ['newsletter', 'reciclaje']],
    magnet: ['Plantilla de automatización lista para usar', 'plantilla', 'Ahorra 5 horas esta semana', 'PLANTILLA'],
  },
  {
    id: 'inmobiliaria', re: /inmobiliar|bienes ra[ií]ces|real estate|propiedad|departamentos|casas en venta|desarrollador/i,
    niche: 'real_estate', industria: 'Inmobiliario', modelo: 'B2C', ingresos: 'high_ticket', ticket: [3000, 20000], fact: [20000, 200000],
    alcance: 'regional', decisor: 'Broker titular de la agencia',
    icp: 'Compradores e inversionistas con capacidad real de compra', motivacion: 'Seguridad patrimonial y estatus',
    dolores: [
      ['Leads "turistas" sin capacidad de compra que consumen al equipo', 5, 5000],
      ['Pocas exclusivas: las propiedades se queman en todos los portales', 4, 4000],
      ['Comisiones que dependen de 2-3 cierres al mes', 3, 3000],
    ],
    deseo: 'Menos visitas, más cierres con compradores calificados',
    villano: ['El Turista Inmobiliario', 'Visitas que parecen oportunidades y solo te roban la tarde'],
    servicio: 'conversion', mecanismo: 'Filtro de Comprador Calificado', fwOferta: 'aida', fwNarr: 'HEROS_JOURNEY', fwCopy: 'aida',
    quick: ['Formulario de precalificación + guion de llamada para los leads actuales del mes', 'Leads que ya llegan de portales'],
    analogia: ['Mostrar propiedades sin precalificar es como hacer castings sin leer currículums.', 'Precalificación'],
    plataformas: [['instagram', 'nucleo'], ['youtube', 'nucleo'], ['linkedin', 'reciclaje']],
    magnet: ['Guía de inversión en la zona', 'guia', 'Dónde comprar este año y cuánto rinde', 'ZONA'],
  },
  {
    id: 'fitness', re: /gym|gimnasio|crossfit|yoga|pilates|entrenador|wellness|bienestar|fitness|box\b/i,
    niche: 'wellness', industria: 'Fitness y bienestar', modelo: 'B2C', ingresos: 'recurrente', ticket: [30, 120], fact: [8000, 40000],
    alcance: 'local', decisor: 'Dueño-coach que da clases',
    icp: 'Adultos de 25-45 años que quieren constancia y comunidad', motivacion: 'Verse y sentirse mejor con acompañamiento',
    dolores: [
      ['Socios que se dan de baja en los primeros 3 meses', 5, 2500],
      ['Picos de inscripción en enero y vacío el resto del año', 4, 2000],
      ['Competencia de gimnasios low-cost por precio', 3, 1500],
    ],
    deseo: 'Una comunidad que se queda y refiere a sus amigos',
    villano: ['El Síndrome de Enero', 'La motivación de año nuevo que se evapora en marzo'],
    servicio: 'retencion', mecanismo: 'Ruta de los 90 Días', fwOferta: 'pas', fwNarr: 'BAB', fwCopy: 'bab',
    quick: ['Reto de 21 días para socios actuales con premio por referido', 'Socios activos y comunidad'],
    analogia: ['Inscribir sin retener es llenar una tina sin tapón.', 'Retención de socios'],
    plataformas: [['instagram', 'nucleo'], ['tiktok', 'nucleo'], ['whatsapp', 'reciclaje']],
    magnet: ['Reto de 7 días gratis', 'mini_curso', 'Tu primera semana con plan y acompañamiento', 'RETO'],
  },
  {
    id: 'creador', re: /influencer|creador|youtuber|podcast|marca personal|tiktoker|streamer|seguidores/i,
    niche: 'creators', industria: 'Creadores y marca personal', modelo: 'B2C', ingresos: 'mixto', ticket: [20, 500], fact: [3000, 50000],
    alcance: 'online_global', decisor: 'El propio creador',
    icp: 'Seguidores que confían en su criterio', motivacion: 'Pertenencia y acceso al creador',
    dolores: [
      ['Audiencia grande que no se traduce en ingresos', 5, 3000],
      ['Cero propiedad de los datos: si cambia el algoritmo, desaparece el negocio', 4, 2500],
      ['Ingresos que dependen de marcas y patrocinios esporádicos', 3, 2000],
    ],
    deseo: 'Ingresos propios y estables a partir de la audiencia que ya tiene',
    villano: ['El Algoritmo Caprichoso', 'Una plataforma que puede apagar tu alcance de un día para otro'],
    servicio: 'posicionamiento', mecanismo: 'Escalera de Monetización Propia', fwOferta: 'aida', fwNarr: 'EPIPHANY_BRIDGE', fwCopy: 'aida',
    quick: ['Lead magnet + lista de email/WhatsApp promocionada en las próximas 10 publicaciones', 'Audiencia actual'],
    analogia: ['Construir solo en redes es construir tu casa en terreno rentado.', 'Audiencia propia'],
    plataformas: [['youtube', 'nucleo'], ['instagram', 'nucleo'], ['newsletter', 'reciclaje']],
    magnet: ['Comunidad privada / newsletter', 'guia', 'Lo que no publico en redes', 'LISTA'],
  },
  {
    id: 'industrial', re: /solar|paneles|construc|industrial|f[aá]brica|manufactur|maquinaria|taller mec[aá]nico|refacciones/i,
    niche: 'renewables', industria: 'Industria y construcción', modelo: 'B2B2C', ingresos: 'proyecto', ticket: [2000, 30000], fact: [30000, 300000],
    alcance: 'regional', decisor: 'Director general con perfil técnico',
    icp: 'Empresas y propietarios que comparan cotizaciones por semanas', motivacion: 'Seguridad de la inversión y respaldo',
    dolores: [
      ['Desconfianza del cliente por malas experiencias con otros proveedores', 5, 6000],
      ['Cotizaciones que se envían y nunca reciben respuesta', 4, 5000],
      ['Falta de opciones de financiamiento para el cliente', 3, 3000],
    ],
    deseo: 'Cerrar más proyectos con menos cotizaciones perdidas',
    villano: ['El Proveedor Fantasma', 'Los que cobraron, instalaron mal y desaparecieron, dejando a todo el sector bajo sospecha'],
    servicio: 'conversion', mecanismo: 'Cotización con Garantía Visible', fwOferta: 'fab', fwNarr: 'FALSO_CAMINO', fwCopy: 'fab',
    quick: ['Seguimiento estructurado de las cotizaciones abiertas de los últimos 90 días', 'Cotizaciones enviadas sin respuesta'],
    analogia: ['Enviar una cotización sin seguimiento es como sembrar y no volver a regar.', 'Seguimiento comercial'],
    plataformas: [['linkedin', 'nucleo'], ['youtube', 'nucleo'], ['instagram', 'reciclaje']],
    magnet: ['Calculadora de ahorro/retorno', 'calculadora', 'Cuánto recuperas y en cuántos meses', 'CALCULO'],
  },
];

const GENERIC = {
  id: 'generico', niche: 'nuevo', industria: 'Servicios locales', modelo: 'B2C', ingresos: 'transaccional', ticket: [20, 150], fact: [5000, 30000],
  alcance: 'local', decisor: 'Dueño-operador',
  icp: 'Clientes de la zona que buscan una solución confiable', motivacion: 'Confianza y conveniencia',
  dolores: [
    ['Depender del boca a boca sin un sistema predecible de clientes', 4, 2000],
    ['Clientes que comparan solo por precio', 4, 1500],
    ['El dueño hace todo y no tiene tiempo para vender', 3, 1500],
  ],
  deseo: 'Clientes constantes que valoren el servicio',
  villano: ['La Montaña Rusa del Boca a Boca', 'Meses buenos y meses vacíos sin saber por qué'],
  servicio: 'adquisicion', mecanismo: 'Sistema Cliente Recurrente', fwOferta: 'pas', fwNarr: 'SB7', fwCopy: 'pas',
  quick: ['Campaña de reactivación por WhatsApp a clientes anteriores con una oferta de regreso', 'Contactos de clientes anteriores'],
  analogia: ['Depender del boca a boca es como esperar a que el viento empuje tu barco.', 'Sistema propio de captación'],
  plataformas: [['instagram', 'nucleo'], ['whatsapp', 'nucleo'], ['facebook', 'reciclaje']],
  magnet: ['Diagnóstico gratuito', 'diagnostico', 'Descubre en 10 minutos qué necesitas', 'INFO'],
};

const COUNTRIES = [
  { re: /m[eé]xico|cdmx|monterrey|guadalajara|puebla|quer[eé]taro|tijuana|m[eé]rida|canc[uú]n/i, pais: 'México', moneda: 'MXN', fx: 18 },
  { re: /colombia|bogot[aá]|medell[ií]n|cali\b|barranquilla/i, pais: 'Colombia', moneda: 'COP', fx: 4000 },
  { re: /argentin|buenos aires|c[oó]rdoba|rosario|mendoza/i, pais: 'Argentina', moneda: 'ARS', fx: 1100 },
  { re: /chile|santiago|valpara[ií]so|concepci[oó]n/i, pais: 'Chile', moneda: 'CLP', fx: 950 },
  { re: /per[uú]\b|lima|arequipa|cusco/i, pais: 'Perú', moneda: 'PEN', fx: 3.7 },
  { re: /ecuador|quito|guayaquil/i, pais: 'Ecuador', moneda: 'USD', fx: 1 },
  { re: /guatemala/i, pais: 'Guatemala', moneda: 'GTQ', fx: 7.8 },
  { re: /costa rica|san jos[eé]/i, pais: 'Costa Rica', moneda: 'CRC', fx: 510 },
  { re: /uruguay|montevideo/i, pais: 'Uruguay', moneda: 'UYU', fx: 40 },
  { re: /rep[uú]blica dominicana|santo domingo/i, pais: 'República Dominicana', moneda: 'DOP', fx: 60 },
  { re: /espa[ñn]a|madrid|barcelona|valencia|sevilla/i, pais: 'España', moneda: 'EUR', fx: 0.92 },
];

const PLATFORM_RE = { instagram: /instagram|\big\b/i, tiktok: /tiktok/i, linkedin: /linkedin/i, youtube: /youtube/i, whatsapp: /whatsapp/i, facebook: /facebook/i, newsletter: /newsletter|email|correo/i };

const round = (n) => (n >= 100 ? Math.round(n / 10) * 10 : Math.round(n));

export function extractSignals(text) {
  const t = text || '';
  const country = COUNTRIES.find((c) => c.re.test(t));
  const city = t.match(/\ben\s+([A-ZÁÉÍÓÚÑ][\wáéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+)?)/)?.[1];
  const followersM = t.match(/(\d+(?:[.,]\d+)?)\s*(k|mil|m\b)?\s*(?:de\s+)?seguidores/i);
  let followers = null;
  if (followersM) {
    const n = parseFloat(followersM[1].replace(',', '.'));
    const mult = /k|mil/i.test(followersM[2] || '') ? 1000 : /m/i.test(followersM[2] || '') ? 1e6 : 1;
    followers = Math.round(n * mult);
  }
  const branches = parseInt(t.match(/(\d+)\s*(?:locales|sucursales|tiendas|sedes|clínicas)/i)?.[1] || '1', 10);
  const employees = t.match(/(\d+)\s*(?:empleados|personas|colaboradores|trabajadores)/i)?.[1];
  const platforms = Object.keys(PLATFORM_RE).filter((k) => PLATFORM_RE[k].test(t));
  const archetype = ARCHETYPES.find((a) => a.re.test(t)) || GENERIC;
  return { country, city, followers, branches: Math.max(1, branches), employees, platforms, archetype };
}

function buildEstrategia(text, s) {
  const a = s.archetype;
  const fx = s.country?.fx || 1;
  const moneda = s.country?.moneda || 'USD';
  const scale = Math.min(3, s.branches);
  const factUsd = [a.fact[0] * scale, a.fact[1] * scale];
  const mensual = round(Math.max(300, ((factUsd[0] + factUsd[1]) / 2) * 0.05));
  const dolores = a.dolores.map(([dolor, urgencia, impacto], i) => ({
    dolor, urgencia, impacto_mensual_usd: round(impacto * scale),
    evidencia: i === 0 && s.platforms.length ? `Menciona ${s.platforms.join(', ')} pero no un sistema de seguimiento` : 'inferido por el tipo de negocio',
  }));
  const lugar = [s.city, s.country?.pais].filter(Boolean).join(', ');
  const canales = Object.keys(PLATFORM_RE).filter((k) => k !== 'newsletter').slice(0, 5).map((canal) => ({
    canal,
    estado: s.platforms.includes(canal) ? 'subutilizado' : 'ausente',
    nota: s.platforms.includes(canal) ? 'Presente, sin estrategia de conversión visible' : 'No mencionado en la descripción',
  }));
  const datos_faltantes = ['Facturación real mensual', 'Ticket promedio real', 'Cuántos clientes nuevos llegan al mes y por qué canal'];
  if (!s.country) datos_faltantes.push('País o ciudad');
  if (s.followers == null) datos_faltantes.push('Tamaño de la audiencia en redes');

  return {
    diagnostico: {
      resumen: `${a.industria}${lugar ? ` en ${lugar}` : ''}${s.branches > 1 ? ` con ${s.branches} puntos de venta` : ''}${s.followers ? ` y ~${s.followers.toLocaleString('es')} seguidores` : ''}. Diagnóstico generado con plantillas locales (modo demo): valida los números en la llamada de descubrimiento.`,
      industria: a.industria,
      subnicho: text.trim().split(/[.,\n]/)[0].slice(0, 60),
      niche_id_match: a.niche,
      modelo_negocio: a.modelo,
      modelo_ingresos: a.ingresos,
      pais: s.country?.pais || 'desconocido',
      moneda,
      ticket_promedio: { min: round(a.ticket[0] * fx), max: round(a.ticket[1] * fx), usd_min: a.ticket[0], usd_max: a.ticket[1] },
      facturacion_mensual_estimada: {
        min: round(factUsd[0] * fx), max: round(factUsd[1] * fx), usd_min: factUsd[0], usd_max: factUsd[1],
        supuestos: `Rango típico del sector${scale > 1 ? ` multiplicado por ${scale} puntos de venta` : ''}; tipo de cambio aproximado.`,
      },
      etapa_madurez: s.branches > 1 || (s.followers || 0) > 10000 ? 'traccion' : 'validacion',
      equipo_estimado: s.employees ? `${s.employees}` : s.branches > 1 ? `${s.branches * 3}-${s.branches * 6}` : '1-5',
      icp_cliente_final: { descripcion: a.icp, motivacion_compra: a.motivacion },
      decisor: { rol: 'Dueño / fundador', perfil: a.decisor },
      canales,
      activos_infrautilizados: [a.quick[1], s.followers ? `Audiencia de ~${s.followers.toLocaleString('es')} seguidores` : 'Clientes satisfechos que aún no dejan reseñas'],
      dolores,
      dolor_principal_index: 0,
      deseo_principal: a.deseo,
      nivel_consciencia: 'consciente_problema',
      objeciones: [
        { tipo: 'precio', frase_probable: 'Suena bien, pero ahorita no tengo presupuesto para eso.', respuesta_sugerida: `Justo por eso empezamos con un quick win que se paga solo: ${a.quick[0].toLowerCase()}. Si en 30 días no ves movimiento, no seguimos.` },
        { tipo: 'ya_lo_intente', frase_probable: 'Ya contraté a alguien para redes y no funcionó.', respuesta_sugerida: 'Lo entiendo. La diferencia es que no vendemos publicaciones: medimos ventas. ¿Qué métrica te reportaban?' },
        { tipo: 'tiempo', frase_probable: 'No tengo tiempo para meterme en otro proyecto.', respuesta_sugerida: 'Te pediremos 1 hora a la semana. El resto lo operamos nosotros. ¿Qué día te funciona mejor?' },
      ],
      red_flags: ['Datos financieros no confirmados', 'Posible resistencia del dueño a delegar'],
      score_oportunidad: 60 + (s.platforms.length ? 10 : 0) + (s.branches > 1 ? 10 : 0),
      dificultad_juego: a.modelo === 'B2B' || a.ingresos === 'high_ticket' ? 'Alta' : 'Media',
      confianza_diagnostico: Math.min(55, 25 + s.platforms.length * 5 + (s.country ? 10 : 0) + (s.followers ? 5 : 0)),
      datos_faltantes,
      preguntas_descubrimiento: [
        '¿Cuántos clientes nuevos llegan en un mes normal y de dónde vienen?',
        '¿Qué porcentaje de tus clientes vuelve a comprar?',
        `Si mañana resolvieras "${dolores[0].dolor.toLowerCase()}", ¿qué cambiaría en tu mes?`,
        '¿Qué has intentado antes para crecer y por qué no funcionó?',
      ],
    },
    oferta: {
      nombre: `${a.mecanismo}: primeros resultados en 30 días`,
      servicio_nucleo: a.servicio,
      mecanismo_unico: a.mecanismo,
      promesa: `${a.deseo} en 90 días, con avances medibles cada semana.`,
      entregables: [
        { entregable: 'Auditoría y mapa de oportunidades', plazo_dias: 7, resultado_observable: 'Lista priorizada de 3 acciones con impacto estimado' },
        { entregable: a.quick[0], plazo_dias: 21, resultado_observable: 'Primeras ventas atribuibles al sistema' },
        { entregable: 'Tablero semanal de métricas', plazo_dias: 30, resultado_observable: 'El dueño ve cada lunes cuánto generó el sistema' },
      ],
      bonos: [{ bono: 'Guion de ventas para el equipo', objecion_que_elimina: 'No tengo tiempo' }, { bono: 'Revisión mensual 1 a 1', objecion_que_elimina: 'Ya lo intenté y no funcionó' }],
      garantia: { tipo: 'condicional', texto: 'Si implementas las acciones acordadas y en 30 días no hay mejora en la métrica principal, trabajamos el mes siguiente sin costo.' },
      pricing: {
        niveles: [
          { nombre: 'Arranque', setup_usd: round(mensual * 0.5), mensual_usd: round(mensual * 0.6), incluye: ['Quick win de 30 días', 'Tablero de métricas'] },
          { nombre: 'Crecimiento', setup_usd: round(mensual), mensual_usd: mensual, incluye: ['Todo Arranque', 'Operación completa del sistema', 'Revisión mensual'] },
          { nombre: 'Socio', setup_usd: round(mensual * 1.5), mensual_usd: round(mensual * 1.6), incluye: ['Todo Crecimiento', 'Contenido y marca personal', 'Fee por desempeño opcional'] },
        ],
        nivel_recomendado_index: 1,
        mensual_recomendado_usd: mensual,
        roi_esperado_6m: '3x (supuesto: recuperar 30% del impacto del dolor principal)',
        justificacion: `Aproximadamente 5% de la facturación estimada (${factUsd[0].toLocaleString('es')}-${factUsd[1].toLocaleString('es')} USD/mes).`,
      },
      ancla_precio: { valor: `${round(mensual * 2.5).toLocaleString('es')} USD/mes`, concepto: 'Contratar a un responsable de marketing de tiempo completo + herramientas', frase: 'Un empleado dedicado te costaría más del doble y tardaría meses en dar resultados.' },
      quick_win_30d: { accion: a.quick[0], activo_que_usa: a.quick[1], metrica: 'Ventas atribuibles en 30 días', resultado_esperado: 'Recuperar la inversión del primer mes (estimado)' },
      plan_30_60_90: { d30: `Quick win: ${a.quick[0].toLowerCase()}.`, d60: 'Sistematizar la captación y el seguimiento; documentar procesos.', d90: 'Escalar el canal ganador y medir recompra.' },
      kpis: [
        { kpi: 'Clientes nuevos por mes', linea_base: 'desconocido', meta: '+20%', plazo_dias: 90 },
        { kpi: 'Tasa de recompra / retención', linea_base: 'desconocido', meta: '+15%', plazo_dias: 90 },
      ],
      framework_recomendado: a.fwOferta,
      razon_framework: 'El dueño ya siente el problema (consciente del problema): conviene nombrarlo y agitar su costo antes de presentar la solución.',
      cta_cierre: '¿Te parece si arrancamos con el quick win este lunes y en 30 días revisamos números juntos?',
      pitch_30s: `Hoy ${dolores[0].dolor.toLowerCase()}. Con el ${a.mecanismo} empezamos por algo que ya tienes, ${a.quick[1].toLowerCase()}, y en 30 días ves si se mueve la aguja. Si no, no seguimos.`,
    },
  };
}

function buildNarrativa(text, s, est) {
  const a = s.archetype;
  const d = est.diagnostico;
  const dolor = d.dolores[0].dolor;
  return {
    framework: { principal: a.fwNarr, justificacion: `Seleccionado por el tipo de negocio (${a.industria}).` },
    villano: { nombre: a.villano[0], descripcion: a.villano[1] },
    problema: {
      externo: dolor,
      interno: 'Frustración de trabajar cada día más sin que el negocio crezca al mismo ritmo.',
      filosofico: 'Un negocio bien hecho merece clientes que lo valoren, no que lo comparen por precio.',
    },
    guia: { empatia: 'Sé lo que es abrir cada día sin saber cuántos clientes van a llegar.', autoridad: `Trabajamos con negocios de ${a.industria.toLowerCase()} con un método concreto: ${a.mecanismo}.` },
    one_liner: `Muchos negocios de ${a.industria.toLowerCase()} tienen el mismo problema: ${dolor.charAt(0).toLowerCase() + dolor.slice(1)}. Con el ${a.mecanismo} lo convertimos en ${a.deseo.charAt(0).toLowerCase() + a.deseo.slice(1)}.`,
    historia_apertura: {
      texto: `Ejemplo ilustrativo: un dueño de ${a.industria.toLowerCase()} nos dijo que tenía el mejor producto de su zona y aun así había semanas en que no alcanzaba para la nómina. No le faltaba calidad, le faltaba un sistema. Cuando empezamos por ${a.quick[1].toLowerCase()}, descubrió que el dinero ya estaba ahí, solo nadie lo estaba recogiendo.`,
      pregunta_puente: '¿Te ha pasado algo parecido?',
      es_ilustrativo: true,
    },
    analogia: { texto: a.analogia[0], concepto_que_explica: a.analogia[1] },
    caso_exito: {
      es_ilustrativo: true,
      situacion: `Ejemplo ilustrativo: negocio de ${a.industria.toLowerCase()} con ventas estancadas.`,
      complicacion: dolor,
      resolucion: `Implementación del ${a.mecanismo}, empezando por: ${a.quick[0].toLowerCase()}.`,
      resultado: 'Entre 10% y 25% más de ventas en 90 días (supuesto: implementación completa y oferta competitiva).',
    },
    antes_despues: {
      antes: [dolor, 'El dueño hace todo y no puede despegarse de la operación', 'Ingresos impredecibles mes a mes'],
      despues: [a.deseo, 'Un sistema que trabaja aunque el dueño no esté', 'Un tablero semanal con números claros'],
      transformacion_identidad: { de: 'Dueño apagafuegos', a: 'Dueño que dirige con datos' },
    },
    plan: [
      { paso: 1, nombre: 'Diagnóstico', descripcion: 'Revisamos tus números y elegimos la acción con más impacto.' },
      { paso: 2, nombre: 'Quick win', descripcion: a.quick[0] },
      { paso: 3, nombre: 'Escalar', descripcion: 'Repetimos lo que funcionó y lo convertimos en sistema.' },
    ],
    cta: { directa: 'Agendemos 30 minutos esta semana para revisar tus números.', transicional: 'Te envío un diagnóstico gratuito de 3 oportunidades.' },
    riesgo_de_no_actuar: `Si nada cambia, en 6 meses el costo del dolor principal podría acumular ~${(d.dolores[0].impacto_mensual_usd * 6).toLocaleString('es')} USD (supuesto basado en el rango del sector).`,
    preguntas_para_completar_historia: ['¿Cómo empezó el negocio?', '¿Cuál ha sido su mejor mes y qué pasó?', '¿Tiene un cliente que pueda contar su experiencia?'],
    advertencias_veracidad: ['Historia y caso de éxito ilustrativos (modo demo).', 'Cifras estimadas por sector, no por datos reales del negocio.'],
  };
}

function buildCopy(text, s, est) {
  const a = s.archetype;
  const d = est.diagnostico;
  const o = est.oferta;
  const dolor = d.dolores[0].dolor;
  const dolorLower = dolor.charAt(0).toLowerCase() + dolor.slice(1);
  const detalle = s.city ? `en ${s.city}` : s.followers ? `con ${s.followers.toLocaleString('es')} seguidores` : 'en tu zona';
  const canal = s.archetype.modelo === 'B2B' ? 'linkedin' : s.platforms.includes('whatsapp') ? 'whatsapp' : 'instagram';
  return {
    framework_principal: a.fwCopy,
    tono: a.modelo === 'B2B' ? 'ejecutivo' : 'cercano',
    oferta_one_liner: `${a.mecanismo}: ${a.deseo.toLowerCase()} empezando en 30 días.`,
    dm_apertura: {
      canal,
      texto: `Vi tu negocio ${detalle} y me llamó la atención algo: la mayoría de negocios así pierden entre 10% y 20% de sus ventas por algo muy común: ${dolorLower}. Tengo una idea concreta para recuperar parte de eso en 30 días usando algo que ya tienes (${a.quick[1].toLowerCase()}). ¿Te la comparto?`,
      personalizacion_usada: detalle,
    },
    email_frio: {
      asunto: `idea para ${d.subnicho.toLowerCase().split(' ').slice(0, 3).join(' ')}`,
      cuerpo: `Hola,\n\nRevisé tu negocio ${detalle}. Un patrón que veo seguido: ${dolorLower}.\n\nEso suele costar alrededor de ${d.dolores[0].impacto_mensual_usd.toLocaleString('es')} USD al mes (estimado).\n\nPropongo empezar con algo pequeño: ${a.quick[0].toLowerCase()}. Sin cambiar tu operación.\n\n¿Te parece una llamada de 20 minutos el jueves?`,
    },
    follow_ups: [
      { dia: 3, canal, texto: `Te dejo un dato: los negocios que aplican "${a.quick[0].toLowerCase()}" suelen ver resultados en 2-4 semanas. ¿Lo revisamos 15 minutos?`, valor_aportado: 'Dato de referencia del sector' },
      { dia: 7, canal: 'email', texto: 'Último mensaje sobre esto para no llenar tu bandeja. Si en algún momento quieres revisar cómo recuperar esas ventas, respóndeme con "sí" y te mando 3 horarios.', valor_aportado: 'Cierre respetuoso con puerta abierta' },
    ],
    guion_descubrimiento: {
      apertura: 'Gracias por el tiempo. La idea es entender tu negocio; si al final no tiene sentido trabajar juntos, te lo diré.',
      preguntas: [
        { tipo: 'S', pregunta: '¿Cómo llegan hoy tus clientes nuevos?', objetivo: 'Mapear canales' },
        { tipo: 'S', pregunta: '¿Cuántas ventas haces en un mes normal?', objetivo: 'Línea base' },
        { tipo: 'P', pregunta: `¿Qué tanto te afecta esto: ${dolorLower}?`, objetivo: 'Confirmar dolor principal' },
        { tipo: 'P', pregunta: '¿Qué has intentado y por qué no funcionó?', objetivo: 'Detectar objeción "ya lo intenté"' },
        { tipo: 'I', pregunta: 'Si esto sigue igual 6 meses, ¿cuánto dinero crees que se queda en la mesa?', objetivo: 'Cuantificar el costo' },
        { tipo: 'I', pregunta: '¿Cómo afecta esto a tu tiempo y a tu equipo?', objetivo: 'Dolor interno' },
        { tipo: 'N', pregunta: 'Si lo resolvieras, ¿qué harías con ese ingreso extra?', objetivo: 'Que verbalice el valor' },
        { tipo: 'N', pregunta: '¿Qué tendría que pasar en 30 días para que digas "valió la pena"?', objetivo: 'Criterio de éxito' },
      ],
      resumen_espejo: `Entonces, si te entendí bien: ${dolorLower}, eso te cuesta dinero y tiempo, y lo que buscas es ${a.deseo.toLowerCase()}.`,
      cierre_siguiente_paso: o.cta_cierre,
    },
    pitch_60s: {
      texto: `Hoy tu negocio está así: ${dolorLower}. Trabajas más, pero las ventas no crecen al mismo ritmo. Imagina en 90 días: ${a.deseo.toLowerCase()}, con un tablero que te dice cada lunes cuánto generó el sistema. El puente es el ${a.mecanismo}. Empezamos con un quick win sobre algo que ya tienes, ${a.quick[1].toLowerCase()}, para que veas resultados en 30 días antes de comprometerte a más. Si no se mueve la aguja, no seguimos. ¿Te parece si arrancamos con eso?`,
      mecanismo_nombre: a.mecanismo,
    },
    objeciones: d.objeciones.map((x) => ({
      objecion: x.frase_probable,
      tipo: x.tipo === 'ya_lo_intente' ? 'confianza' : x.tipo === 'no_es_prioridad' ? 'necesidad' : x.tipo === 'decisor' ? 'autoridad' : x.tipo,
      respuesta: x.respuesta_sugerida,
      pregunta_de_avance: '¿Qué tendría que ver para sentirte seguro de avanzar?',
    })),
    cta: { principal: o.cta_cierre, alternativa_suave: '¿Te mando primero un diagnóstico por escrito con 3 oportunidades?' },
    supuestos: ['Pérdida de 10-20% de ventas estimada por sector', `Impacto mensual de ~${d.dolores[0].impacto_mensual_usd} USD estimado`],
  };
}

function buildMarca(text, s, est) {
  const a = s.archetype;
  const d = est.diagnostico;
  const plataformas = a.plataformas.map(([red, rol]) => ({
    red, rol,
    estado: s.platforms.includes(red) ? 'activa' : 'desconocida',
    motivo: rol === 'nucleo' ? `Donde está y compra su cliente ideal (${a.icp.toLowerCase()})` : 'Reciclar contenido sin esfuerzo extra',
  }));
  const nucleo = plataformas.filter((p) => p.rol === 'nucleo').map((p) => p.red);
  const nivel = s.followers ? (s.followers > 50000 ? 4 : s.followers > 5000 ? 3 : 2) : 2;
  return {
    auditoria: {
      plataformas,
      posicionamiento_actual: `Un negocio de ${a.industria.toLowerCase()} más, sin un mensaje que lo distinga.`,
      posicionamiento_deseado: `El referente de ${a.industria.toLowerCase()} para ${a.icp.split(' que ')[0].toLowerCase()}.`,
      nivel_autoridad: nivel,
      justificacion_nivel: s.followers ? `~${s.followers.toLocaleString('es')} seguidores, sin evidencia de prueba social estructurada.` : 'Sin datos de audiencia; se asume presencia básica.',
      dependencia_dueno: 'alta',
      audiencia_propia: s.platforms.includes('newsletter') || s.platforms.includes('whatsapp') ? 'si' : 'desconocida',
      brechas: [
        { brecha: 'El contenido no conduce a una acción de compra (sin CTA ni lead magnet)', impacto: 'alto', evidencia: 'inferido', es_supuesto: true },
        { brecha: 'Falta de prueba social visible (casos, reseñas, testimonios en video)', impacto: 'alto', evidencia: 'inferido', es_supuesto: true },
        { brecha: 'Sin audiencia propia (lista de email/WhatsApp)', impacto: 'medio', evidencia: 'inferido', es_supuesto: true },
      ],
    },
    posicionamiento: {
      statement: `Ayudo a ${a.icp.split(' que ')[0].toLowerCase()} a ${a.deseo.charAt(0).toLowerCase() + a.deseo.slice(1)} sin ${d.dolores[0].dolor.split(':')[0].toLowerCase()}.`,
      bio_corta: `${a.industria}${s.city ? ` en ${s.city}` : ''} · ${a.mecanismo} · Escribe "${a.magnet[3]}" por DM`.slice(0, 150),
      headline_linkedin: `${a.mecanismo} | Ayudo a ${a.icp.split(' que ')[0].toLowerCase()} a ${a.deseo.toLowerCase()}`.slice(0, 220),
    },
    pilares: [
      { nombre: 'Detrás del oficio', objetivo: 'atraer', porcentaje: 40, ideas: ['Errores comunes que cometen tus clientes', 'Mito vs. realidad del sector', 'Un día en el negocio en 30 segundos'] },
      { nombre: 'Método y resultados', objetivo: 'nutrir', porcentaje: 30, ideas: [`Explicar el ${a.mecanismo} en 3 pasos`, 'Antes y después de un cliente (con permiso)', 'Respuesta a la pregunta más frecuente'] },
      { nombre: 'Oferta clara', objetivo: 'convertir', porcentaje: 20, ideas: [`Promoción del lead magnet "${a.magnet[0]}"`, 'Testimonio + CTA directo', 'Cupos o fechas disponibles'] },
      { nombre: 'El dueño humano', objetivo: 'humanizar', porcentaje: 10, ideas: ['Por qué empezó el negocio', 'Un fracaso y lo que aprendió', 'Su equipo'] },
    ],
    plan_30_dias: {
      frecuencia: nucleo.map((red) => ({ red, formato: red === 'linkedin' ? 'post_texto' : red === 'youtube' ? 'video_largo' : 'reel', veces_por_semana: red === 'youtube' ? 1 : 3 })),
      semanas: [
        { semana: 1, tema: 'Posicionamiento', objetivo: 'Dejar claro para quién es y qué resuelve', piezas_clave: ['Bio y destacados actualizados', 'Video "por qué hago esto"'] },
        { semana: 2, tema: 'Prueba social', objetivo: 'Mostrar resultados reales', piezas_clave: ['2 testimonios', 'Caso antes/después'] },
        { semana: 3, tema: 'Objeciones y método', objetivo: 'Responder dudas antes de que las pregunten', piezas_clave: ['Carrusel de mitos', `Explicación del ${a.mecanismo}`] },
        { semana: 4, tema: 'Oferta + lead magnet', objetivo: 'Convertir audiencia en conversaciones', piezas_clave: [`Lanzamiento de "${a.magnet[0]}"`, 'Live de preguntas y respuestas'] },
      ],
    },
    hooks: [
      { texto: `Deja de hacer esto si tienes un negocio de ${a.industria.split(' ')[0].toLowerCase()}`, tipo: 'contrarian', plataforma: nucleo[0], formato: 'reel' },
      { texto: 'El error que te está costando clientes cada semana', tipo: 'error_comun', plataforma: nucleo[0], formato: 'reel' },
      { texto: 'Cómo un cambio pequeño llenó nuestros días flojos', tipo: 'resultado', plataforma: nucleo[0], formato: 'carrusel' },
      { texto: 'El día que casi cierro el negocio', tipo: 'historia', plataforma: nucleo[1] || nucleo[0], formato: 'video' },
      { texto: '3 señales de que tu negocio depende demasiado de ti', tipo: 'lista', plataforma: nucleo[1] || nucleo[0], formato: 'carrusel' },
    ],
    lead_magnet: {
      nombre: a.magnet[0], formato: a.magnet[1], promesa: a.magnet[2], palabra_clave_dm: a.magnet[3],
      secuencia_dm: [
        `¡Hola! Aquí tienes "${a.magnet[0]}". ¿Qué es lo que más te interesa resolver ahora mismo?`,
        'Gracias por contarme. A muchos les pasa lo mismo. ¿Has intentado algo antes para solucionarlo?',
        'Tengo 2 espacios esta semana para una llamada de 15 minutos y revisar tu caso. ¿Te va mejor martes o jueves?',
      ],
    },
    activos_autoridad: [
      { tipo: 'caso_exito', accion: 'Documentar 1 caso real con números (con permiso del cliente)', prioridad: 'alta', plazo_dias: 30 },
      { tipo: 'testimonio_video', accion: 'Grabar 3 testimonios de 30 segundos', prioridad: 'alta', plazo_dias: 30 },
      { tipo: 'colaboracion', accion: 'Colaboración con un negocio complementario de la zona/nicho', prioridad: 'media', plazo_dias: 60 },
    ],
    metricas: [
      { nombre: 'Conversaciones calificadas por DM al mes', es_norte: true, meta_30d: '+10', meta_90d: '+40' },
      { nombre: 'Leads del lead magnet', es_norte: false, meta_30d: '50', meta_90d: '200' },
    ],
    argumento_closer: {
      pitch: 'Hoy tus redes generan likes pero no conversaciones de venta. Si convertimos solo 1% de tu audiencia en conversaciones, eso son clientes nuevos cada mes sin pagar más anuncios.',
      objecion_probable: 'Las redes no funcionan para mi negocio.',
      respuesta: 'No funcionan publicando por publicar. Funcionan cuando cada pieza lleva a una conversación. Por eso medimos DMs calificados, no seguidores.',
    },
    supuestos: ['Plataformas sugeridas por el tipo de negocio, no por datos reales', s.followers == null ? 'Tamaño de audiencia desconocido' : 'Audiencia tomada de la descripción'],
  };
}

/** Genera una sección completa con el motor local. */
export function demoSection(sectionId, description, estrategia) {
  const s = extractSignals(description);
  const est = estrategia || buildEstrategia(description, s);
  switch (sectionId) {
    case 'estrategia': return buildEstrategia(description, s);
    case 'narrativa': return buildNarrativa(description, s, est);
    case 'copy': return buildCopy(description, s, est);
    case 'marca_personal': return buildMarca(description, s, est);
    default: throw new Error(`Sección desconocida: ${sectionId}`);
  }
}
