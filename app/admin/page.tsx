"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/motorFirebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, Database, Bot, Lock, Unlock, Terminal, LogOut, Zap, Loader2, Trash2, Edit, UserX, UserCheck, RefreshCw, FileBadge, Clock, Copy, Check, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 🔥 MÓDULOS DEL SISTEMA 🔥
const MODULOS = [
  { id: 'basico', nombre: 'Reglas Básicas', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', collection: 'basico_niveles' },
  { id: 'aperturas', nombre: 'Arsenal de Aperturas', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30', collection: 'aperturas_niveles' },
  { id: 'tactica', nombre: 'Táctica Quirúrgica', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', collection: 'niveles' },
  { id: 'estrategia', nombre: 'Estructura Posicional', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', collection: 'estrategia_tomos' },
  { id: 'ciego', nombre: 'Entrenamiento Ciego', color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', collection: 'ciego_niveles' },
  { id: 'matematico', nombre: 'Pensamiento Matemático', color: 'text-amber-700', bg: 'bg-amber-700/10', border: 'border-amber-700/30', collection: 'matematico_niveles' },
  { id: 'epicas', nombre: 'Partidas Épicas', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', collection: 'partidas_epicas' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);
  
  const [moduloIdx, setModuloIdx] = useState(0);
  const [statusForja, setStatusForja] = useState("");
  const [cargandoForja, setCargandoForja] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generandoIA, setGenerandoIA] = useState(false);
  
  const [tabActiva, setTabActiva] = useState<'ai' | 'database' | 'usuarios' | 'solicitudes'>('ai');
  
  const [formData, setFormData] = useState({
    id: "", titulo: "", orden: 1, xp: 500, fen: "", jugada_correcta: "", instruccion: "", pregunta: "", 
    opcionA: "", opcionB: "", opcionC: "", correcta: "A", feedback: "",
    tipo: "", agresividad: "", historia: "", pgn: ""
  });

  const [dbItems, setDbItems] = useState<any[]>([]);
  const [dbColeccionActiva, setDbColeccionActiva] = useState(MODULOS[0].collection);
  const [cargandoDb, setCargandoDb] = useState(false);
  
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargandoUsers, setCargandoUsers] = useState(false);

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [idCopiado, setIdCopiado] = useState<string | null>(null);

  // 🛡️ PROTOCOLO DE SEGURIDAD MÁXIMA 🛡️
  useEffect(() => {
    const verificarAdmin = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        
        // 1. Si no hay ID en el navegador, pa' fuera.
        if (!userId) {
          console.warn("Intento de acceso sin ID.");
          router.push('/');
          return;
        }

        // 2. Buscamos el usuario exacto en la base de datos
        const docSnap = await getDoc(doc(db, "usuarios", userId));
        
        // 3. Verificamos si existe y si su rol es "admin"
        if (docSnap.exists() && docSnap.data().rol === 'admin') {
          setEsAdmin(true);
        } else {
          // 4. Si es un usuario normal (recluta/profesor), pa' fuera.
          console.warn(`Usuario ${userId} intentó infiltrarse en el Admin.`);
          router.push('/hub');
        }
      } catch (error) { 
        console.error("Fallo de conexión al verificar rango:", error);
        router.push('/hub');
      } finally { 
        setCargando(false); 
      }
    };
    verificarAdmin();
  }, [router]);

  // ELIMINADA LA FUNCIÓN "activarModoDios" POR SEGURIDAD

  const generarConIA = async () => {
    if (!aiPrompt) return;
    setGenerandoIA(true);
    setStatusForja("");
    try {
      const res = await fetch('/api/generar-nivel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, modulo: MODULOS[moduloIdx].nombre })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setFormData({
        ...formData,
        titulo: data.titulo || "", instruccion: data.instruccion || "", fen: data.fen || "",
        jugada_correcta: data.jugada_correcta || "", pregunta: data.pregunta || "",
        opcionA: data.opcionA || "", opcionB: data.opcionB || "", opcionC: data.opcionC || "",
        correcta: data.correcta || "A", feedback: data.feedback || "",
        tipo: data.tipo || "", agresividad: data.agresividad || "",
        historia: data.historia || "", pgn: data.pgn || ""
      });
      setStatusForja("🧠 ¡Datos forjados por IA! Revisa los parámetros.");
    } catch (error: any) {
      console.error(error);
      setStatusForja("❌ Error de IA: " + error.message);
    } finally {
      setGenerandoIA(false);
    }
  };

  const cargarBaseDatos = async (coleccion: string) => {
    setCargandoDb(true);
    setDbColeccionActiva(coleccion);
    try {
      const snap = await getDocs(collection(db, coleccion));
      const items = snap.docs.map(d => ({ dbId: d.id, ...d.data() }));
      items.sort((a: any, b: any) => a.orden - b.orden);
      setDbItems(items);
    } catch (error) { console.error(error); } finally { setCargandoDb(false); }
  };

  const eliminarDocumento = async (id: string) => {
    if (!confirm("¿Destruir archivo permanentemente?")) return;
    await deleteDoc(doc(db, dbColeccionActiva, id));
    cargarBaseDatos(dbColeccionActiva);
  };

  const cargarParaEditar = (item: any) => {
    const opciones = item.pregunta?.opciones || [];
    setFormData({
      id: item.dbId, titulo: item.titulo || item.concepto || "", orden: item.orden || 1, xp: item.xp || 500, fen: item.fen || "",
      jugada_correcta: item.jugada_correcta || item.destinoCorrecto || "",
      instruccion: item.informe ? item.informe[0] : (item.teoria || ""), pregunta: item.pregunta?.texto || item.mision || "",
      opcionA: opciones[0]?.texto || "", opcionB: opciones[1]?.texto || "", opcionC: opciones[2]?.texto || "",
      correcta: opciones.find((o:any) => o.correcta)?.id || "A", feedback: opciones[0]?.feedback || "",
      tipo: item.tipo || "", agresividad: item.agresividad || "",
      historia: item.historia || "", pgn: item.pgn || ""
    });
    const modIndex = MODULOS.findIndex(m => m.collection === dbColeccionActiva);
    if (modIndex !== -1) setModuloIdx(modIndex);
    setTabActiva('ai');
  };

  const cargarUsuarios = async () => {
    setCargandoUsers(true);
    try {
      const snap = await getDocs(collection(db, "usuarios"));
      setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) { console.error(error); } finally { setCargandoUsers(false); }
  };

  const toggleBanUsuario = async (userId: string, isBanned: boolean) => {
    await setDoc(doc(db, "usuarios", userId), { baneado: !isBanned }, { merge: true });
    cargarUsuarios();
  };

  useEffect(() => {
    if (tabActiva === 'database') cargarBaseDatos(dbColeccionActiva);
    if (tabActiva === 'usuarios') cargarUsuarios();
  }, [tabActiva]);

  useEffect(() => {
    if (tabActiva === 'solicitudes') {
      const q = query(collection(db, 'solicitudes_profesor'), orderBy('fecha', 'desc'));
      const unsubscribe = onSnapshot(q, (snap) => {
        setSolicitudes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [tabActiva]);

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setIdCopiado(codigo);
    setTimeout(() => setIdCopiado(null), 2000);
  };

  const handleInyectar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargandoForja(true);
    setStatusForja("Sincronizando con el Núcleo...");
    const modulo = MODULOS[moduloIdx];

    try {
      const dataToSave: any = {
        id: formData.id || `${modulo.id}_${formData.orden}`,
        titulo: formData.titulo, orden: Number(formData.orden), xp: Number(formData.xp), 
        fen: formData.fen,
      };

      if (modulo.id === 'epicas') {
        dataToSave.historia = formData.historia;
        dataToSave.pgn = formData.pgn;
        dataToSave.tipo = "Partida Histórica";
        dataToSave.comentarios = {}; 
      } else if (modulo.id === 'basico' || modulo.id === 'aperturas') {
        dataToSave.teoria = formData.instruccion;
        dataToSave.mision = formData.pregunta;
        dataToSave.destinoCorrecto = formData.jugada_correcta;
        if (modulo.id === 'aperturas') {
          dataToSave.tipo = formData.tipo || "Variante Táctica";
          dataToSave.agresividad = formData.agresividad || "Desconocida";
        }
      } else {
        dataToSave.jugada_correcta = formData.jugada_correcta;
        dataToSave.concepto = formData.titulo;
        dataToSave.informe = [formData.instruccion];
        dataToSave.pregunta = {
          texto: formData.pregunta,
          opciones: [
            { id: "A", texto: formData.opcionA, correcta: formData.correcta === "A", feedback: formData.feedback },
            { id: "B", texto: formData.opcionB, correcta: formData.correcta === "B", feedback: formData.feedback },
            { id: "C", texto: formData.opcionC, correcta: formData.correcta === "C", feedback: formData.feedback },
          ].filter(o => o.texto !== "")
        };
      }

      await setDoc(doc(db, modulo.collection, dataToSave.id), dataToSave);
      setStatusForja("🎯 ¡Inyección Exitosa!");
      setTimeout(() => setStatusForja(""), 3000);
    } catch (error: any) { setStatusForja("❌ ERROR: " + error.message); } finally { setCargandoForja(false); }
  };

  // Pantalla de carga mientras lee la base de datos
  if (cargando) return <div className="min-h-screen bg-black flex items-center justify-center"><Terminal className="text-emerald-500 animate-pulse" size={60} /></div>;

  // 🛡️ SI NO ES ADMIN, LO BOTAMOS AL HUB INMEDIATAMENTE. (Aunque el useEffect ya lo hace, esto previene parpadeos) 🛡️
  if (!esAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] text-emerald-500 font-mono flex flex-col items-center justify-center p-10">
        <ShieldAlert size={80} className="text-red-600 mb-6 animate-pulse" />
        <h1 className="text-4xl font-black text-white uppercase mb-2">Acceso Restringido</h1>
        <p className="text-slate-500 mt-2">Redirigiendo a zona segura...</p>
      </div>
    );
  }

  const modulo = MODULOS[moduloIdx];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 font-sans flex overflow-hidden">
      <div className="w-72 bg-black border-r border-white/5 p-6 flex flex-col z-20">
        <div className="flex items-center gap-3 mb-12 border-b border-white/5 pb-6">
          <ShieldAlert className="text-red-500" size={30} />
          <div>
            <h1 className="font-black text-white tracking-widest text-lg leading-none">NEXUS</h1>
            <p className="text-[10px] text-red-500 font-mono uppercase tracking-widest">Admin Control</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button onClick={() => setTabActiva('ai')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold tracking-wide transition-all ${tabActiva === 'ai' ? 'bg-indigo-900/40 text-indigo-400 border border-indigo-500/30' : 'text-slate-500 hover:bg-white/5'}`}><Bot size={20} /> Forja Neural</button>
          <button onClick={() => setTabActiva('database')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold tracking-wide transition-all ${tabActiva === 'database' ? 'bg-amber-900/40 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:bg-white/5'}`}><Database size={20} /> Archivo (Editor)</button>
          <button onClick={() => setTabActiva('usuarios')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold tracking-wide transition-all ${tabActiva === 'usuarios' ? 'bg-rose-900/40 text-rose-400 border border-rose-500/30' : 'text-slate-500 hover:bg-white/5'}`}><Users size={20} /> Radar de Reclutas</button>
          <button onClick={() => setTabActiva('solicitudes')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-bold tracking-wide transition-all mt-4 border-t border-white/5 pt-6 ${tabActiva === 'solicitudes' ? 'bg-teal-900/40 text-teal-400 border border-teal-500/30' : 'text-slate-500 hover:bg-white/5'}`}><FileBadge size={20} /> Credenciales Docentes</button>
        </nav>

        <button onClick={() => router.push('/')} className="mt-auto flex items-center gap-3 text-slate-600 hover:text-red-400 text-sm font-bold uppercase tracking-widest transition-colors"><LogOut size={18} /> Salir del Nexus</button>
      </div>

      <div className="flex-1 p-10 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-900/10 blur-[150px] rounded-full pointer-events-none"></div>

        <AnimatePresence mode="wait">
          
          {tabActiva === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-5xl mx-auto space-y-6 relative z-10">
              <h2 className="text-3xl font-black text-white">Forja Neural</h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {MODULOS.map((m, idx) => (
                  <button key={m.id} onClick={() => setModuloIdx(idx)} className={`p-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${moduloIdx === idx ? `${m.bg} ${m.border} ${m.color}` : 'bg-white/5 border-white/5 text-slate-500'}`}>
                    <span className="text-xs font-bold uppercase text-center">{m.nombre}</span>
                  </button>
                ))}
              </div>

              <div className="bg-[#050505] border border-indigo-500/20 rounded-2xl p-6 shadow-2xl mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Bot className="text-indigo-400" size={24} />
                  <h3 className="text-indigo-400 font-bold uppercase tracking-widest text-sm">Terminal IA (Auto-Generador)</h3>
                </div>
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl p-4 text-white h-24 focus:outline-none focus:border-indigo-500/50 resize-none font-mono text-sm mb-4"
                  placeholder={modulo.id === 'epicas' ? `Ejemplo: Genera los datos y PGN de "La Inmortal" de Adolf Anderssen.` : `Ejemplo: Crea un puzzle de táctica de "Ataque a la Descubierta".`}
                ></textarea>
                <div className="flex justify-end">
                  <button onClick={generarConIA} disabled={generandoIA || !aiPrompt} className={`px-8 py-3 font-bold rounded-lg transition-colors flex items-center gap-2 ${generandoIA || !aiPrompt ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                    {generandoIA ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                    {generandoIA ? 'Forjando Sinapsis...' : 'Auto-Completar con IA'}
                  </button>
                </div>
              </div>

              <div className={`bg-black/40 border ${modulo.border} rounded-2xl shadow-2xl p-6`}>
                <form onSubmit={handleInyectar} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-[10px] uppercase text-slate-500 font-bold">ID Único</label>
                        <input type="text" value={formData.id} className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none" onChange={(e) => setFormData({...formData, id: e.target.value})} />
                      </div>
                      <div className="w-20">
                        <label className="text-[10px] uppercase text-slate-500 font-bold">Orden</label>
                        <input type="number" value={formData.orden} className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none" onChange={(e) => setFormData({...formData, orden: Number(e.target.value)})} />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase text-slate-500 font-bold">Título / Nombre de la Partida</label>
                      <input type="text" value={formData.titulo} placeholder={modulo.id === 'epicas' ? "Ej: Kasparov vs Topalov, 1999" : ""} className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none" onChange={(e) => setFormData({...formData, titulo: e.target.value})} />
                    </div>

                    {modulo.id === 'epicas' ? (
                      <>
                        <div>
                          <label className="text-[10px] uppercase text-yellow-500 font-bold">Historia / Contexto Épico</label>
                          <textarea value={formData.historia} onChange={e=>setFormData({...formData, historia: e.target.value})} className="w-full bg-yellow-950/20 border border-yellow-900/50 p-3 rounded-lg text-white outline-none text-sm h-32 resize-none" placeholder="Ej: Considerada la partida más brillante del siglo XX, Kasparov sacrifica una torre..."></textarea>
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-yellow-500 font-bold">FEN Inicial (Opcional - por defecto startpos)</label>
                          <input type="text" value={formData.fen} placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" className="w-full bg-black border border-white/10 p-3 rounded-lg text-yellow-400 font-mono text-sm outline-none" onChange={(e) => setFormData({...formData, fen: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-yellow-500 font-bold">PGN (Jugadas Exactas)</label>
                          <textarea value={formData.pgn} onChange={e=>setFormData({...formData, pgn: e.target.value})} className="w-full bg-black border border-yellow-900/50 p-3 rounded-lg text-yellow-400 font-mono text-sm outline-none resize-none h-32" placeholder="Ej: 1. e4 e5 2. Nf3 Nc6 3. Bb5..."></textarea>
                        </div>
                      </>
                    ) : (
                      <>
                        {modulo.id === 'aperturas' && (
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-[10px] uppercase text-rose-500 font-bold">Clasificación</label>
                              <input type="text" value={formData.tipo} placeholder="Ej: Defensa Asimétrica" className="w-full bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg text-white outline-none text-sm" onChange={(e) => setFormData({...formData, tipo: e.target.value})} />
                            </div>
                            <div className="flex-1">
                              <label className="text-[10px] uppercase text-rose-500 font-bold">Letalidad (Agresividad)</label>
                              <input type="text" value={formData.agresividad} placeholder="Ej: Letal / Extrema" className="w-full bg-rose-950/20 border border-rose-900/50 p-3 rounded-lg text-white outline-none text-sm" onChange={(e) => setFormData({...formData, agresividad: e.target.value})} />
                            </div>
                          </div>
                        )}
                        <div>
                          <label className="text-[10px] uppercase text-slate-500 font-bold">Teoría / Instrucción</label>
                          <textarea value={formData.instruccion} className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white h-24 outline-none resize-none" onChange={(e) => setFormData({...formData, instruccion: e.target.value})}></textarea>
                        </div>
                        
                        {(modulo.id === 'tactica' || modulo.id === 'estrategia' || modulo.id === 'basico' || modulo.id === 'aperturas') && (
                          <div className="flex gap-4">
                            <div className="flex-1">
                               <label className="text-[10px] uppercase text-slate-500 font-bold">FEN (Tablero)</label>
                               <input type="text" value={formData.fen} className="w-full bg-black border border-white/10 p-3 rounded-lg text-indigo-400 font-mono text-sm outline-none" onChange={(e) => setFormData({...formData, fen: e.target.value})} />
                            </div>
                            <div className="w-32">
                               <label className="text-[10px] uppercase text-slate-500 font-bold">
                                 {modulo.id === 'basico' || modulo.id === 'aperturas' ? 'Destino (ej: c8)' : 'Jugada (ej: d5f6)'}
                               </label>
                               <input type="text" value={formData.jugada_correcta} className="w-full bg-emerald-900/20 border border-emerald-500/30 p-3 rounded-lg text-emerald-400 font-mono text-sm outline-none" onChange={(e) => setFormData({...formData, jugada_correcta: e.target.value})} />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-4 bg-white/[0.02] p-6 rounded-xl border border-white/5 flex flex-col">
                    {modulo.id !== 'epicas' ? (
                      <>
                        <div>
                          <label className="text-[10px] uppercase text-slate-500 font-bold">
                            {modulo.id === 'basico' || modulo.id === 'aperturas' ? 'Misión (Objetivo Práctico)' : 'Pregunta Táctica'}
                          </label>
                          <input type="text" value={formData.pregunta} className="w-full bg-black border border-white/10 p-3 rounded-lg text-white outline-none" onChange={(e) => setFormData({...formData, pregunta: e.target.value})} />
                        </div>
                        
                        {(modulo.id !== 'basico' && modulo.id !== 'aperturas') && ['A', 'B', 'C'].map((l) => (
                          <div key={l} className="flex gap-2">
                            <input type="text" value={(formData as any)[`opcion${l}`]} placeholder={`Opción ${l}`} className="flex-1 bg-white/5 border border-white/10 p-3 rounded-lg text-white text-sm outline-none" onChange={(e) => setFormData({...formData, [`opcion${l}`]: e.target.value})} />
                            <button type="button" onClick={() => setFormData({...formData, correcta: l})} className={`w-12 rounded-lg font-bold ${formData.correcta === l ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500'}`}>{l}</button>
                          </div>
                        ))}
                        
                        {(modulo.id !== 'basico' && modulo.id !== 'aperturas') && (
                          <div>
                            <label className="text-[10px] uppercase text-slate-500 font-bold">Feedback de Error</label>
                            <input type="text" value={formData.feedback} className="w-full bg-black border border-white/10 p-3 rounded-lg text-rose-400 text-sm outline-none" onChange={(e) => setFormData({...formData, feedback: e.target.value})} />
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                          <Crown size={60} className="text-yellow-500 mb-4"/>
                          <h4 className="text-xl font-black text-yellow-500 uppercase tracking-widest">Módulo Histórico</h4>
                          <p className="text-sm font-mono text-slate-400 mt-2">No requiere opciones ABCD. La IA generará los comentarios tácticos en base al PGN proporcionado.</p>
                      </div>
                    )}

                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 mt-auto">
                      {cargandoForja ? <Loader2 className="animate-spin" /> : <Database size={18} />} {statusForja || "Inyectar en Base de Datos"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {tabActiva === 'database' && (
            <motion.div key="db" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto relative z-10">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">Archivo Central</h2>
                  <p className="text-slate-500">Selecciona un módulo para inspeccionar su base de datos.</p>
                </div>
                <select className="bg-black border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg font-bold outline-none cursor-pointer" value={dbColeccionActiva} onChange={(e) => cargarBaseDatos(e.target.value)}>
                  {MODULOS.map(m => <option key={m.collection} value={m.collection}>{m.nombre}</option>)}
                </select>
              </div>
              {cargandoDb ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={40}/></div> : (
                <div className="grid grid-cols-1 gap-3">
                  {dbItems.map((item, i) => (
                    <div key={item.dbId} className="bg-white/5 border border-white/10 p-4 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center font-bold text-amber-500 text-sm">{item.orden}</div>
                        <div>
                          <h4 className="text-white font-bold">{item.titulo || item.concepto || "Sin Título"}</h4>
                          <p className="text-xs font-mono text-slate-500">ID: {item.dbId} {item.jugada_correcta && `| Move: ${item.jugada_correcta}`} {item.pgn && `| Épica`}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => cargarParaEditar(item)} className="p-2 bg-indigo-900/30 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"><Edit size={18} /></button>
                        <button onClick={() => eliminarDocumento(item.dbId)} className="p-2 bg-rose-900/30 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"><Trash2 size={18} /></button>
                      </div>
                    </div>
                  ))}
                  {dbItems.length === 0 && <p className="text-center text-slate-500 py-10">Colección vacía.</p>}
                </div>
              )}
            </motion.div>
          )}

          {tabActiva === 'usuarios' && (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto relative z-10">
               <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">Radar de Reclutas</h2>
                </div>
                <button onClick={cargarUsuarios} className="flex items-center gap-2 text-rose-400 hover:text-rose-300 font-bold uppercase text-xs tracking-widest"><RefreshCw size={16}/> Escanear</button>
              </div>
              {cargandoUsers ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-rose-500" size={40}/></div> : (
                <div className="grid grid-cols-1 gap-4">
                  {usuarios.map(u => (
                    <div key={u.id} className={`p-6 rounded-2xl border flex flex-wrap md:flex-nowrap justify-between items-center transition-all ${u.baneado ? 'bg-red-900/10 border-red-900/50 grayscale' : 'bg-[#0B1121] border-white/5 hover:border-blue-500/20'}`}>
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${u.baneado ? 'bg-red-900/20 text-red-500' : 'bg-blue-900/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'}`}>
                          {u.baneado ? <UserX size={28} /> : <UserCheck size={28} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`font-black text-xl ${u.baneado ? 'text-red-500' : 'text-white'}`}>{u.id}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.rol === 'admin' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-400'}`}>{u.rol || 'Recluta'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4 md:mt-0 justify-end">
                        <button onClick={() => toggleBanUsuario(u.id, !!u.baneado)} className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all border ${u.baneado ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-red-600/10 text-red-500 border-red-600/30 hover:bg-red-600 hover:text-white'}`}>
                          {u.baneado ? 'Desbanear' : 'Ban'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {tabActiva === 'solicitudes' && (
            <motion.div key="solicitudes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto relative z-10">
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">Credenciales Docentes</h2>
                </div>
              </div>
              <div className="space-y-4">
                {solicitudes.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-10 bg-black/30 rounded-2xl border border-white/5">No hay solicitudes en la red.</p>
                ) : (
                  solicitudes.map((solicitud) => (
                    <div key={solicitud.id} className="bg-black/40 border border-teal-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors hover:border-teal-500/50">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${solicitud.estado === 'aprobado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {solicitud.estado === 'aprobado' ? <UserCheck size={24}/> : <Clock size={24}/>}
                        </div>
                        <div>
                          <h3 className="font-black text-white text-lg uppercase">{solicitud.nombre} {solicitud.apellido}</h3>
                          <span className={`inline-block mt-2 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded ${solicitud.estado === 'aprobado' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : 'bg-amber-900/50 text-amber-400 border border-amber-500/30'}`}>
                            {solicitud.estado === 'aprobado' ? 'RANGO ACTIVO' : 'ESPERANDO ACTIVACIÓN'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 w-full md:w-auto bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3">
                          <code className="text-xl font-black text-teal-400 tracking-widest">{solicitud.codigo_requerido}</code>
                          <button onClick={() => copiarCodigo(solicitud.codigo_requerido)} className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                            {idCopiado === solicitud.codigo_requerido ? <Check size={18} className="text-emerald-500"/> : <Copy size={18}/>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}