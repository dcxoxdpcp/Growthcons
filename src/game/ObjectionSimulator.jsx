import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Send, RefreshCw, ShieldAlert, Trophy, Skull, Lightbulb, Swords } from 'lucide-react';
import {
  STAGES, MAX_TURNS, WIN_RESISTANCE, startingResistance, evaluateObjectionTurn, applyTurn, sessionXp, objectionOptions,
} from './objections.js';

const ResistanceBar = ({ value }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.3em]">
      <span className="text-slate-500">Resistencia del CEO</span>
      <span className={value <= WIN_RESISTANCE ? 'text-green-400' : value >= 75 ? 'text-red-400' : 'text-amber-400'}>{value}/100</span>
    </div>
    <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full transition-all duration-700 ${value <= WIN_RESISTANCE ? 'bg-green-500' : value >= 75 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${value}%` }} />
      <div className="absolute top-0 h-full border-l-2 border-dashed border-green-400/70" style={{ left: `${WIN_RESISTANCE}%` }} title="Zona de cierre" />
    </div>
    <p className="text-[10px] text-slate-600">Baja la resistencia por debajo de {WIN_RESISTANCE} en máximo {MAX_TURNS} respuestas.</p>
  </div>
);

const TurnScore = ({ evaluation }) => (
  <div className="mt-3 p-4 rounded-2xl bg-black/50 border border-white/5 space-y-3 text-xs">
    <div className="grid grid-cols-4 gap-2">
      {STAGES.map((s) => {
        const p = evaluation.etapas[s.id]?.puntos ?? 0;
        return (
          <div key={s.id} title={evaluation.etapas[s.id]?.comentario}>
            <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-500"><span>{s.label}</span><span>{p}</span></div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${p >= 18 ? 'bg-green-500' : p >= 10 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(p / 25) * 100}%` }} /></div>
          </div>
        );
      })}
    </div>
    <p className="text-slate-400"><b className="text-white">{evaluation.total}/100.</b> {evaluation.feedback}</p>
    {STAGES.filter((s) => (evaluation.etapas[s.id]?.puntos ?? 0) < 18).map((s) => (
      <p key={s.id} className="text-slate-500">› <b className="text-slate-300">{s.label}:</b> {evaluation.etapas[s.id]?.comentario}</p>
    ))}
    {evaluation.mejor_frase && <p className="text-green-400">✓ Mejor frase: “{evaluation.mejor_frase}”</p>}
    {evaluation.reescritura?.original && (
      <div className="space-y-1">
        <p className="text-red-300 line-through">{evaluation.reescritura.original}</p>
        <p className="text-green-300">{evaluation.reescritura.sugerencia}</p>
      </div>
    )}
  </div>
);

/**
 * Props:
 *  - lead: lead del simulador (puede venir del analizador, con brief.objeciones)
 *  - initialObjection: { text, tipo } | null  (null => el jugador elige, modo entrenamiento)
 *  - context: 'game' | 'training'
 *  - onFinish({ won, xp, turns })  se llama una sola vez al terminar
 *  - onExit()
 */
