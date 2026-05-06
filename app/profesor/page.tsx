"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/motorFirebase';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Trophy, Plus, Activity, Crosshair, X, Copy, Check, LayoutDashboard, Lock, FileBadge } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PanelProfesorPage() {
  const router = useRouter();
  
  // 🔥 ESTADOS DEL GATEKEEPER Y PERFIL 🔥
  const [esProfesor, setEsProfesor] = useState(false);
  const [verificandoAcceso, setVerificandoAcceso] = useState(true);
  const [miNombre, setMiNombre] = useState("");

  const [torneosActivos, setTorneosActivos] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  
  // Parámetros del torneo
  const [nombreTorneo, setNombreTorneo] = useState('');
  const [liga, setLiga] = useState('Bronce');
  const [cursos, setCursos] = useState('');
  const [cantidadAlumnos, setCantidadAlumnos] = useState('');
  const [idCopiado, setIdCopiado] = useState<string | null>(null);

  // 1. Verificación de Seguridad
  useEffect(() => {
    const rol = localStorage.getItem("user_role");
    const nombre = localStorage.getItem("user_name");
    
    if (rol === "profesor" && nombre) {
      setEsProfesor(true);
      setMiNombre(nombre);
    } else {
      setEsProfesor(false);
    }
    setVerificandoAcceso(false);
  }, []);

  // 2. Cargar Torneos Globales
  useEffect(() => {
    if (!esProfesor) return;
    const q = query(collection(db, 'torneos_globales'), orderBy('fecha_creacion', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const torneos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTorneosActivos(torneos);
    });
    return () => unsubscribe();
  }, [esProfesor]);

  const crearTorneo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreTorneo.trim()) return;
    try {
      await addDoc(collection(db, 'torneos_globales'), {
        nombre: nombreTorneo, 
        liga: liga,
        cursos_participantes: cursos || 'General', 
        total_alumnos: cantidadAlumnos || '2',
        estado: 'activo',
        creado_por: miNombre, // Registramos quién lo creó
        fecha_creacion: serverTimestamp()
      });
      setModalAbierto(false);
      setNombreTorneo(''); setCursos(''); setCantidadAlumnos('');
    } catch (error) {
      console.error("Error al crear el torneo:", error);
    }
  };

  const copiarId = (id: string) => {
    navigator.clipboard.writeText(id);
    setIdCopiado(id);
    setTimeout(() => setIdCopiado(null), 2000);
  };

  // 🔥 EL GATEKEEPER 🔥
  if (verificandoAcceso) return <div className="h-screen w-full bg-[#020617] flex items-center justify-center text-slate-500 font-mono text-sm animate-pulse">VERIFICANDO CREDENCIALES DE ACCESO...</div>;

  if (!esProfesor) {
    return (
      <div className="h-screen w-full bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
         <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center max-w-md">
            <div className="bg-rose-500/10 p-6 rounded-full border-4 border-rose-500/30 mb-6">
              <Lock size={60} className="text-rose-500"/>
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-rose-500">Acceso Restringido</h1>
            <div className="w-16 h-1 bg-rose-500 my-4"></div>
            <p className="text-slate-400 mb-8 text-sm leading-relaxed">
              Comandante, el <strong>NEXUS DE COMANDO</strong> está clasificado como área de Nivel 5. 
              Solo el personal con el rango activo de <span className="text-white font-bold">Profesor/Árbitro</span> está autorizado a ingresar.
            </p>
            <button onClick={() => router.push("/solicitar-rango")} className="w-full bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-emerald-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg">
              Solicitar Rango Oficial
            </button>
         </motion.div>
      </div>
    );
  }

  // 🔥 INTERFAZ PRINCIPAL DEL PROFESOR 🔥
  return (
    <div className="w-full min-h-screen p-8 flex flex-col gap-8 relative overflow-x-hidden font-sans transition-colors duration-300 bg-[#020617] text-slate-200">
      
      <div className="flex flex-col gap-8">
        {/* CABECERA */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start md:items-center flex-col md:flex-row border-b border-[#1E293B] pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <Shield className="text-emerald-500" size={32} />
              NEXUS DE COMANDO <span className="text-sm font-normal text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest ml-2">Modo Profesor</span>
            </h1>
            <p className="text-slate-400 mt-2 font-mono text-sm uppercase tracking-widest">Supervisión Global de Torneos</p>
          </div>
          <div className="flex gap-3">
            {/* 🔥 NUEVO BOTÓN QUE ABRE EL EXPEDIENTE EN PESTAÑA NUEVA 🔥 */}
            <button onClick={() => window.open('/profesor/expediente', '_blank')} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm uppercase flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)]">
              <FileBadge size={18} /> Expediente Legal
            </button>
            <button onClick={() => setModalAbierto(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-black text-sm uppercase flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Plus size={18} /> Planificar Torneo
            </button>
          </div>
        </motion.div>

        {/* METRICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0B1121] border border-[#1E293B] p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400"><Users size={28} /></div>
            <div><p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Reclutas Activos</p><p className="text-3xl font-black text-white">24</p></div>
          </div>
          <div className="bg-[#0B1121] border border-[#1E293B] p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400"><Trophy size={28} /></div>
            <div><p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Torneos Creados</p><p className="text-3xl font-black text-white">{torneosActivos.length}</p></div>
          </div>
          <div className="bg-[#0B1121] border border-[#1E293B] p-6 rounded-2xl flex items-center gap-4">
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400"><Activity size={28} /></div>
            <div><p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Operaciones Activas</p><p className="text-3xl font-black text-white">{torneosActivos.filter(t => t.estado === 'activo').length}</p></div>
          </div>
        </div>

        {/* RADAR */}
        <div className="bg-[#0B1121]/80 border border-[#1E293B] rounded-3xl p-6 flex flex-col">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
              <Crosshair className="text-rose-500" size={20} /> Radar de Torneos Globales
            </h2>
            <div className="space-y-4">
              {torneosActivos.length === 0 ? <p className="text-slate-500 italic text-center py-10">No hay torneos activos en la red.</p> : (
                  torneosActivos.map((torneo) => (
                  <div key={torneo.id} className="bg-[#020617] border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-emerald-500/50 transition-colors">
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center w-12">
                            <div className={`w-3 h-3 rounded-full animate-pulse ${torneo.estado === 'activo' ? 'bg-rose-500 shadow-[0_0_10px_red]' : 'bg-slate-500'}`}></div>
                            <span className={`text-[9px] font-bold mt-1 tracking-widest uppercase text-center ${torneo.estado === 'activo' ? 'text-rose-500' : 'text-slate-500'}`}>
                                {torneo.estado === 'activo' ? 'LIVE' : 'FIN'}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-emerald-500 font-bold uppercase tracking-widest mb-1">{torneo.nombre} <span className="text-slate-500">| Liga {torneo.liga}</span></p>
                            <div className="flex items-center gap-3 mb-3 text-xs font-bold text-slate-300">
                              <Users size={14} className="text-slate-600" /> Cursos Asignados: {torneo.cursos_participantes}
                            </div>
                            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 px-3 rounded-lg border border-slate-700 w-fit">
                              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">ID TORNEO:</span>
                              <code className="text-xs text-cyan-400 font-mono select-all">{torneo.id}</code>
                              <button onClick={() => copiarId(torneo.id)} className="ml-2 text-slate-400 hover:text-white transition-colors focus:outline-none" title="Copiar ID">
                                {idCopiado === torneo.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                              </button>
                            </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto">
                      <button onClick={() => router.push(`/lobby/${torneo.id}`)} className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors border border-slate-600 group-hover:border-emerald-500">
                          <LayoutDashboard size={16} /> Entrar al Lobby
                      </button>
                      </div>
                  </div>
                  ))
              )}
            </div>
        </div>
      </div>

      {/* MODAL PLANIFICACIÓN DE TORNEO */}
      <AnimatePresence>
        {modalAbierto && (
          <div className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-[#0B1121] border border-rose-500/30 p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.1)] relative my-8">
              <button onClick={() => setModalAbierto(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={24} /></button>
              <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2"><Trophy className="text-rose-500"/> Planificar Torneo</h2>
              <p className="text-slate-400 mb-6 text-sm">Crea el contenedor global para las 4 mesas de combate.</p>
              
              <form onSubmit={crearTorneo} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nombre del Torneo / Evento</label>
                  <input type="text" value={nombreTorneo} onChange={(e) => setNombreTorneo(e.target.value)} placeholder="Ej: Torneo Intercolegial" className="w-full mt-1 bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500" required />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cursos Participantes (separados por coma)</label>
                    <input type="text" value={cursos} onChange={(e) => setCursos(e.target.value)} placeholder="Ej: 4to DAAI, 4to EESS" className="w-full mt-1 bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500" required />
                </div>
                <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Alumnos Estimados</label>
                    <input type="number" value={cantidadAlumnos} onChange={(e) => setCantidadAlumnos(e.target.value)} placeholder="Ej: 32" className="w-full mt-1 bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500" required />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Categoría / Liga</label>
                  <select value={liga} onChange={(e) => setLiga(e.target.value)} className="w-full mt-1 bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500">
                    <option value="Hierro">Liga Hierro</option>
                    <option value="Bronce">Liga Bronce</option>
                    <option value="Plata">Liga Plata</option>
                    <option value="Oro">Liga Oro</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl font-black tracking-widest uppercase mt-4 transition-colors">
                  Generar Torneo Oficial
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}