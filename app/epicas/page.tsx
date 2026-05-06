"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/motorFirebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Crown, Play, Loader2, Sparkles, ScrollText, Swords } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GaleriaEpicasPage() {
  const [partidas, setPartidas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEpicas = async () => {
      try {
        const q = query(collection(db, "partidas_epicas"), orderBy("orden"));
        const snap = await getDocs(q);
        setPartidas(snap.docs.map(d => ({ dbId: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error al cargar galería épica", error);
      } finally {
        setCargando(false);
      }
    };
    fetchEpicas();
  }, []);

  if (cargando) return <div className="min-h-screen bg-[#020617] flex items-center justify-center text-yellow-500 font-black animate-pulse"><Loader2 className="animate-spin mr-2" size={30}/> ABRIENDO LA BÓVEDA HISTÓRICA...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 flex flex-col relative overflow-hidden">
      
      {/* Luces de Fondo */}
      <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-yellow-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Cabecera */}
      <div className="mb-10 relative z-10">
        <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
          <Crown className="text-yellow-500" size={40} />
          Salón de la Fama
        </h1>
        <p className="text-slate-400 mt-2 font-mono text-sm uppercase tracking-widest flex items-center gap-2">
          <Sparkles size={14} className="text-yellow-500"/> Revive y analiza las batallas más legendarias de la historia.
        </p>
      </div>

      {/* Grid de Partidas Épicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
        {partidas.length === 0 ? (
           <p className="text-slate-500 italic col-span-full">El archivo está vacío. Usa el panel de Admin para forjar partidas épicas.</p>
        ) : (
          partidas.map((p, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={p.dbId} 
              className="bg-gradient-to-br from-[#1a1405] to-[#0B1121] border border-yellow-900/30 rounded-[2rem] p-6 shadow-2xl hover:border-yellow-500/50 transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Archivo #{p.orden}</span>
                <Swords size={20} className="text-yellow-700 opacity-50 group-hover:opacity-100 transition-opacity"/>
              </div>

              <h2 className="text-2xl font-black text-white uppercase leading-tight mb-3">{p.titulo}</h2>
              
              <div className="flex-1 mb-6 relative">
                 <ScrollText size={14} className="text-slate-600 absolute -left-5 top-1"/>
                 <p className="text-sm text-slate-400 leading-relaxed line-clamp-4 text-justify pl-1">
                   {p.historia}
                 </p>
              </div>

              <button 
                onClick={() => router.push(`/epicas/${p.dbId}`)}
                className="w-full bg-slate-900 hover:bg-yellow-600 text-slate-300 hover:text-white border border-slate-800 hover:border-yellow-500 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all group-hover:shadow-[0_0_20px_rgba(202,138,4,0.3)] mt-auto"
              >
                <Play size={18} fill="currentColor"/> Iniciar Simulación
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}