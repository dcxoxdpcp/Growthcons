import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Zap, DollarSign, Brain, Send, User, MessageSquare, Settings, 
  Briefcase, ChevronRight, AlertCircle, Trophy, Coffee, CheckCircle, RefreshCw, 
  Sparkles, ArrowRight, Skull, Star, Users, ShieldAlert, UserPlus, Coins, 
  PieChart, Megaphone, Globe, Crown, Building2, Rocket, Target, BarChart3, HelpCircle, X,
  Info, Wand2, Swords
} from 'lucide-react';
import { NICHES, FRAMEWORKS, FRAMEWORK_DEFINITIONS, FRAMEWORK_PLACEHOLDERS } from './game/constants.js';
import { evaluateProposal, optimizeProposal, SUCCESS_THRESHOLD } from './game/evaluation.js';
import AnalyzerView from './features/analyzer/AnalyzerView.jsx';
import ObjectionSimulator from './game/ObjectionSimulator.jsx';
import { pickInitialObjection } from './game/objections.js';

// --- CONFIGURACIÓN Y CONSTANTES ---

const TUTORIAL_STEPS = [
  { id: 'welcome', title: 'Bienvenido, Operador', content: 'Tu objetivo es escalar negocios reales usando marketing y sistemas. De cero a un imperio.', target: 'none' },
  { id: 'stats', title: 'Recursos Críticos', content: 'La ⚡ Energía limita tus acciones diarias. El 💰 Capital es tu éxito. La 🧠 Autoridad desbloquea tratos de élite.', target: 'stats' },
  { id: 'sales', title: 'El Motor de Ventas', content: 'Usa "Sales" para encontrar leads. Deberás atacar el dolor raíz usando frameworks profesionales.', target: 'sales' },
  { id: 'analyzer', title: 'Analizador de Negocio', content: 'Describe cualquier negocio real y el equipo Logos armará la propuesta completa: diagnóstico, oferta, narrativa, copy y marca personal. Luego practica el cierre con ese mismo negocio.', target: 'analyzer' },
  { id: 'holding', title: 'Gestión de Holding', content: 'Aquí verás tus clientes. Si no los operas, su satisfacción bajará y perderás el contrato.', target: 'holding' },
  { id: 'cycle', title: 'El Ciclo Diario', content: 'Cuando agotes tu energía, cierra el ciclo para cobrar retainers y dividendos.', target: 'coffee' }
];

const INITIAL_SKILLS = [
  { id: 'hook', name: 'Copywriting Pro', branch: 'Ventas', cost: 100, level: 0, max: 10, description: 'Bonus de +2 puntos por nivel en la nota de tus propuestas.' },
  { id: 'branding', name: 'Autoridad de Marca', branch: 'Inbound', cost: 500, level: 0, max: 10, description: 'Genera leads automáticos.' },
  { id: 'negotiation', name: 'Negociación Equity', branch: 'Venture', cost: 1000, level: 0, max: 10, description: 'Aumenta dividendos de participaciones.' },
  { id: 'saas_logic', name: 'Arquitectura SaaS', branch: 'Empire', cost: 5000, level: 0, max: 10, description: 'Escala ingresos por software.' }
];

const STAFF_ROLES = [
  { id: 'va', name: 'Asistente Virtual', cost: 500, salary: 50, power: 5, icon: <User size={18}/>, desc: 'Mantenimiento básico de clientes.' },
  { id: 'manager', name: 'Account Manager', cost: 2000, salary: 200, power: 15, icon: <Users size={18}/>, desc: 'Gestión profesional de cuentas.' },
  { id: 'ceo', name: 'Director Operativo', cost: 10000, salary: 1000, power: 50, icon: <Crown size={18}/>, desc: 'Automatiza el Churn casi al 100%.' }
];

const RANDOM_EVENTS = [
  { title: "¡Exit de Startup!", desc: "Una empresa socia fue vendida.", impact: { money: 15000, xp: 500, satisfaction: 0 } },
  { title: "Crisis Sectorial", desc: "El mercado ha caído temporalmente.", impact: { money: -500, xp: 0, satisfaction: -10 } },
  { title: "Referido VIP", desc: "Un cliente feliz te recomendó.", impact: { money: 1000, xp: 200, satisfaction: 10 } }
];

// --- COMPONENTES AUXILIARES ---

