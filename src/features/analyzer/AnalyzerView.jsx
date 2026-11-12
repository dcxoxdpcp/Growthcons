import React, { useState, useRef } from 'react';
import {
  ChevronRight, Sparkles, RefreshCw, Copy, Check, Download, History, Trash2, Swords,
  Target, Brain, MessageSquare, Megaphone, AlertCircle, FlaskConical, Wand2, ShieldAlert,
} from 'lucide-react';
import { SECTIONS } from './prompts.js';
import { runAnalysis, generateSection, analysisToLead } from './analyzer.js';
import { loadHistory, upsertAnalysis, deleteAnalysis } from './history.js';
import { analysisToMarkdown, downloadText, copyToClipboard } from './exportMarkdown.js';
import { providerLabel, DEFAULT_MODE, DOWNLOADS_ENABLED } from '../../lib/ai/index.js';

const EXAMPLES = [
  'Panadería artesanal en Monterrey con 2 locales y 3k seguidores en Instagram',
  'Clínica dental en Bogotá con 4 sillones; los pacientes preguntan precio por WhatsApp y no agendan',
  'Coach de finanzas personales con 25k seguidores en TikTok que vende un curso de $97',
  'Despacho contable en Lima que atiende a 40 pymes y depende 100% de referidos',
];

const SECTION_ICONS = { estrategia: Target, narrativa: Brain, copy: MessageSquare, marca_personal: Megaphone };

// ---------- Piezas visuales reutilizables ----------

function CopyButton({ text, label = 'Copiar' }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => { if (await copyToClipboard(text)) { setDone(true); setTimeout(() => setDone(false), 1500); } }}
      className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-blue-500 transition-all"
      title="Copiar al portapapeles"
    >
      {done ? <Check size={12} className="text-green-400" /> : <Copy size={12} />} {done ? 'Copiado' : label}
    </button>
  );
}