export default function ObjectionSimulator({ lead, initialObjection, context = 'game', onFinish, onExit }) {
  const [objection, setObjection] = useState(initialObjection);
  const [messages, setMessages] = useState(initialObjection ? [{ role: 'ceo', text: initialObjection.text }] : []);
  const [turns, setTurns] = useState([]);
  const [resistance, setResistance] = useState(startingResistance(lead?.difficulty));
  const [status, setStatus] = useState('playing');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const finished = useRef(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' }); }, [messages]);

  const choose = (o) => {
    setObjection(o);
    setMessages([{ role: 'ceo', text: o.text }]);
  };

  const send = async () => {
    const text = reply.trim();
    if (!text || busy || status !== 'playing') return;
    setBusy(true);
    const history = [...messages, { role: 'closer', text }];
    setMessages(history);
    setReply('');
    const evaluation = await evaluateObjectionTurn({ lead, history: messages, reply: text, objection, resistance });
    const turnNumber = turns.length + 1;
    const result = applyTurn({ resistance, turn: turnNumber, evaluation });
    const nextTurns = [...turns, { reply: text, evaluation, resistanceBefore: resistance, resistanceAfter: result.resistance }];
    setTurns(nextTurns);
    setResistance(result.resistance);
    setMessages([...history.slice(0, -1), { role: 'closer', text, evaluation }, { role: 'ceo', text: result.ceoReply, final: result.status !== 'playing' }]);
    setStatus(result.status);
    if (evaluation.nueva_objecion_tipo) setObjection((o) => ({ ...o, tipo: evaluation.nueva_objecion_tipo }));
    if (result.status !== 'playing' && !finished.current) {
      finished.current = true;
      onFinish?.({ won: result.status === 'won', xp: sessionXp(nextTurns, result.status === 'won'), turns: nextTurns });
    }
    setBusy(false);
  };

  const xp = sessionXp(turns, status === 'won');
  const avg = turns.length ? Math.round(turns.reduce((a, t) => a + t.evaluation.total, 0) / turns.length) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-700 text-slate-200">
      <div className="flex justify-between items-center">
        <button onClick={onExit} className="text-slate-600 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
          <ChevronRight className="rotate-180" size={20} /> {status === 'playing' && turns.length > 0 ? 'Rendirse' : 'Salir'}
        </button>
        <div className="px-6 py-2 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
          <Swords size={14} /> {context === 'training' ? 'Entrenamiento de objeciones' : 'Objeción en vivo'}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-10 space-y-8 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-amber-500/10 rounded-[1.5rem] flex items-center justify-center text-5xl border border-amber-500/10">{lead?.icon || '🧑‍💼'}</div>
          <div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{lead?.nicheName}</h2>
            <p className="text-xs text-slate-500 mt-2">Dolor: {lead?.activePain} · Dificultad {lead?.difficulty || 'Media'}</p>
          </div>
        </div>

        {!objection ? (
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Elige la objeción a entrenar</p>
            {objectionOptions(lead).map((o, i) => (
              <button key={i} onClick={() => choose(o)} className="w-full text-left p-4 rounded-2xl bg-black/40 border border-slate-800 hover:border-amber-500 transition-all">
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 mr-3">{o.tipo}</span>
                <span className="italic text-white">“{o.text}”</span>
              </button>
            ))}
          </div>
        ) : (
          <>
            <ResistanceBar value={resistance} />

            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'ceo' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[90%] ${m.role === 'ceo' ? '' : 'w-full'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${m.role === 'ceo' ? 'text-amber-400' : 'text-blue-400 text-right'}`}>{m.role === 'ceo' ? 'CEO' : `Tú · turno ${messages.slice(0, i + 1).filter((x) => x.role === 'closer').length}`}</p>
                    <div className={`p-5 rounded-[1.5rem] text-sm leading-relaxed ${m.role === 'ceo' ? 'bg-black/60 border border-amber-500/20 italic text-slate-200' : 'bg-blue-600/10 border border-blue-500/20 text-white'}`}>{m.text}</div>
                    {m.evaluation && <TurnScore evaluation={m.evaluation} />}
                  </div>
                </div>
              ))}
              {busy && <div className="flex items-center gap-3 text-slate-500 text-xs"><RefreshCw className="animate-spin" size={14} /> El CEO está pensando...</div>}
              <div ref={endRef} />
            </div>

            {status === 'playing' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Respuesta {turns.length + 1} de {MAX_TURNS}</p>
                  <button onClick={() => setShowTips((v) => !v)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-400 flex items-center gap-1"><Lightbulb size={12} /> {showTips ? 'Ocultar guía' : 'Ver guía'}</button>
                </div>
                {showTips && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {STAGES.map((s, i) => (
                      <div key={s.id} className="p-3 rounded-2xl bg-black/40 border border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">{i + 1}. {s.label}</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{s.tip}</p>
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) send(); }}
                  placeholder="Responde como lo harías en la llamada... (Ctrl+Enter para enviar)"
                  className="w-full bg-black border border-slate-800 rounded-[2rem] p-6 text-base h-36 focus:border-amber-500 outline-none resize-none text-white placeholder:text-slate-700"
                />
                <button onClick={send} disabled={busy || !reply.trim()} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-30 p-6 rounded-[2rem] font-black text-black flex items-center justify-center gap-4 text-xs tracking-[0.4em] uppercase">
                  {busy ? <RefreshCw className="animate-spin" size={20} /> : <><Send size={20} /> Responder</>}
                </button>
              </div>
            ) : (
              <div className={`p-8 rounded-[2.5rem] border text-center space-y-4 ${status === 'won' ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'}`}>
                {status === 'won' ? <Trophy size={40} className="mx-auto text-green-400" /> : <Skull size={40} className="mx-auto text-red-400" />}
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{status === 'won' ? 'Objeción superada' : 'Trato perdido'}</h3>
                <p className="text-sm text-slate-400">
                  {turns.length} respuesta(s) · nota media {avg}/100 · +{xp} XP
                  {context === 'game' && status === 'won' && !lead?.alreadyClosed && ' · Cliente añadido al Holding'}
                </p>
                {status === 'lost' && <p className="text-xs text-slate-500 flex items-center justify-center gap-2"><ShieldAlert size={14} /> Revisa la etapa con menor puntuación de cada turno e inténtalo con otro lead.</p>}
                <button onClick={onExit} className="px-10 py-4 bg-white text-black rounded-full font-black uppercase tracking-[0.4em] text-[10px]">Continuar</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
