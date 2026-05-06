"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, TrendingDown, Flame, Shield, Star } from 'lucide-react';

// === BASE DE DATOS DE LEYENDAS (Simulada) ===
const topJugadores = [
  { rank: 1, nombre: "Magnus_Neural", elo: 2882, titulo: "GM", racha: 12, tendencia: "up", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop" },
  { rank: 2, nombre: "Hikaru_Blitz", elo: 2830, titulo: "GM", racha: 5, tendencia: "up", avatar: "https://images.unsplash.com/photo-1530268729831-4b0b9e170218?q=80&w=200&auto=format&fit=crop" },
  { rank: 3, nombre: "Starlin_Dev", elo: 2805, titulo: "GM", racha: 8, tendencia: "up", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop" }, // ¡Te puse en el top 3, jefe!
  { rank: 4, nombre: "Ding_Liren", elo: 2780, titulo: "GM", racha: 0, tendencia: "down", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop" },
  { rank: 5, nombre: "Nepo_N", elo: 2775, titulo: "GM", racha: 2, tendencia: "up", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=200&auto=format&fit=crop" },
  { rank: 6, nombre: "Fabi_Caruana", elo: 2770, titulo: "GM", racha: 0, tendencia: "down", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop" },
  { rank: 7, nombre: "Alireza_F", elo: 2765, titulo: "GM", racha: 4, tendencia: "up", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=200&auto=format&fit=crop" },
];

export default function RankingPage() {
  const [ligaActiva, setLigaActiva] = useState('global');

  // Separamos el Top 3 del resto para el diseño del podio
  const podio = topJugadores.slice(0, 3);
  const resto = topJugadores.slice(3);

  return (
    <div className="w-full min-h-screen text-slate-200 flex flex-col gap-8 relative overflow-hidden pb-12">
      
      {/* Luces holográficas de fondo */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      {/* CABECERA */}
      <div className="w-full flex flex-col md:flex-row justify-between items-end z-10 border-b border-[#1E293B] pb-6 mt-6 gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/30 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Trophy size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Panteón de Leyendas</h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">
              <Star size={14} className="text-amber-500" /> Los mejores estrategas de la red neural.
            </p>
          </div>
        </div>

        {/* SELECTOR DE LIGAS */}
        <div className="flex bg-[#020617] p-1.5 rounded-xl border border-[#1E293B]">
          {['global', 'nacional', 'amigos'].map((liga) => (
            <button
              key={liga}
              onClick={() => setLigaActiva(liga)}
              className={`px-6 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
                ligaActiva === liga 
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {liga}
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA DEL PODIO (Top 3) */}
      <div className="relative z-10 flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 mt-12 mb-16 h-[300px]">
        
        {/* 2do LUGAR (Plata) */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center relative z-10 w-32 md:w-48 order-2 md:order-1">
          <div className="absolute -top-6 text-slate-300 drop-shadow-[0_0_10px_rgba(203,213,225,0.8)]"><Medal size={36} /></div>
          <img src={podio[1].avatar} alt={podio[1].nombre} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-slate-300 object-cover z-10 shadow-[0_0_30px_rgba(203,213,225,0.3)]" />
          <div className="w-full bg-gradient-to-t from-[#020617] to-slate-800/80 border border-slate-700/50 rounded-t-2xl h-32 mt-[-20px] pt-8 flex flex-col items-center">
             <span className="font-bold text-white text-center px-2 line-clamp-1">{podio[1].nombre}</span>
             <span className="text-slate-300 font-black text-xl">{podio[1].elo}</span>
          </div>
        </motion.div>

        {/* 1er LUGAR (Oro - En el centro y más alto) */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col items-center relative z-20 w-40 md:w-56 order-1 md:order-2 -mb-8">
          <div className="absolute -top-10 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,1)] animate-bounce"><Crown size={48} /></div>
          <img src={podio[0].avatar} alt={podio[0].nombre} className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-amber-400 object-cover z-10 shadow-[0_0_40px_rgba(251,191,36,0.5)]" />
          <div className="w-full bg-gradient-to-t from-[#020617] to-amber-900/60 border border-amber-500/50 rounded-t-3xl h-44 mt-[-20px] pt-10 flex flex-col items-center shadow-[0_-10px_30px_rgba(251,191,36,0.15)]">
             <span className="font-extrabold text-white text-lg text-center px-2 line-clamp-1">{podio[0].nombre}</span>
             <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full mt-1 border border-amber-500/30">
                <span className="text-amber-400 font-black text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">{podio[0].elo}</span>
             </div>
          </div>
        </motion.div>

        {/* 3er LUGAR (Bronce) */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center relative z-10 w-32 md:w-48 order-3 md:order-3">
          <div className="absolute -top-6 text-orange-600 drop-shadow-[0_0_10px_rgba(234,88,12,0.8)]"><Medal size={36} /></div>
          <img src={podio[2].avatar} alt={podio[2].nombre} className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-orange-600 object-cover z-10 shadow-[0_0_30px_rgba(234,88,12,0.3)]" />
          <div className="w-full bg-gradient-to-t from-[#020617] to-orange-900/40 border border-orange-800/50 rounded-t-2xl h-24 mt-[-20px] pt-8 flex flex-col items-center">
             <span className="font-bold text-white text-center px-2 line-clamp-1">{podio[2].nombre}</span>
             <span className="text-orange-400 font-black text-xl">{podio[2].elo}</span>
          </div>
        </motion.div>

      </div>

      {/* LISTA DE CLASIFICACIÓN (Del 4to en adelante) */}
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-3 z-10">
        {resto.map((jugador, index) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.1 * index }}
            key={jugador.rank} 
            className="flex items-center justify-between bg-[#0B1121]/60 backdrop-blur-md border border-[#1E293B] p-4 rounded-2xl hover:bg-[#1E293B]/40 transition-colors group"
          >
            <div className="flex items-center gap-6">
              <span className="text-2xl font-black text-slate-600 w-8 text-center">{jugador.rank}</span>
              <img src={jugador.avatar} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-[#1E293B]" />
              <div>
                <div className="flex items-center gap-2">
                   <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{jugador.titulo}</span>
                   <h4 className="font-bold text-white group-hover:text-cyan-300 transition-colors">{jugador.nombre}</h4>
                </div>
                {jugador.racha > 2 && (
                   <p className="text-xs text-orange-400 font-bold flex items-center gap-1 mt-1">
                     <Flame size={12} className="animate-pulse"/> Racha de {jugador.racha} victorias
                   </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6">
              {jugador.tendencia === 'up' ? (
                <TrendingUp className="text-emerald-500 hidden sm:block" size={20} />
              ) : (
                <TrendingDown className="text-rose-500 hidden sm:block" size={20} />
              )}
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Puntuación ELO</p>
                <p className="text-xl font-black text-white">{jugador.elo}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* TU POSICIÓN PERSONAL FIJADA ABAJO */}
        <div className="mt-8 relative">
           <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-2xl blur opacity-30 animate-pulse"></div>
           <div className="relative flex items-center justify-between bg-[#020617] border border-cyan-500/50 p-4 rounded-2xl shadow-xl">
             <div className="flex items-center gap-6">
               <span className="text-2xl font-black text-cyan-500 w-8 text-center">42</span>
               <div className="w-12 h-12 rounded-full bg-blue-900/50 border border-cyan-500 flex items-center justify-center text-cyan-400">
                 <Shield size={24} />
               </div>
               <div>
                 <div className="flex items-center gap-2">
                    <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase">NOVATO</span>
                    <h4 className="font-bold text-white">Tú (Starlin)</h4>
                 </div>
                 <p className="text-xs text-cyan-400 font-bold mt-1">Faltan 1,605 pts para GM</p>
               </div>
             </div>

             <div className="flex items-center gap-6">
               <TrendingUp className="text-emerald-500 hidden sm:block" size={20} />
               <div className="text-right">
                 <p className="text-[10px] text-cyan-500/70 font-bold uppercase tracking-widest">Tu ELO</p>
                 <p className="text-xl font-black text-cyan-400 drop-shadow-[0_0_8px_cyan]">1200</p>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}