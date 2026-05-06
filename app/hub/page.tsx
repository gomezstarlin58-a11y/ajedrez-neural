"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Flame, Crosshair, ChevronRight, Newspaper, Activity } from 'lucide-react';

const noticias = [
  { id: 1, titulo: "Carlsen sacrifica la dama en el Tata Steel", img: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=600&auto=format&fit=crop", tag: "Torneos" },
  { id: 2, titulo: "El resurgimiento del Gambito de Rey en la élite", img: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=600&auto=format&fit=crop", tag: "Teoría" },
  { id: 3, titulo: "Nakamura rompe el récord de Bullet a ciegas", img: "https://images.unsplash.com/photo-1610633389816-ebbd5b9eb471?q=80&w=600&auto=format&fit=crop", tag: "Hazaña" },
  { id: 4, titulo: "Ding Liren revela su preparación psicológica", img: "https://images.unsplash.com/photo-1528819622765-d6bcf132f793?q=80&w=600&auto=format&fit=crop", tag: "Psicología" },
];

export default function HubPage() {
  return (
    <div className="w-full min-h-screen text-slate-200">
      
      {/* CABECERA */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex justify-between items-end"
      >
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Panel Neural</h1>
          <p className="text-slate-400 mt-1">Nivel actual: <span className="text-blue-400 font-bold">Candidato a Maestro</span></p>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#0B1121] border border-[#1E293B] px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
            <Flame className="text-orange-500 animate-pulse" size={20} />
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase">Racha</p>
              <p className="font-bold text-white leading-none">14 Días</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* BENTO GRID (La cuadrícula principal) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SECCIÓN A: PULSO TÁCTICO */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-[#0B1121] border border-[#1E293B] rounded-3xl p-6 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none transition-all group-hover:bg-blue-500/20"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Crosshair className="text-cyan-400" size={24} /> Pulso Táctico Diario
            </h2>
            <span className="bg-cyan-500/10 text-cyan-400 text-xs font-bold px-3 py-1 rounded-full">Reto Activo</span>
          </div>

          <div className="w-full h-[300px] bg-[#020617] rounded-2xl border border-[#1E293B] flex items-center justify-center flex-col gap-4 relative z-10">
             <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center animate-pulse">
                <Activity className="text-blue-400" size={32} />
             </div>
             <p className="text-slate-400 font-medium">Instalando Motor Matemático (WASM)...</p>
          </div>
        </motion.div>

        {/* SECCIÓN B: PERFIL NEURAL */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0B1121] border border-[#1E293B] rounded-3xl p-6 shadow-2xl flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Brain className="text-purple-400" size={24} /> Perfil Psicológico
            </h2>
          </div>
          
          <div className="flex-1 bg-[#020617] rounded-2xl border border-[#1E293B] flex items-center justify-center text-slate-500 p-6 text-center">
            <p>El escaneo de tus fortalezas y debilidades aparecerá aquí.</p>
          </div>

          <Link href="/hub/psicologia" className="mt-4 w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
            Ver Análisis Completo <ChevronRight size={18} />
          </Link>
        </motion.div>

        {/* SECCIÓN C: EL SCRIPTORIUM */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 bg-[#0B1121] border border-[#1E293B] rounded-3xl p-6 shadow-2xl overflow-hidden"
        >
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
            <Newspaper className="text-emerald-400" size={24} /> El Scriptorium
          </h2>
          
          <div className="w-full overflow-hidden relative">
            <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-[#0B1121] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-[#0B1121] to-transparent z-10 pointer-events-none"></div>
            
            <motion.div 
              className="flex gap-6 w-max"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 30, repeat: Infinity }}
            >
              {[...noticias, ...noticias].map((noticia, index) => (
                <Link key={index} href={`/noticias/articulo`} className="block w-[300px] h-[200px] relative rounded-2xl overflow-hidden group cursor-pointer border border-[#1E293B]">
                  <img src={noticia.img} alt={noticia.titulo} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1 block">{noticia.tag}</span>
                    <h3 className="text-white font-bold leading-tight line-clamp-2">{noticia.titulo}</h3>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}