function Card({ title, children, copyText, accent = 'blue', badge }) {
  const accents = { blue: 'text-blue-400', amber: 'text-amber-400', green: 'text-green-400', purple: 'text-purple-400', red: 'text-red-400' };
  return (
    <div className="bg-black/40 border border-slate-800 rounded-[2rem] p-6 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${accents[accent]}`}>
          {title} {badge && <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 normal-case tracking-normal">{badge}</span>}
        </h4>
        {copyText && <CopyButton text={copyText} />}
      </div>
      <div className="text-sm text-slate-300 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}

const Quote = ({ children }) => <p className="whitespace-pre-wrap italic text-slate-200 border-l-2 border-blue-500/50 pl-4">{children}</p>;
const KV = ({ k, v }) => (
  <div className="bg-slate-900/60 rounded-2xl p-3">
    <p className="text-[9px] uppercase font-black tracking-widest text-slate-500">{k}</p>
    <p className="text-white font-bold text-sm mt-1 break-words">{v}</p>
  </div>
);
const Bullets = ({ items }) => (
  <ul className="space-y-1.5">{(items || []).map((x, i) => <li key={i} className="flex gap-2"><span className="text-blue-500">›</span><span>{x}</span></li>)}</ul>
);
const Pill = ({ children, tone = 'slate' }) => {
  const tones = { slate: 'bg-slate-800 text-slate-300', green: 'bg-green-500/10 text-green-400', red: 'bg-red-500/10 text-red-400', amber: 'bg-amber-500/10 text-amber-400', blue: 'bg-blue-500/10 text-blue-400' };
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${tones[tone]}`}>{children}</span>;
};
const money = (n) => (typeof n === 'number' ? n.toLocaleString('es', { maximumFractionDigits: 0 }) : n);
const label = (s) => String(s || '').replace(/_/g, ' ');

// ---------- Renderizado por sección ----------

function EstrategiaSection({ data }) {
  const d = data.diagnostico;
  const o = data.oferta;
  const f = d.facturacion_mensual_estimada;
  const t = d.ticket_promedio;
  return (
    <div className="space-y-6">
      <Card title="Diagnóstico">
        <p className="text-slate-200">{d.resumen}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <KV k="Modelo" v={`${d.modelo_negocio} · ${label(d.modelo_ingresos)}`} />
          <KV k="Etapa" v={label(d.etapa_madurez)} />
          <KV k="Equipo" v={d.equipo_estimado} />
          <KV k="Ticket promedio" v={`${money(t.min)}-${money(t.max)} ${d.moneda} (~$${money(t.usd_min)}-${money(t.usd_max)} USD)`} />
          <KV k="Facturación / mes" v={`${money(f.min)}-${money(f.max)} ${d.moneda}`} />
          <KV k="Consciencia" v={label(d.nivel_consciencia)} />
        </div>
        <p className="text-xs text-slate-500">Supuestos: {f.supuestos}</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Cliente ideal y decisor">
          <p><b className="text-white">Cliente final:</b> {d.icp_cliente_final.descripcion}</p>
          <p><b className="text-white">Por qué compra:</b> {d.icp_cliente_final.motivacion_compra}</p>
          <p><b className="text-white">Decisor:</b> {d.decisor.rol} — {d.decisor.perfil}</p>
        </Card>
        <Card title="Canales">
          <div className="space-y-2">
            {d.canales.map((c, i) => (
              <div key={i} className="flex items-start gap-3">
                <Pill tone={c.estado === 'activo' ? 'green' : c.estado === 'subutilizado' ? 'amber' : 'slate'}>{c.estado}</Pill>
                <span><b className="text-white capitalize">{c.canal}</b> — {c.nota}</span>
              </div>
            ))}
          </div>
          {d.activos_infrautilizados?.length > 0 && <><p className="text-[10px] uppercase font-black text-slate-500 tracking-widest pt-2">Activos infrautilizados</p><Bullets items={d.activos_infrautilizados} /></>}
        </Card>
      </div>

      <Card title="Dolores (por urgencia)" accent="red">
        {d.dolores.map((p, i) => (
          <div key={i} className={`p-4 rounded-2xl ${i === d.dolor_principal_index ? 'bg-red-500/5 border border-red-500/30' : 'bg-slate-900/60'}`}>
            <div className="flex justify-between gap-3">
              <p className="text-white font-bold">{i === d.dolor_principal_index && '🎯 '}{p.dolor}</p>
              <span className="shrink-0 text-xs text-red-400 font-black">{p.impacto_mensual_usd ? `~$${money(p.impacto_mensual_usd)}/mes` : ''}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <div key={n} className={`w-5 h-1.5 rounded-full ${n <= p.urgencia ? 'bg-red-500' : 'bg-slate-800'}`} />)}</div>
              <span className="text-[10px] text-slate-500">Evidencia: {p.evidencia}</span>
            </div>
          </div>
        ))}
        <p><b className="text-white">Deseo principal:</b> {d.deseo_principal}</p>
      </Card>

      <Card title="Objeciones probables (en la voz del dueño)" accent="amber">
        {d.objeciones.map((x, i) => (
          <div key={i} className="p-4 bg-slate-900/60 rounded-2xl space-y-2">
            <div className="flex items-center gap-2"><Pill tone="amber">{label(x.tipo)}</Pill><span className="italic text-white">"{x.frase_probable}"</span></div>
            <div className="flex justify-between gap-3"><p>→ {x.respuesta_sugerida}</p><CopyButton text={x.respuesta_sugerida} /></div>
          </div>
        ))}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Preguntas de descubrimiento" copyText={d.preguntas_descubrimiento.join('\n')}><Bullets items={d.preguntas_descubrimiento} /></Card>
        <Card title="Datos faltantes y alertas" accent="red">
          <Bullets items={d.datos_faltantes} />
          {d.red_flags?.length > 0 && <><p className="text-[10px] uppercase font-black text-red-400 tracking-widest pt-2">Red flags</p><Bullets items={d.red_flags} /></>}
        </Card>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">{o.nombre}</h3>
        <p className="text-slate-400">{o.promesa}</p>
        <div className="flex flex-wrap gap-2 mt-3"><Pill tone="blue">{o.mecanismo_unico}</Pill><Pill>{label(o.servicio_nucleo)}</Pill><Pill tone="green">Framework: {o.framework_recomendado?.toUpperCase()}</Pill></div>
      </div>

      <Card title="Pitch de 30 segundos" copyText={o.pitch_30s} accent="green"><Quote>{o.pitch_30s}</Quote><p className="text-xs text-slate-500">{o.razon_framework}</p></Card>

      <Card title="Pricing sugerido (USD)" accent="green">
        <div className="grid md:grid-cols-3 gap-3">
          {o.pricing.niveles.map((n, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${i === o.pricing.nivel_recomendado_index ? 'border-green-500 bg-green-500/5' : 'border-slate-800 bg-slate-900/60'}`}>
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">{n.nombre} {i === o.pricing.nivel_recomendado_index && <span className="text-green-400">· recomendado</span>}</p>
              <p className="text-2xl font-black text-white mt-1">${money(n.mensual_usd)}<span className="text-xs text-slate-500">/mes</span></p>
              <p className="text-xs text-slate-500 mb-2">Setup: ${money(n.setup_usd)}</p>
              <Bullets items={n.incluye} />
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500">ROI esperado a 6 meses: <b className="text-slate-300">{o.pricing.roi_esperado_6m}</b>. {o.pricing.justificacion}</p>
        <p><b className="text-white">Ancla de precio:</b> {o.ancla_precio.valor} — {o.ancla_precio.concepto}. <i>"{o.ancla_precio.frase}"</i></p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Quick win de 30 días" accent="green">
          <p className="text-white font-bold">{o.quick_win_30d.accion}</p>
          <p>Usa: {o.quick_win_30d.activo_que_usa}</p>
          <p>Métrica: {o.quick_win_30d.metrica} → {o.quick_win_30d.resultado_esperado}</p>
        </Card>
        <Card title="Plan 30 / 60 / 90">
          <p><b className="text-white">Día 30:</b> {o.plan_30_60_90.d30}</p>
          <p><b className="text-white">Día 60:</b> {o.plan_30_60_90.d60}</p>
          <p><b className="text-white">Día 90:</b> {o.plan_30_60_90.d90}</p>
        </Card>
      </div>

      <Card title="Entregables">
        {o.entregables.map((e, i) => <p key={i}><b className="text-white">{e.entregable}</b> <span className="text-slate-500">({e.plazo_dias} días)</span> → {e.resultado_observable}</p>)}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Garantía y bonos" accent="purple">
          <p><Pill tone="blue">{label(o.garantia.tipo)}</Pill> {o.garantia.texto}</p>
          {o.bonos.map((b, i) => <p key={i}>🎁 <b className="text-white">{b.bono}</b> — elimina: {b.objecion_que_elimina}</p>)}
        </Card>
        <Card title="KPIs">
          {o.kpis.map((k, i) => <p key={i}><b className="text-white">{k.kpi}:</b> {k.linea_base} → {k.meta} en {k.plazo_dias} días</p>)}
        </Card>
      </div>

      <Card title="Llamada a la acción de cierre" copyText={o.cta_cierre} accent="green"><Quote>{o.cta_cierre}</Quote></Card>
    </div>
  );
}

function NarrativaSection({ data: n }) {
  return (
    <div className="space-y-6">
      <Card title="One-liner" copyText={n.one_liner} accent="purple" badge={label(n.framework.principal)}>
        <p className="text-xl text-white font-bold leading-snug">{n.one_liner}</p>
        <p className="text-xs text-slate-500">{n.framework.justificacion}</p>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="El villano" accent="red"><p className="text-white font-black text-lg">{n.villano.nombre}</p><p>{n.villano.descripcion}</p></Card>
        <Card title="El problema en 3 niveles">
          <p><b className="text-white">Externo:</b> {n.problema.externo}</p>
          <p><b className="text-white">Interno:</b> {n.problema.interno}</p>
          <p><b className="text-white">Filosófico:</b> {n.problema.filosofico}</p>
        </Card>
      </div>
      <Card title="Historia de apertura" copyText={`${n.historia_apertura.texto}\n\n${n.historia_apertura.pregunta_puente}`} badge={n.historia_apertura.es_ilustrativo ? 'ilustrativa' : null}>
        <Quote>{n.historia_apertura.texto}</Quote>
        <p className="text-white font-bold">→ {n.historia_apertura.pregunta_puente}</p>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Tú como guía"><p><b className="text-white">Empatía:</b> {n.guia.empatia}</p><p><b className="text-white">Autoridad:</b> {n.guia.autoridad}</p></Card>
        <Card title="Analogía" copyText={n.analogia.texto}><Quote>{n.analogia.texto}</Quote><p className="text-xs text-slate-500">Explica: {n.analogia.concepto_que_explica}</p></Card>
      </div>
      <Card title="Antes / Después">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-red-500/5"><p className="text-[10px] font-black uppercase text-red-400 tracking-widest mb-2">Antes</p><Bullets items={n.antes_despues.antes} /></div>
          <div className="p-4 rounded-2xl bg-green-500/5"><p className="text-[10px] font-black uppercase text-green-400 tracking-widest mb-2">Después</p><Bullets items={n.antes_despues.despues} /></div>
        </div>
        <p className="text-center text-white font-bold">De "{n.antes_despues.transformacion_identidad.de}" a "{n.antes_despues.transformacion_identidad.a}"</p>
      </Card>
      <Card title="Caso de éxito" badge={n.caso_exito.es_ilustrativo ? 'ilustrativo' : null}>
        <p><b className="text-white">Situación:</b> {n.caso_exito.situacion}</p>
        <p><b className="text-white">Complicación:</b> {n.caso_exito.complicacion}</p>
        <p><b className="text-white">Resolución:</b> {n.caso_exito.resolucion}</p>
        <p><b className="text-white">Resultado:</b> {n.caso_exito.resultado}</p>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Plan en 3 pasos">{n.plan.map((p, i) => <p key={i}><b className="text-white">{p.paso}. {p.nombre}:</b> {p.descripcion}</p>)}</Card>
        <Card title="Llamadas a la acción" copyText={`${n.cta.directa}\n${n.cta.transicional}`} accent="green">
          <p><b className="text-white">Directa:</b> {n.cta.directa}</p><p><b className="text-white">Transicional:</b> {n.cta.transicional}</p>
        </Card>
      </div>
      <Card title="Costo de no actuar" accent="red"><p>{n.riesgo_de_no_actuar}</p></Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Pregunta esto para tener una historia real"><Bullets items={n.preguntas_para_completar_historia} /></Card>
        <Card title="Advertencias de veracidad" accent="amber"><Bullets items={n.advertencias_veracidad} /></Card>
      </div>
    </div>
  );
}

function CopySection({ data: c }) {
  const spinLabel = { S: 'Situación', P: 'Problema', I: 'Implicación', N: 'Necesidad' };
  return (
    <div className="space-y-6">
      <Card title="Oferta en una línea" copyText={c.oferta_one_liner} accent="purple" badge={`${c.framework_principal?.toUpperCase()} · ${c.tono}`}>
        <p className="text-xl text-white font-bold">{c.oferta_one_liner}</p>
      </Card>
      <Card title={`DM de apertura · ${c.dm_apertura.canal}`} copyText={c.dm_apertura.texto} accent="green">
        <Quote>{c.dm_apertura.texto}</Quote>
        <p className="text-xs text-slate-500">Personalización: {c.dm_apertura.personalizacion_usada}</p>
      </Card>
      <Card title="Email en frío" copyText={`Asunto: ${c.email_frio.asunto}\n\n${c.email_frio.cuerpo}`}>
        <p><b className="text-white">Asunto:</b> {c.email_frio.asunto}</p>
        <Quote>{c.email_frio.cuerpo}</Quote>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        {c.follow_ups.map((f, i) => (
          <Card key={i} title={`Seguimiento · día ${f.dia} · ${f.canal}`} copyText={f.texto}><Quote>{f.texto}</Quote><p className="text-xs text-slate-500">Valor aportado: {f.valor_aportado}</p></Card>
        ))}
      </div>
      <Card title="Guion de descubrimiento (SPIN)" copyText={[c.guion_descubrimiento.apertura, ...c.guion_descubrimiento.preguntas.map((q) => `[${q.tipo}] ${q.pregunta}`), c.guion_descubrimiento.resumen_espejo, c.guion_descubrimiento.cierre_siguiente_paso].join('\n')}>
        <p><b className="text-white">Apertura:</b> {c.guion_descubrimiento.apertura}</p>
        <div className="space-y-2">
          {c.guion_descubrimiento.preguntas.map((q, i) => (
            <div key={i} className="flex gap-3 items-start"><Pill tone="blue">{spinLabel[q.tipo] || q.tipo}</Pill><div><p className="text-white">{q.pregunta}</p><p className="text-xs text-slate-500">{q.objetivo}</p></div></div>
          ))}
        </div>
        <p><b className="text-white">Resumen espejo:</b> {c.guion_descubrimiento.resumen_espejo}</p>
        <p><b className="text-white">Cierre:</b> {c.guion_descubrimiento.cierre_siguiente_paso}</p>
      </Card>
      <Card title={`Pitch de 60 segundos · ${c.pitch_60s.mecanismo_nombre}`} copyText={c.pitch_60s.texto} accent="green"><Quote>{c.pitch_60s.texto}</Quote></Card>
      <Card title="Manejo de objeciones" accent="amber">
        {c.objeciones.map((o, i) => (
          <div key={i} className="p-4 bg-slate-900/60 rounded-2xl space-y-2">
            <div className="flex justify-between gap-3"><p className="italic text-white">"{o.objecion}"</p><Pill tone="amber">{o.tipo}</Pill></div>
            <p>{o.respuesta}</p>
            <div className="flex justify-between items-center gap-3"><p className="text-blue-400 font-bold">→ {o.pregunta_de_avance}</p><CopyButton text={`${o.respuesta} ${o.pregunta_de_avance}`} /></div>
          </div>
        ))}
      </Card>
      <Card title="Llamada a la acción" copyText={`${c.cta.principal}\n${c.cta.alternativa_suave}`} accent="green">
        <p><b className="text-white">Principal:</b> {c.cta.principal}</p><p><b className="text-white">Alternativa suave:</b> {c.cta.alternativa_suave}</p>
      </Card>
      {c.supuestos?.length > 0 && <Card title="Supuestos usados en el copy" accent="amber"><Bullets items={c.supuestos} /></Card>}
    </div>
  );
}

function MarcaSection({ data: m }) {
  const a = m.auditoria;
  return (
    <div className="space-y-6">
      <Card title="Auditoría de presencia digital">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <div key={n} className={`w-8 h-2 rounded-full ${n <= a.nivel_autoridad ? 'bg-blue-500' : 'bg-slate-800'}`} />)}</div>
          <span className="text-white font-black">Autoridad {a.nivel_autoridad}/5</span>
        </div>
        <p className="text-xs text-slate-500">{a.justificacion_nivel}</p>
        <div className="grid md:grid-cols-2 gap-3">
          <KV k="Hoy" v={a.posicionamiento_actual} />
          <KV k="Objetivo" v={a.posicionamiento_deseado} />
          <KV k="Dependencia del dueño" v={a.dependencia_dueno} />
          <KV k="Audiencia propia" v={a.audiencia_propia} />
        </div>
        <div className="space-y-2">
          {a.plataformas.map((p, i) => (
            <div key={i} className="flex items-start gap-3">
              <Pill tone={p.rol === 'nucleo' ? 'blue' : 'slate'}>{label(p.rol)}</Pill>
              <span><b className="text-white capitalize">{p.red}</b> ({p.estado}) — {p.motivo}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Brechas" accent="red">
        {a.brechas.map((b, i) => (
          <div key={i} className="flex gap-3 items-start"><Pill tone={b.impacto === 'alto' ? 'red' : b.impacto === 'medio' ? 'amber' : 'slate'}>{b.impacto}</Pill><span>{b.brecha} <span className="text-xs text-slate-500">({b.es_supuesto ? 'supuesto' : b.evidencia})</span></span></div>
        ))}
      </Card>
      <Card title="Posicionamiento" copyText={m.posicionamiento.statement} accent="purple">
        <p className="text-xl text-white font-bold">{m.posicionamiento.statement}</p>
        <div className="flex justify-between gap-3 items-center"><p><b className="text-white">Bio:</b> {m.posicionamiento.bio_corta}</p><CopyButton text={m.posicionamiento.bio_corta} /></div>
        <div className="flex justify-between gap-3 items-center"><p><b className="text-white">LinkedIn:</b> {m.posicionamiento.headline_linkedin}</p><CopyButton text={m.posicionamiento.headline_linkedin} /></div>
      </Card>
      <Card title="Pilares de contenido">
        <div className="grid md:grid-cols-2 gap-3">
          {m.pilares.map((p, i) => (
            <div key={i} className="p-4 bg-slate-900/60 rounded-2xl">
              <div className="flex justify-between items-center mb-2"><p className="text-white font-bold">{p.nombre}</p><Pill tone="blue">{p.objetivo} · {p.porcentaje}%</Pill></div>
              <Bullets items={p.ideas} />
            </div>
          ))}
        </div>
      </Card>
      <Card title="Hooks listos para usar" copyText={m.hooks.map((h) => h.texto).join('\n')} accent="amber">
        {m.hooks.map((h, i) => (
          <div key={i} className="flex justify-between items-center gap-3 p-3 bg-slate-900/60 rounded-2xl">
            <div><p className="text-white font-bold">"{h.texto}"</p><p className="text-[10px] text-slate-500 uppercase tracking-widest">{label(h.tipo)} · {h.plataforma} · {h.formato}</p></div>
            <CopyButton text={h.texto} />
          </div>
        ))}
      </Card>
      <Card title="Plan de 30 días">
        <div className="flex flex-wrap gap-2">{m.plan_30_dias.frecuencia.map((f, i) => <Pill key={i} tone="blue">{f.red}: {f.veces_por_semana}× {label(f.formato)}/sem</Pill>)}</div>
        <div className="grid md:grid-cols-2 gap-3">
          {m.plan_30_dias.semanas.map((s, i) => (
            <div key={i} className="p-4 bg-slate-900/60 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Semana {s.semana}</p>
              <p className="text-white font-bold">{s.tema}</p><p className="text-xs text-slate-500 mb-2">{s.objetivo}</p>
              <Bullets items={s.piezas_clave} />
            </div>
          ))}
        </div>
      </Card>
      <Card title={`Lead magnet · palabra clave "${m.lead_magnet.palabra_clave_dm}"`} copyText={m.lead_magnet.secuencia_dm.join('\n\n')} accent="green">
        <p className="text-white font-bold">{m.lead_magnet.nombre} <Pill>{label(m.lead_magnet.formato)}</Pill></p>
        <p>{m.lead_magnet.promesa}</p>
        <ol className="space-y-2 list-decimal list-inside">{m.lead_magnet.secuencia_dm.map((x, i) => <li key={i}>{x}</li>)}</ol>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card title="Activos de autoridad">{m.activos_autoridad.map((x, i) => <p key={i}><Pill tone={x.prioridad === 'alta' ? 'red' : 'slate'}>{x.prioridad}</Pill> <b className="text-white">{label(x.tipo)}:</b> {x.accion} <span className="text-slate-500">({x.plazo_dias} días)</span></p>)}</Card>
        <Card title="Métricas">{m.metricas.map((x, i) => <p key={i}>{x.es_norte && '⭐ '}<b className="text-white">{x.nombre}:</b> 30d {x.meta_30d} · 90d {x.meta_90d}</p>)}</Card>
      </div>
      <Card title="Argumento para el closer" copyText={`${m.argumento_closer.pitch}\n\n"${m.argumento_closer.objecion_probable}"\n${m.argumento_closer.respuesta}`} accent="green">
        <Quote>{m.argumento_closer.pitch}</Quote>
        <p><b className="text-white">Objeción:</b> "{m.argumento_closer.objecion_probable}"</p>
        <p><b className="text-white">Respuesta:</b> {m.argumento_closer.respuesta}</p>
      </Card>
    </div>
  );
}

const RENDERERS = { estrategia: EstrategiaSection, narrativa: NarrativaSection, copy: CopySection, marca_personal: MarcaSection };

// ---------- Vista principal ----------

export default function AnalyzerView({ onBack, onPractice, onTrainObjections }) {
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState(DEFAULT_MODE);
  const [analysis, setAnalysis] = useState(null);
  const [status, setStatus] = useState({});
  const [activeTab, setActiveTab] = useState('estrategia');
  const [history, setHistory] = useState(loadHistory);
  const [showHistory, setShowHistory] = useState(false);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState(null);
  const [instruction, setInstruction] = useState('');

  // Ref con la última versión del análisis: evita que dos regeneraciones simultáneas se pisen.
  const analysisRef = useRef(null);
  const updateAnalysis = (next) => { analysisRef.current = next; setAnalysis(next); };
  const persist = (a) => setHistory(upsertAnalysis(a));

  const analyze = async () => {
    const text = description.trim();
    if (text.length < 15 || running) return;
    setRunning(true);
    setNotice(null);
    setActiveTab('estrategia');
    setStatus(Object.fromEntries(SECTIONS.map((s) => [s.id, 'loading'])));
    const base = { id: Date.now(), createdAt: new Date().toISOString(), description: text, title: text.slice(0, 60), sections: {}, origins: {} };
    updateAnalysis(base);
    let current = base;
    const { invalid } = await runAnalysis(text, {
      mode,
      onSection: (id, r) => {
        current = { ...current, sections: { ...current.sections, [id]: r.data }, origins: { ...current.origins, [id]: r.origin } };
        if (id === 'estrategia') current.title = r.data.diagnostico.subnicho || current.title;
        updateAnalysis(current);
        setStatus((prev) => ({ ...prev, [id]: r.origin }));
        if (r.error) setNotice('No se pudo contactar al modelo de IA; algunas secciones se generaron con el motor local (modo demo).');
      },
    });
    if (invalid) {
      setNotice('La IA no reconoció un negocio en el texto. Describe qué vende, a quién y dónde.');
      setStatus({});
      updateAnalysis(null);
    } else {
      persist(current);
    }
    setRunning(false);
  };

  const regenerate = async (sectionId) => {
    const start = analysisRef.current;
    if (!start || running || status[sectionId] === 'loading') return;
    setStatus((prev) => ({ ...prev, [sectionId]: 'loading' }));
    const r = await generateSection(sectionId, start.description, {
      estrategia: start.sections.estrategia, mode, instruction: instruction.trim() || undefined,
    });
    const latest = analysisRef.current;
    if (!latest || latest.id !== start.id) return; // el usuario abrió otro análisis mientras tanto
    const next = { ...latest, sections: { ...latest.sections, [sectionId]: r.data }, origins: { ...latest.origins, [sectionId]: r.origin } };
    updateAnalysis(next);
    persist(next);
    setStatus((prev) => ({ ...prev, [sectionId]: r.origin }));
    if (r.error) setNotice('No se pudo contactar al modelo de IA; la sección se regeneró con el motor local.');
    setInstruction('');
  };

  const openFromHistory = (a) => {
    if (running) return;
    updateAnalysis(a);
    setDescription(a.description);
    setStatus(Object.fromEntries(SECTIONS.map((s) => [s.id, a.origins?.[s.id] || 'ia'])));
    setActiveTab('estrategia');
    setShowHistory(false);
    setNotice(null);
  };

  const complete = analysis && SECTIONS.every((s) => analysis.sections[s.id]);
  const ActiveRenderer = RENDERERS[activeTab];
  const est = analysis?.sections.estrategia;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-700 text-slate-200">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <button onClick={onBack} className="text-slate-600 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
          <ChevronRight className="rotate-180" size={20} /> Volver
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowHistory((v) => !v)} className="px-4 py-2 rounded-full border border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white flex items-center gap-2">
            <History size={14} /> Historial ({history.length})
          </button>
          <div className="flex rounded-full border border-slate-800 p-1 text-[10px] font-black uppercase tracking-widest">
            <button onClick={() => setMode('ia')} className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 ${mode === 'ia' ? 'bg-blue-600 text-white' : 'text-slate-500'}`} title={providerLabel()}><Sparkles size={12} /> IA</button>
            <button onClick={() => setMode('demo')} className={`px-4 py-1.5 rounded-full flex items-center gap-1.5 ${mode === 'demo' ? 'bg-amber-500 text-black' : 'text-slate-500'}`} title="Plantillas locales, sin llamadas a la IA"><FlaskConical size={12} /> Demo</button>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 space-y-2">
          {history.length === 0 && <p className="text-slate-500 text-sm">Aún no hay análisis guardados.</p>}
          {history.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-800/60">
              <button onClick={() => openFromHistory(a)} className="text-left flex-1">
                <p className="text-white font-bold">{a.title}</p>
                <p className="text-[10px] text-slate-500">{new Date(a.createdAt).toLocaleString('es')} · {a.description.slice(0, 80)}</p>
              </button>
              <button onClick={() => setHistory(deleteAnalysis(a.id))} className="text-slate-600 hover:text-red-500 p-2" title="Eliminar"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-10 space-y-6 shadow-2xl">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">Analizador de Negocio</h2>
          <p className="text-slate-500 text-sm mt-3">Describe cualquier negocio y el equipo Logos (estrategia, storytelling, copywriting y marca personal) armará la propuesta que debes presentar.</p>
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={2000}
          placeholder="Ej.: Clínica dental en Bogotá con 4 sillones, 2 dentistas y 1.500 seguidores en Instagram. Los pacientes preguntan precio por WhatsApp y no agendan..."
          className="w-full bg-black border border-slate-800 rounded-[2rem] p-6 text-base h-40 focus:border-blue-500 outline-none resize-none text-white placeholder:text-slate-700"
        />
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex} onClick={() => setDescription(ex)} className="px-3 py-1.5 rounded-full bg-slate-800/60 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 text-left">{ex}</button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">Cuanto más detalle, mejor: qué vende, a quién, dónde, tamaño, redes y seguidores, ticket y qué le duele al dueño.</p>
        <button
          onClick={analyze}
          disabled={running || description.trim().length < 15}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 p-6 rounded-[2rem] font-black text-white flex items-center justify-center gap-4 text-xs tracking-[0.4em] uppercase shadow-[0_20px_50px_rgba(59,130,246,0.3)]"
        >
          {running ? <><RefreshCw className="animate-spin" size={20} /> Analizando...</> : <><Wand2 size={20} /> Generar propuesta {mode === 'demo' && '(demo)'}</>}
        </button>
        {notice && <div className="flex gap-3 items-start p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-amber-300 text-sm"><AlertCircle size={18} className="shrink-0 mt-0.5" /> {notice}</div>}
      </div>

      {analysis && (
        <div className="space-y-6">
          {est && (
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 flex flex-col lg:flex-row gap-6 justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">{est.diagnostico.industria}</p>
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{est.diagnostico.subnicho}</h3>
                <div className="flex flex-wrap gap-2">
                  <Pill tone="green">Oportunidad {est.diagnostico.score_oportunidad}/100</Pill>
                  <Pill tone={est.diagnostico.confianza_diagnostico < 60 ? 'amber' : 'blue'}>Confianza {est.diagnostico.confianza_diagnostico}%</Pill>
                  <Pill>Dificultad {est.diagnostico.dificultad_juego}</Pill>
                  <Pill tone="green">${money(est.oferta.pricing.mensual_recomendado_usd)} USD/mes</Pill>
                </div>
                {est.diagnostico.confianza_diagnostico < 60 && <p className="text-xs text-amber-400">Confianza baja: usa las preguntas de descubrimiento antes de presentar números.</p>}
              </div>
              <div className="flex flex-wrap lg:flex-col gap-3 lg:w-64">
                <button onClick={() => onPractice(analysisToLead(analysis))} disabled={!complete} className="flex-1 px-6 py-4 bg-white text-black rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 disabled:opacity-30"><Swords size={16} /> Practicar el cierre</button>
                <button onClick={() => onTrainObjections(analysisToLead(analysis))} disabled={!complete} className="flex-1 px-6 py-4 bg-amber-500 text-black rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 disabled:opacity-30"><ShieldAlert size={16} /> Entrenar objeciones</button>
                <button onClick={() => copyToClipboard(analysisToMarkdown(analysis))} disabled={!complete} className="flex-1 px-6 py-4 bg-slate-800 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 disabled:opacity-30"><Copy size={16} /> Copiar todo</button>
                {DOWNLOADS_ENABLED && <button onClick={() => downloadText(`propuesta-${analysis.id}.md`, analysisToMarkdown(analysis))} disabled={!complete} className="flex-1 px-6 py-4 bg-slate-800 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 disabled:opacity-30"><Download size={16} /> Exportar .md</button>}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => {
              const Icon = SECTION_ICONS[s.id];
              const st = status[s.id];
              return (
                <button key={s.id} onClick={() => setActiveTab(s.id)} className={`px-5 py-3 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === s.id ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-800 text-slate-500 hover:text-white'}`}>
                  {st === 'loading' ? <RefreshCw size={14} className="animate-spin" /> : <Icon size={14} />} {s.label}
                  {st === 'demo' && <span className="px-1.5 rounded bg-amber-500 text-black">demo</span>}
                </button>
              );
            })}
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-[3rem] p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Especialista: {SECTIONS.find((s) => s.id === activeTab)?.specialist}</p>
              <div className="flex gap-2 flex-1 md:max-w-lg">
                <input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Indicación opcional (p.ej. más agresivo, ticket más alto)" className="flex-1 bg-black border border-slate-800 rounded-full px-4 py-2 text-xs text-white outline-none focus:border-blue-500" />
                <button onClick={() => regenerate(activeTab)} disabled={running || !analysis.sections[activeTab] || status[activeTab] === 'loading'} className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-30">
                  <RefreshCw size={12} className={status[activeTab] === 'loading' ? 'animate-spin' : ''} /> Regenerar
                </button>
              </div>
            </div>
            {analysis.sections[activeTab]
              ? <ActiveRenderer data={analysis.sections[activeTab]} />
              : <div className="py-20 flex flex-col items-center gap-4 text-slate-500"><RefreshCw className="animate-spin" size={32} /><p className="text-xs uppercase tracking-widest font-black">El especialista está trabajando...</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