const StatCard = ({ icon, label, value, color, id }) => {
  const colors = {
    yellow: "border-yellow-500/20 bg-yellow-500/5 text-yellow-500",
    green: "border-green-500/20 bg-green-500/5 text-green-500",
    blue: "border-blue-500/20 bg-blue-500/5 text-blue-500",
    purple: "border-purple-500/20 bg-purple-500/5 text-purple-500",
    gold: "border-amber-500/40 bg-amber-500/10 text-amber-400"
  };
  return (
    <div id={id} className={`p-4 rounded-3xl border ${colors[color] || colors.blue} backdrop-blur-xl transition-all duration-500`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-[10px] uppercase font-black tracking-widest opacity-60">{label}</span>
      </div>
      <div className="text-xl font-black text-white">{value}</div>
    </div>
  );
};

const NavBtn = ({ icon, label, onClick, disabled, badge, color, id }) => {
  const colors = {
    blue: "hover:border-blue-500 text-blue-500 bg-blue-500/5",
    purple: "hover:border-purple-500 text-purple-500 bg-purple-500/5",
    green: "hover:border-green-500 text-green-500 bg-green-500/5",
    yellow: "hover:border-yellow-500 text-yellow-500 bg-yellow-500/5",
    gold: "hover:border-amber-500 text-amber-500 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]"
  };
  return (
    <button id={id} onClick={onClick} disabled={disabled} className={`p-8 border border-slate-800 rounded-[2.5rem] flex flex-col items-center gap-3 transition-all disabled:opacity-10 group relative shadow-xl ${colors[color] || ""}`}>
      {icon && React.isValidElement(icon) ? React.cloneElement(icon, { size: 36, className: "group-hover:scale-125 transition-transform duration-700" }) : null}
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 group-hover:text-white transition-colors">{label}</span>
      {badge > 0 && <span className="absolute top-6 right-6 bg-white text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xl animate-in zoom-in">{badge}</span>}
    </button>
  );
};

// Desglose de la rúbrica: criterios, pasos del framework, clichés y reescrituras sugeridas.
const FeedbackDetails = ({ feedback }) => {
  const { criterios = [], pasos = [], cliches_detectados = [], reescrituras = [], story_score, story_tip, siguiente_ejercicio, objecion_probable } = feedback || {};
  if (!criterios.length && !reescrituras.length) return null;
  return (
    <div className="space-y-8 mb-10">
      {criterios.length > 0 && (
        <div className="space-y-3">
          <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-[10px]">Rúbrica</p>
          {criterios.map((c, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11px] text-slate-400"><span className="uppercase font-black tracking-widest">{c.id}</span><span>{c.puntos}/{c.max}</span></div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className={`h-full ${c.puntos / c.max >= 0.7 ? 'bg-green-500' : c.puntos / c.max >= 0.4 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (c.puntos / (c.max || 1)) * 100)}%` }} /></div>
              {c.justificacion && <p className="text-[11px] text-slate-500 mt-1">{c.justificacion}</p>}
            </div>
          ))}
        </div>
      )}
      {pasos.some(p => p.score != null) && (
        <div className="space-y-2">
          <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-[10px]">Pasos del framework</p>
          {pasos.map((p, i) => <p key={i} className="text-sm text-slate-400"><span className={p.presente ? 'text-green-400' : 'text-red-400'}>{p.presente ? '✓' : '✗'}</span> <b className="text-white">{p.paso}</b>{p.score != null && ` (${p.score}/10)`} — {p.comentario}</p>)}
        </div>
      )}
      {cliches_detectados.length > 0 && <p className="text-sm text-red-400">Clichés detectados: {cliches_detectados.map(c => `“${c}”`).join(', ')}</p>}
      {reescrituras.length > 0 && (
        <div className="space-y-3">
          <p className="text-blue-400 font-black uppercase tracking-[0.4em] text-[10px]">Reescribe estas frases</p>
          {reescrituras.map((r, i) => (
            <div key={i} className="p-4 rounded-2xl bg-black/60 text-sm space-y-1">
              <p className="text-red-300 line-through">{r.original}</p>
              <p className="text-green-300">{r.sugerencia}</p>
              <p className="text-[11px] text-slate-500">{r.problema}</p>
            </div>
          ))}
        </div>
      )}
      {story_score != null && <p className="text-sm text-slate-400"><b className="text-purple-400">Storytelling {story_score}/100.</b> {story_tip}</p>}
      {objecion_probable && <p className="text-sm text-slate-400"><b className="text-amber-400">Objeción probable:</b> {objecion_probable}</p>}
      {siguiente_ejercicio && <p className="text-sm text-slate-400"><b className="text-blue-400">Siguiente ejercicio:</b> {siguiente_ejercicio}</p>}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [hasError, setHasError] = useState(false);
  const [view, setView] = useState('onboarding');
  const [player, setPlayer] = useState({
    money: 0, energy: 10, maxEnergy: 10, xp: 0, day: 1, 
    niche: null, skills: INITIAL_SKILLS, clients: [], staff: [],
    saasActive: false, saasUsers: 0, acquisitions: 0, tutorialFinished: false
  });

  const [logs, setLogs] = useState(["Logos AI: Sistema activado. Identifica el dolor y opera."]);
  const [isTyping, setIsTyping] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [outreachMsg, setOutreachMsg] = useState("");
  const [historyMsg, setHistoryMsg] = useState(""); 
  const [selectedFramework, setSelectedFramework] = useState('pas');
  const [currentLead, setCurrentLead] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [optimizedProposal, setOptimizedProposal] = useState(null);
  const [dailyEvent, setDailyEvent] = useState(null);
  const [tutorialStep, setTutorialStep] = useState(-1);
  const [showFrameworkHelp, setShowFrameworkHelp] = useState(false);
  const [objectionSession, setObjectionSession] = useState(null);

  useEffect(() => {
    const handleError = (e) => { console.error("Error capturado:", e); setHasError(true); };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const addLog = (msg) => setLogs(prev => [msg, ...prev.slice(0, 5)]);

  // --- IA: evaluación y optimización (src/game/evaluation.js) ---
  const fetchAIEvaluation = async (message, lead, frameworkId) => {
    setIsTyping(true);
    try {
      const copyLevel = player.skills.find(s => s.id === 'hook')?.level || 0;
      return await evaluateProposal(message, lead, frameworkId, { copyLevel });
    } finally { setIsTyping(false); }
  };

  const fetchOptimizedProposal = async () => {
    if (isOptimizing) return;
    setIsOptimizing(true);
    try {
      setOptimizedProposal(await optimizeProposal(historyMsg, currentLead, selectedFramework, aiFeedback));
    } finally { setIsOptimizing(false); }
  };

  const practiceAnalyzedLead = (lead) => {
    setCurrentLead(lead);
    const fw = lead.brief?.framework_recomendado;
    if (FRAMEWORKS.some(f => f.id === fw)) setSelectedFramework(fw);
    setAiFeedback(null);
    setOptimizedProposal(null);
    setView('terminal');
    addLog(`Simulación con negocio analizado: ${lead.nicheName}.`);
  };

  // --- SIMULADOR DE OBJECIONES ---
  const OBJECTION_COST = 2;

  const startObjectionSim = () => {
    if (player.energy < OBJECTION_COST) return addLog('Energía insuficiente para la objeción.');
    setPlayer(prev => ({ ...prev, energy: prev.energy - OBJECTION_COST }));
    setObjectionSession({
      lead: { ...currentLead, alreadyClosed: !!aiFeedback?.success },
      objection: pickInitialObjection(currentLead, aiFeedback),
      context: 'game',
    });
    setView('objections');
  };

  const trainObjections = (lead) => {
    setObjectionSession({ lead, objection: null, context: 'training' });
    setView('objections');
  };

  const finishObjectionSim = ({ won, xp }) => {
    const { lead, context } = objectionSession;
    const rescued = context === 'game' && won && !lead.alreadyClosed;
    setPlayer(prev => ({
      ...prev,
      xp: prev.xp + xp,
      clients: rescued
        ? [...prev.clients, { ...lead, id: Date.now(), monthly: lead.monthly || 250, satisfaction: 70, equity: 0, nicheName: lead.nicheName }]
        : prev.clients,
    }));
    addLog(won
      ? `Objeción superada (+${xp} XP)${rescued ? ` — ¡Trato rescatado: ${lead.nicheName}!` : '.'}`
      : `El CEO no se convenció (+${xp} XP). Revisa tus etapas más débiles.`);
  };

  const exitObjectionSim = () => {
    const fromAnalysis = objectionSession?.context === 'training' || objectionSession?.lead?.fromAnalysis;
    setObjectionSession(null);
    setAiFeedback(null);
    setOptimizedProposal(null);
    setView(fromAnalysis ? 'analyzer' : 'dashboard');
  };

  const leaveTerminal = () => {
    setView(currentLead?.fromAnalysis ? 'analyzer' : 'dashboard');
    setAiFeedback(null);
    setOptimizedProposal(null);
  };

  // --- MECÁNICAS ---

  const generateNewLead = () => {
    const n = NICHES[Math.floor(Math.random() * NICHES.length)];
    const pain = n.pains[Math.floor(Math.random() * n.pains.length)];
    setCurrentLead({ ...n, nicheName: n.name, activePain: pain });
    setView('terminal');
  };

  const handleOutreach = async () => {
    if (player.energy < 3) return addLog("Energía insuficiente.");
    const msg = outreachMsg;
    setHistoryMsg(msg);
    setOutreachMsg("");
    const res = await fetchAIEvaluation(msg, currentLead, selectedFramework);
    // Skill "Copywriting Pro": +2 puntos por nivel sobre la nota final.
    const copyBonus = (player.skills.find(s => s.id === 'hook')?.level || 0) * 2;
    const finalScore = Math.min(100, (res?.score || 0) + copyBonus);
    const success = finalScore >= SUCCESS_THRESHOLD;
    setAiFeedback({ ...res, copyBonus, finalScore, success });

    setPlayer(prev => {
      const newClients = success ? [...prev.clients, { ...currentLead, id: Date.now(), monthly: currentLead.monthly || 250, satisfaction: 80, equity: 0, nicheName: currentLead.nicheName }] : prev.clients;
      return { ...prev, energy: prev.energy - 3, xp: prev.xp + (res?.xp_gained || 0), clients: newClients };
    });
    addLog(`Resultado: ${res?.reaction || 'Ignorado'}${success ? ` — ¡Cliente cerrado: ${currentLead.nicheName}!` : '.'}`);
  };

  const startNewDay = () => {
    const branding = player.skills.find(s => s.id === 'branding')?.level || 0;
    const saasSkill = player.skills.find(s => s.id === 'saas_logic')?.level || 0;
    const staffSalary = player.staff.reduce((acc, id) => acc + (STAFF_ROLES.find(r => r.id === id)?.salary || 0), 0);
    const staffPower = player.staff.reduce((acc, id) => acc + (STAFF_ROLES.find(r => r.id === id)?.power || 0), 0);
    
    const lossBase = Math.max(0, 15 - staffPower);
    let dividends = 0;
    let retainers = 0;

    const updatedClients = player.clients.map(c => {
      const newSat = Math.max(0, (c.satisfaction || 0) - lossBase);
      return { ...c, satisfaction: newSat };
    }).filter(c => c.satisfaction > 0);
    // Solo pagan los clientes que siguen activos tras el cierre del día.
    updatedClients.forEach(c => {
      if (c.equity > 0) dividends += (c.equity * 100) * (c.satisfaction / 100);
      retainers += c.monthly;
    });
    const churned = player.clients.length - updatedClients.length;
    if (churned > 0) addLog(`Perdiste ${churned} cliente(s) por baja satisfacción.`);

    const saasRev = player.saasActive ? (player.saasUsers * (12 + saasSkill)) : 0;
    const acqRev = player.acquisitions * 2000;
    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    setDailyEvent(event);

    setPlayer(prev => ({
      ...prev, day: prev.day + 1, energy: prev.maxEnergy,
      money: prev.money + retainers + dividends + saasRev + acqRev - staffSalary + (event.impact?.money || 0),
      xp: prev.xp + (event.impact?.xp || 0) + (branding * 25),
      clients: updatedClients,
      saasUsers: prev.saasActive ? prev.saasUsers + Math.floor(prev.xp / 40) : 0
    }));
  };

  const hireStaff = (roleId) => {
    const role = STAFF_ROLES.find(r => r.id === roleId);
    if (player.money >= role.cost) {
      setPlayer(prev => ({ ...prev, money: prev.money - role.cost, staff: [...prev.staff, roleId] }));
      addLog(`Contratado: ${role.name}`);
    }
  };

  const convertToEquity = (clientId) => {
    const negSkill = player.skills.find(s => s.id === 'negotiation')?.level || 0;
    if (negSkill < 3) return addLog("Necesitas nivel 3 de Negociación.");
    setPlayer(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === clientId ? { ...c, equity: Math.min(25, 10 + negSkill), monthly: 100 } : c)
    }));
  };

  const launchSaaS = () => {
    if (player.money < 10000) return addLog("Necesitas $10k para el SaaS.");
    setPlayer(prev => ({ ...prev, money: prev.money - 10000, saasActive: true, saasUsers: 100 }));
  };

  const acquireAgency = () => {
    if (player.money < 25000) return addLog("Necesitas $25k para adquirir competencia.");
    setPlayer(prev => ({ ...prev, money: prev.money - 25000, acquisitions: prev.acquisitions + 1, xp: prev.xp + 2000 }));
  };

  const upgradeSkill = (id) => {
    const s = player.skills.find(x => x.id === id);
    if (player.money >= s?.cost && s?.level < s?.max) {
      setPlayer(prev => ({
        ...prev, money: prev.money - s.cost,
        skills: prev.skills.map(x => x.id === id ? { ...x, level: x.level + 1, cost: Math.floor(x.cost * 1.5) } : x)
      }));
    }
  };

  // --- TUTORIAL ---
  const TutorialOverlay = () => {
    if (tutorialStep < 0 || tutorialStep >= TUTORIAL_STEPS.length) return null;
    const step = TUTORIAL_STEPS[tutorialStep];
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-none">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto" onClick={() => setTutorialStep(prev => prev + 1)}></div>
        <div className="bg-slate-900 border border-blue-500/50 p-8 rounded-[3rem] max-w-sm w-full relative pointer-events-auto animate-in zoom-in duration-300 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Logos AI</div>
            <button onClick={() => setTutorialStep(-1)} className="text-slate-500 hover:text-white"><X size={20}/></button>
          </div>
          <h3 className="text-2xl font-black text-white uppercase italic mb-2 leading-none">{step.title}</h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">{step.content}</p>
          <button onClick={() => setTutorialStep(prev => prev + 1)} className="w-full bg-blue-600 py-3 rounded-2xl font-black uppercase text-xs">Continuar</button>
        </div>
      </div>
    );
  };

  // --- MODAL DE AYUDA DE FRAMEWORKS ---
  const FrameworkHelpModal = () => {
    if (!showFrameworkHelp) return null;
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] max-w-2xl w-full shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><Info size={120}/></div>
          <div className="flex justify-between items-center mb-8 relative">
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Guía de Frameworks</h2>
            <button onClick={() => setShowFrameworkHelp(false)} className="text-slate-500 hover:text-white transition-colors p-2 bg-black/20 rounded-full"><X size={24}/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {Object.entries(FRAMEWORK_DEFINITIONS).map(([id, def]) => (
              <div key={id} className="bg-black/40 border border-slate-800 rounded-[2rem] p-6 space-y-4 hover:border-blue-500/50 transition-all">
                <div className="bg-blue-600/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black w-fit uppercase">{id}</div>
                <h3 className="text-white font-black text-xs uppercase tracking-widest">{def.title.split(' (')[0]}</h3>
                <div className="space-y-3">
                  {def.steps.map((s, idx) => (
                    <div key={idx} className="text-[10px] leading-relaxed">
                      <span className="text-blue-400 font-bold block uppercase">{s.key}</span>
                      <p className="text-slate-400">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
             <p className="text-[10px] text-slate-500 italic text-center uppercase tracking-widest">"Un framework no es una cárcel, es una brújula. Úsalo para que tu cliente entienda que tienes un proceso." — Logos AI</p>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDERS ---

  if (hasError) return <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center"><ShieldAlert size={60} className="text-red-500 mb-4" /><h2 className="text-2xl font-black uppercase tracking-tighter">Error de Referencia</h2><button onClick={() => window.location.reload()} className="px-8 py-3 bg-blue-600 rounded-full font-black uppercase text-xs">Reiniciar</button></div>;

  if (view === 'onboarding') return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-white relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse"></div>
      <Brain size={60} className="text-blue-500 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
      <h1 className="text-7xl font-black mb-2 tracking-tighter uppercase italic leading-none text-center">Growth Tutor</h1>
      <p className="text-slate-500 mb-8 uppercase font-black tracking-[0.5em] text-[10px] text-center">Protocolo Logos. Selecciona tu primer Campo de Batalla.</p>
      <button onClick={() => setView('analyzer')} className="mb-10 px-8 py-4 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-all font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-3">
        <Wand2 size={16} /> ¿Tienes un negocio real? Analízalo
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl w-full">
        {NICHES.map(n => (
          <button key={n.id} onClick={() => { setPlayer({...player, niche: n, tutorialFinished: false}); setView('dashboard'); setTutorialStep(0); }} className="group p-8 bg-slate-900/50 border border-slate-800 rounded-[3rem] hover:border-blue-500 transition-all text-left backdrop-blur-md">
            <span className="text-5xl mb-4 block">{n.icon}</span>
            <p className="font-black text-xl uppercase italic tracking-tighter mb-1">{n.name}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-widest leading-relaxed">Rev: {n.intel.revenue}</p>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 w-1/4 group-hover:w-full transition-all duration-1000"></div></div>
          </button>
        ))}
      </div>
    </div>
  );

  if (view === 'retire') return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-10 text-center text-white space-y-8">
      <Crown size={80} className="text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]" />
      <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none text-center">LEGADO CONSOLIDADO</h1>
      <p className="text-slate-500 uppercase tracking-[0.4em] text-xs">Patrimonio del Holding: ${Math.floor(player.money)}</p>
      <button onClick={() => window.location.reload()} className="px-12 py-5 bg-white text-black rounded-full font-black uppercase tracking-[0.5em] text-xs">Nueva Secuencia</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-slate-200 p-4 md:p-8 font-sans selection:bg-blue-500 overflow-x-hidden">
      <TutorialOverlay />
      <FrameworkHelpModal />

      {dailyEvent && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-[4rem] max-w-md w-full text-center space-y-8 shadow-[0_0_80px_rgba(0,0,0,1)] border-t-blue-500/30">
            <Megaphone size={40} className="mx-auto text-blue-500" />
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{dailyEvent.title}</h2>
              <p className="text-slate-400 font-medium leading-relaxed">{dailyEvent.desc}</p>
            </div>
            <button onClick={() => setDailyEvent(null)} className="w-full bg-blue-600 hover:bg-blue-500 p-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] transition-all">Aceptar Veredicto</button>
          </div>
        </div>
      )}

      {view === 'dashboard' && (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard id="stats" icon={<Zap />} label="Energía" value={`${player.energy}/${player.maxEnergy}`} color="yellow" />
            <StatCard icon={<DollarSign />} label="Capital" value={`$${Math.floor(player.money)}`} color="green" />
            <StatCard icon={<Brain />} label="Autoridad" value={Math.floor(player.xp)} color="blue" />
            <StatCard icon={<Trophy />} label="Día" value={player.day} color="purple" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-[3.5rem] p-10 min-h-[400px] flex flex-col justify-between backdrop-blur-2xl relative shadow-2xl overflow-hidden">
                <div className="font-mono text-[11px] md:text-sm space-y-4 opacity-90 relative z-10">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-6">
                    <span className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px]">Tutor Console v6.5</span>
                    <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest tracking-widest">Día {player.day}</span>
                  </div>
                  {logs.map((log, i) => (
                    <div key={i} className={`${i === 0 ? 'text-white font-black text-base' : 'text-slate-600'} flex gap-4 transition-all duration-300`}>
                      <span className="text-blue-900 font-black">❯</span>
                      <p className="leading-relaxed">{log}</p>
                    </div>
                  ))}
                </div>
                {player.energy < 3 && (
                  <button id="coffee" onClick={startNewDay} className="mt-8 w-full p-8 bg-blue-600 hover:bg-blue-500 text-white rounded-[2.5rem] font-black flex items-center justify-center gap-5 shadow-2xl shadow-blue-900/40 uppercase tracking-[0.4em] text-xs">
                    <Coffee size={24} /> Cerrar Ciclo Diario
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <NavBtn id="sales" icon={<Send />} label="Sales" onClick={generateNewLead} disabled={player.energy < 3} color="blue" />
                <NavBtn id="analyzer" icon={<Wand2 />} label="Analizar" onClick={() => setView('analyzer')} color="gold" />
                <NavBtn icon={<Settings />} label="Skills" onClick={() => setView('skills')} color="purple" />
                <NavBtn id="holding" icon={<Briefcase />} label="Holding" onClick={() => setView('workstation')} badge={player.clients.length} color="green" />
                <NavBtn icon={<UserPlus />} label="Team" onClick={() => setView('staff')} color="yellow" />
              </div>
            </div>

            <div className="md:col-span-4 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 space-y-8 shadow-xl relative">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Operador Activo</h3>
                <div className="p-8 bg-black rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-6 shadow-inner text-center">
                  <span className="text-7xl drop-shadow-2xl">{player.niche?.icon || '?' }</span>
                  <div>
                    <p className="font-black text-white text-3xl uppercase italic tracking-tighter mb-1">{player.niche?.name || 'Inexperto'}</p>
                    <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest tracking-widest">Nivel {Math.floor(player.xp / 100) + 1} Growth Op.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-[9px] text-slate-500 font-black uppercase text-center tracking-[0.2em] px-4 italic leading-relaxed">Mantendrás tu Capital y XP, pero cambiarás el nicho de estudio.</p>
                  <button onClick={() => setView('onboarding')} className="w-full p-5 bg-slate-800 hover:bg-red-900/20 rounded-2xl text-slate-500 hover:text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-slate-700 hover:border-red-500/50">
                    <RefreshCw size={14} /> PIVOTAR CARRERA
                  </button>
                </div>

                {player.money >= 100000 && <button onClick={() => setView('retire')} className="w-full p-6 bg-amber-500 text-black rounded-3xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3"><Trophy size={18} /> RETIRO DISPONIBLE</button>}
                {player.money >= 10000 && !player.saasActive && <button onClick={() => setView('empire')} className="w-full p-5 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 animate-pulse"><Rocket size={14} /> LANZAR EMPIRE (SaaS)</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'analyzer' && (
        <AnalyzerView onBack={() => setView(player.niche ? 'dashboard' : 'onboarding')} onPractice={practiceAnalyzedLead} onTrainObjections={trainObjections} />
      )}

      {view === 'objections' && objectionSession && (
        <ObjectionSimulator
          key={`${objectionSession.lead.id}-${objectionSession.context}`}
          lead={objectionSession.lead}
          initialObjection={objectionSession.objection}
          context={objectionSession.context}
          onFinish={finishObjectionSim}
          onExit={exitObjectionSim}
        />
      )}

      {view === 'terminal' && (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-700">
          <div className="flex justify-between items-center">
            <button onClick={leaveTerminal} className="text-slate-600 hover:text-white font-black text-[10px] uppercase tracking-[0.4em] flex items-center gap-3">
              <ChevronRight className="rotate-180" size={20}/> {currentLead?.fromAnalysis ? 'Volver al análisis' : 'Abortar'}
            </button>
            <div className="px-6 py-2 bg-blue-600/10 rounded-full border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.5em] shadow-lg">Sales Simulation</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="flex items-center gap-8 border-b border-slate-800 pb-8">
              <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center text-6xl shadow-2xl border border-blue-500/10">{currentLead?.icon}</div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{currentLead?.nicheName}</h2>
                <div className="flex gap-4">
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">Rev: {currentLead?.intel.revenue}</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">Stack: {currentLead?.intel.tech}</span>
                </div>
              </div>
            </div>

            <div className="bg-black/80 p-10 rounded-[3rem] border border-white/5 shadow-inner">
              <div className="text-blue-500/40 uppercase font-black text-[9px] tracking-[0.5em] mb-4 flex items-center gap-2"><Target size={12}/> Dolor Crítico Detectado:</div>
              <p className="text-slate-300 italic text-2xl leading-relaxed font-medium">"{currentLead?.activePain}"</p>
            </div>

            {!aiFeedback ? (
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] ml-2">Selecciona Framework</label>
                    {/* BOTÓN RESTAURADO: Ayuda de Frameworks */}
                    <button onClick={() => setShowFrameworkHelp(true)} className="text-slate-500 hover:text-blue-500 transition-colors">
                      <HelpCircle size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {FRAMEWORKS.map(f => (
                      <button key={f.id} onClick={() => setSelectedFramework(f.id)} title={f.desc} className={`p-4 rounded-3xl border transition-all text-left ${selectedFramework === f.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black/40 border-slate-800 text-slate-500 hover:border-blue-500'}`}>
                        <p className="font-black text-xs">{f.name}{currentLead?.brief?.framework_recomendado === f.id && ' ★'}</p>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-500 ml-2">{FRAMEWORKS.find(f => f.id === selectedFramework)?.desc}{currentLead?.brief?.framework_recomendado && ' · ★ = recomendado por el analizador'}</p>
                </div>
                <textarea className="w-full bg-black border border-slate-800 rounded-[3rem] p-10 text-lg h-60 focus:border-blue-500 outline-none transition-all placeholder:text-slate-900 resize-none shadow-2xl text-white font-medium" placeholder={FRAMEWORK_PLACEHOLDERS[selectedFramework] || 'Escribe tu propuesta...'} value={outreachMsg} onChange={e => setOutreachMsg(e.target.value)} />
                {currentLead?.brief?.objeciones?.length > 0 && (
                  <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 text-sm text-amber-200/80 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400 mb-2">Objeciones que probablemente escucharás</p>
                    {currentLead.brief.objeciones.map((o, i) => <p key={i}>“{o}”</p>)}
                  </div>
                )}
                <button disabled={isTyping || !outreachMsg.trim() || player.energy < 3} onClick={handleOutreach} className="w-full bg-blue-600 hover:bg-blue-500 p-8 rounded-[2.5rem] font-black text-white transition-all flex items-center justify-center gap-5 text-sm tracking-[0.5em] shadow-[0_20px_50px_rgba(59,130,246,0.3)]">
                  {isTyping ? <RefreshCw className="animate-spin" size={28}/> : player.energy < 3 ? 'SIN ENERGÍA: CIERRA EL CICLO' : <><Send size={28}/> LANZAR PROPUESTA (-3⚡)</>}
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in zoom-in-95 duration-500">
                <div className={`p-12 rounded-[4rem] border ${aiFeedback.success ? 'bg-green-500/5 border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]' : 'bg-red-500/5 border-red-500/20'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-white text-3xl uppercase italic tracking-tighter leading-none">Análisis Mentor Logos</h3>
                    <div className="bg-white text-black px-8 py-3 rounded-full font-black text-4xl shadow-xl">{aiFeedback.finalScore ?? aiFeedback.score}%</div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-slate-500">
                    {aiFeedback.reaction} · {aiFeedback.success ? <span className="text-green-400">Cliente cerrado</span> : <span className="text-red-400">Necesitas {SUCCESS_THRESHOLD}% para cerrar</span>}
                    {aiFeedback.copyBonus > 0 && ` · base ${aiFeedback.score}% + ${aiFeedback.copyBonus} Copywriting Pro`}
                    {aiFeedback.origin === 'demo' && ' · evaluación local'}
                  </p>
                  <div className="bg-black/80 p-10 rounded-[3rem] mb-10 border border-white/5 italic text-slate-300 text-xl leading-relaxed shadow-2xl">"{aiFeedback.client_reply}"</div>
                  <div className="text-sm text-slate-500 font-medium leading-relaxed mb-10 border-l-4 border-blue-500 pl-10"><span className="text-blue-400 font-black uppercase tracking-[0.4em] block mb-4 text-[10px]">Feedback:</span> {aiFeedback.feedback}</div>
                  <FeedbackDetails feedback={aiFeedback} />
                  {!optimizedProposal ? <button onClick={fetchOptimizedProposal} disabled={isOptimizing} className="w-full py-6 bg-slate-800 border border-slate-700 rounded-3xl text-white font-black text-[10px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-slate-700 transition-all shadow-xl">{isOptimizing ? <RefreshCw className="animate-spin" size={20}/> : <><Sparkles size={20} className="text-yellow-400" /> Ver Propuesta de Titán</>}</button> : <div className="mt-6 p-10 bg-amber-500/5 border border-amber-500/20 rounded-[3rem] text-amber-100 text-base italic whitespace-pre-wrap shadow-2xl leading-relaxed animate-in slide-in-from-top-4"><p className="text-[10px] text-amber-500 font-black uppercase mb-6 tracking-[0.5em]">Optimización de Magnate:</p>{optimizedProposal}</div>}
                </div>
                {aiFeedback.reaction !== 'GHOSTED' && (
                  <button onClick={startObjectionSim} disabled={player.energy < OBJECTION_COST} className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-30 text-black p-6 rounded-[2.5rem] font-black uppercase tracking-[0.4em] transition-all text-xs flex items-center justify-center gap-3">
                    <Swords size={18} /> {aiFeedback.success ? 'Practicar su objeción' : 'Rescatar el trato: responder su objeción'} (-{OBJECTION_COST}⚡)
                  </button>
                )}
                {aiFeedback.reaction === 'GHOSTED' && <p className="text-center text-xs text-slate-500">El CEO te dejó en visto: no hay objeción que responder.</p>}
                <button onClick={leaveTerminal} className="w-full bg-white text-black p-8 rounded-[2.5rem] font-black uppercase tracking-[0.6em] hover:bg-slate-200 transition-all text-xs text-center">Avanzar</button>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'workstation' && (
        <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom duration-700">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-3 text-slate-500 hover:text-white mb-16 font-black uppercase text-[10px] tracking-[0.5em] transition-all"><ChevronRight className="rotate-180" size={20}/> Volver al Control</button>
          <div className="flex justify-between items-end mb-16 border-b border-slate-800 pb-12">
            <h2 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-none">Portfolio del Holding</h2>
            <p className="text-6xl font-black text-green-500 italic tracking-tighter">${Math.floor(player.money + (player.clients.length * 2000))}</p>
          </div>
          <div className="grid gap-10">
            {player.clients.map(c => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 flex flex-col lg:flex-row justify-between items-center gap-12 group hover:bg-slate-800/60 transition-all shadow-3xl relative overflow-hidden">
                <div className="flex items-center gap-12 w-full">
                  <span className="text-8xl drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] transform group-hover:scale-110 transition-transform duration-700">{c.icon}</span>
                  <div className="flex-grow space-y-6">
                    <div className="flex items-center gap-6">
                      <p className="font-black text-white text-5xl uppercase italic tracking-tighter leading-none">{c.nicheName || "Cliente"}</p>
                      {c.equity > 0 && <span className="bg-blue-600 text-white text-xs px-6 py-2 rounded-full font-black uppercase tracking-[0.3em] shadow-lg shadow-blue-900/40">{c.equity}% SOCIO</span>}
                    </div>
                    <div className="w-full max-w-lg bg-slate-800 h-4 rounded-full overflow-hidden shadow-inner border border-white/5">
                      <div className={`h-full transition-all duration-1000 ${c.satisfaction > 75 ? 'bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)]' : 'bg-red-500'}`} style={{ width: `${c.satisfaction}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Satis: {Math.round(c.satisfaction)}% // Cashflow: ${Math.floor(c.monthly + (c.equity > 0 ? c.equity * 100 * (c.satisfaction/100) : 0))}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 w-full lg:w-auto">
                  <button onClick={() => setPlayer(prev => ({...prev, energy: prev.energy - 2, clients: prev.clients.map(cl => cl.id === c.id ? {...cl, satisfaction: Math.min(100, cl.satisfaction + 20)} : cl)}))} disabled={player.energy < 2} className="px-12 py-6 bg-white text-black rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all hover:bg-slate-200 active:scale-95 disabled:opacity-20 group">
                    <Zap size={20} className="group-hover:text-blue-500 transition-colors" /> Operar (-2⚡)
                  </button>
                  {c.equity === 0 && <button onClick={() => convertToEquity(c.id)} className="px-12 py-6 bg-blue-900/40 border border-blue-500/40 text-blue-400 rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all shadow-lg">Cerrar Equity</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'skills' && (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom duration-700">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-3 text-slate-500 hover:text-white mb-16 font-black uppercase text-[10px] tracking-[0.5em] transition-all"><ChevronRight className="rotate-180" size={20}/> Salir</button>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {player.skills.map(s => (
              <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 space-y-10 group hover:border-blue-500 transition-all shadow-2xl relative overflow-hidden text-white">
                <div className="flex justify-between items-center">
                  <div className="p-5 bg-blue-600/10 rounded-[1.8rem] text-blue-500 group-hover:scale-110 transition-all duration-500"><Brain size={36}/></div>
                  <span className="text-[10px] bg-slate-800 px-5 py-2 rounded-full text-slate-400 font-black tracking-widest">NVL {s.level}</span>
                </div>
                <h4 className="font-black text-3xl uppercase italic tracking-tighter mb-3 leading-none">{s.name}</h4>
                <p className="text-xs text-slate-500 h-16 uppercase tracking-tighter leading-relaxed">{s.description}</p>
                <div className="flex gap-2.5 h-3">
                  {[...Array(s.max)].map((_, i) => <div key={i} className={`flex-1 rounded-full ${i < s.level ? 'bg-blue-500 shadow-[0_0_25px_blue]' : 'bg-slate-800'}`} />)}
                </div>
                <button disabled={player.money < s.cost || s.level >= s.max} onClick={() => upgradeSkill(s.id)} className="w-full p-6 bg-slate-800 hover:bg-blue-600 disabled:opacity-20 rounded-[2rem] text-white font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-xl">{s.level >= s.max ? 'MASTERED' : `INVERTIR $${s.cost}`}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'staff' && (
        <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom duration-700 text-white">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-3 text-slate-500 hover:text-white mb-16 font-black uppercase text-[10px] tracking-[0.5em] transition-all"><ChevronRight className="rotate-180" size={20}/> Volver</button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STAFF_ROLES.map(role => {
              const count = player.staff.filter(id => id === role.id).length;
              return (
                <div key={role.id} className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 space-y-8 hover:border-amber-500/50 transition-all group shadow-3xl relative overflow-hidden text-center lg:text-left">
                  <div className="flex justify-between items-center"><div className="p-5 bg-amber-500/10 rounded-[1.8rem] text-amber-500">{role.icon}</div><span className="text-[10px] bg-black px-6 py-2 rounded-full font-black uppercase border border-white/5 text-amber-500">Unidades: {count}</span></div>
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{role.name}</h3>
                  <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">{role.desc}</p>
                  <button onClick={() => hireStaff(role.id)} disabled={player.money < role.cost} className="w-full p-7 bg-amber-600 hover:bg-amber-500 disabled:opacity-20 rounded-[2.5rem] text-black font-black uppercase text-[10px] tracking-[0.4em] transition-all shadow-2xl">CONTRATAR (${role.cost})</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'empire' && (
        <div className="max-w-6xl mx-auto animate-in slide-in-from-bottom duration-700 text-white">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-3 text-slate-500 hover:text-white mb-16 font-black uppercase text-[10px] tracking-[0.5em] transition-all"><ChevronRight className="rotate-180" size={20}/> Volver</button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 space-y-10 shadow-3xl group">
              <div className="flex items-center gap-6"><div className="p-6 bg-blue-600/10 rounded-[2.2rem] text-blue-500 border border-blue-500/20"><Rocket size={40}/></div><h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">SaaS Division</h2></div>
              {!player.saasActive ? <button onClick={launchSaaS} disabled={player.money < 10000} className="w-full p-8 bg-blue-600 hover:bg-blue-500 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs transition-all shadow-2xl disabled:opacity-20">LANZAR SOFTWARE ($10,000)</button> : <div className="grid grid-cols-2 gap-6"><div className="p-8 bg-black/60 rounded-[2.5rem] border border-white/5 shadow-inner"><p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest leading-none">Users Activos</p><p className="text-4xl font-black text-blue-400 italic">{player.saasUsers}</p></div><div className="p-8 bg-black/60 rounded-[2.5rem] border border-white/5 shadow-inner"><p className="text-[10px] text-slate-500 font-black uppercase mb-2 tracking-widest leading-none">Daily Net</p><p className="text-4xl font-black text-green-500 italic">${player.saasUsers * (12 + (player.skills.find(s => s.id === 'saas_logic')?.level || 0))}</p></div></div>}
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-[4rem] p-12 space-y-10 shadow-3xl group">
              <div className="flex items-center gap-6"><div className="p-6 bg-purple-600/10 rounded-[2.2rem] text-purple-500 border border-purple-500/20"><Building2 size={40}/></div><h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">M&A Acquisition</h2></div>
              <button onClick={acquireAgency} disabled={player.money < 25000} className="w-full p-8 bg-purple-600 hover:bg-purple-500 rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-xs transition-all shadow-2xl disabled:opacity-20">ADQUIRIR COMPETENCIA ($25k)</button>
              <div className="text-center font-black text-[10px] text-slate-500 uppercase tracking-widest">Agencias Controladas: {player.acquisitions}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
