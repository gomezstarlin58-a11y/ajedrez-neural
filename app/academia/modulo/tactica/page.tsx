"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/motorFirebase'; // 4 saltos hacia atrás
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Target, Lock, CheckCircle, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MapaNivelesPage() {
  const router = useRouter();
  const [niveles, setNiveles] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // 🛰️ CONEXIÓN TELEPÁTICA CON FIREBASE (La Matriz Real)
  useEffect(() => {
    // 1. Descargamos los niveles reales
    const q = query(collection(db, "niveles"), orderBy("orden", "asc"));
    const unsubNiveles = onSnapshot(q, (snapshot) => {
      setNiveles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Descargamos tu progreso real
    const unsubUser = onSnapshot(doc(db, "usuarios", "comandante_starlin"), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
      setCargando(false);
    });

    return () => { unsubNiveles(); unsubUser(); };
  }, []);

  if (cargando) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-blue-500 font-black tracking-widest animate-pulse">SINCRONIZANDO MATRIZ...</div>;

  const nivelesCompletadosArray = userData?.niveles_completados || [];
  const progresoPorcentaje = niveles.length > 0 ? (nivelesCompletadosArray.length / niveles.length) * 100 : 0;

  return (
    <div className="w-full min-h-screen bg-[#020617] text-slate-200 flex flex-col">
      {/* HUD SUPERIOR */}
      <div className="h-20 border-b border-[#1E293B] bg-[#0B1121] flex items-center justify-between px-8 z-10">
        <Link href="/academia" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
          <div className="p-2 bg-slate-800 rounded-lg"><ArrowLeft size={18} /></div>
          <span className="font-bold tracking-widest text-xs uppercase">Volver al Árbol</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Progreso del Módulo</p>
            <div className="w-32 h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
               <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${progresoPorcentaje}%` }}></div>
            </div>
          </div>
          <div className="font-black text-white text-xl">{nivelesCompletadosArray.length}/{niveles.length}</div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-8 flex flex-col">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Táctica Quirúrgica</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">Domina los patrones geométricos del tablero.</p>
        </div>

        {/* MAPA DE NIVELES DINÁMICO DESDE FIREBASE */}
        <div className="flex-1 relative">
          <div className="absolute top-0 bottom-0 left-[27px] w-1 bg-slate-800/50 rounded-full z-0 md:left-1/2 md:-ml-[2px]"></div>

          <div className="space-y-8 relative z-10">
            {niveles.map((nivel, index) => {
              const esIzquierda = index % 2 === 0;
              const esCompletado = nivelesCompletadosArray.includes(Number(nivel.id));
              // Se desbloquea si es el nivel 1, O si el nivel anterior está completado en Firebase
              const esDesbloqueado = index === 0 || nivelesCompletadosArray.includes(Number(niveles[index-1].id));

              return (
                <div key={nivel.id} className={`flex items-center gap-6 md:justify-between ${esIzquierda ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className="hidden md:block md:w-5/12"></div>
                  
                  <div className="relative flex-shrink-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                      esCompletado ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                      esDesbloqueado ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] scale-110 cursor-pointer hover:scale-125' :
                      'bg-slate-900 border-slate-800 text-slate-600'
                    }`}
                    onClick={() => esDesbloqueado && setNivelSeleccionado(nivel)}>
                      {esCompletado ? <CheckCircle size={24} /> : 
                       esDesbloqueado ? (nivel.tipo === 'teoria' ? <BookOpen size={24} /> : <Target size={24} />) : 
                       <Lock size={20} />}
                    </div>
                  </div>

                  <div className="flex-1 md:w-5/12">
                    <div className={`p-5 rounded-2xl border transition-all ${
                      esCompletado ? 'bg-emerald-900/10 border-emerald-500/20' :
                      esDesbloqueado ? 'bg-[#0B1121] border-blue-500/30 hover:border-blue-500/60 cursor-pointer' :
                      'bg-slate-900/50 border-slate-800 opacity-50'
                    }`}
                    onClick={() => esDesbloqueado && setNivelSeleccionado(nivel)}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${nivel.tipo === 'teoria' ? 'text-amber-500' : 'text-rose-500'}`}>
                        Nivel {nivel.id} • {nivel.tipo === 'teoria' ? 'Lección Teórica' : 'Prueba Práctica'}
                      </p>
                      <h3 className={`text-lg font-bold mb-2 ${esDesbloqueado ? 'text-white' : 'text-slate-500'}`}>{nivel.titulo}</h3>
                      <p className="text-sm text-slate-400">{nivel.descripcion}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {nivelSeleccionado && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#020617]/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0B1121] border border-blue-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-[0_0_50px_rgba(59,130,246,0.2)]">
              <h2 className="text-2xl font-black text-white mb-2">{nivelSeleccionado.titulo}</h2>
              <p className="text-slate-400 mb-8">{nivelSeleccionado.descripcion}</p>
              <div className="flex gap-4">
                <button onClick={() => setNivelSeleccionado(null)} className="flex-1 py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800">Cancelar</button>
                <button onClick={() => router.push(`/academia/modulo/tactica/${nivelSeleccionado.id}`)} className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-500 flex items-center justify-center gap-2">
                  <Zap size={18} /> Iniciar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}