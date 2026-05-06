"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/motorFirebase';
import { doc, onSnapshot } from 'firebase/firestore'; 
import { useRouter } from 'next/navigation';
// 🔥 Hemos quitado el ícono de Lock, ya no se usa 🔥
import { Target, Shield, Calculator, Brain, Loader2, BookOpen, Swords } from 'lucide-react';

export default function AcademiaArbolPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [xpTotal, setXpTotal] = useState(0);

  // 🔥 ELIMINAMOS TODOS LOS ESTADOS DE DESBLOQUEO 🔥

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    
    if (!userId) {
        router.push('/');
        return;
    }

    const docRef = doc(db, "usuarios", userId);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setXpTotal(data.xp || 0); 
        // 🔥 YA NO CALCULAMOS QUÉ ESTÁ BLOQUEADO Y QUÉ NO 🔥
      } else {
        console.warn("⚠️ Matriz del usuario no encontrada.");
      }
      setCargando(false);
    }, (error) => {
      console.error("Error en la conexión telepática con Firebase:", error);
      setCargando(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Esta función ahora siempre pasará, pero la dejamos por si la necesitas
  const accederModulo = (ruta: string) => {
    router.push(ruta);
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 size={60} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-emerald-400 tracking-widest uppercase font-bold text-sm">Sincronizando con la Matriz...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center py-10 relative overflow-hidden">
      
      <div className="text-center z-10 mb-10">
        <h2 className="text-emerald-500 tracking-[0.3em] font-bold text-sm mb-4 uppercase">
          Evolución Cognitiva
        </h2>
        <h1 className="text-4xl md:text-5xl font-serif font-black mb-2">
          Red Neuronal de Entrenamiento
        </h1>
        <p className="text-emerald-400 font-mono text-sm uppercase tracking-widest bg-emerald-900/30 inline-block px-4 py-1 rounded-full border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          Nivel de Poder: {xpTotal} XP
        </p>
      </div>

      <div className="relative w-full max-w-5xl h-[850px] mt-4">
        
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30">
          <svg viewBox="0 0 1000 1000" className="w-full h-full" preserveAspectRatio="none">
            <polyline points="500,50 250,250 750,450 250,650 750,850 500,950" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="15 15" />
          </svg>
        </div>

        {/* 🟢 1. BÁSICO (SIEMPRE ACTIVO) */}
        <div onClick={() => accederModulo('/academia/modulo/basico')} className="absolute top-[5%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-20">
          <div className="w-24 h-24 rounded-full bg-emerald-900/30 border-2 border-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <BookOpen size={40} className="text-emerald-400" />
          </div>
          <p className="mt-4 font-bold tracking-widest text-emerald-400 uppercase text-center bg-[#020617] px-2">Reglas<br/>Básicas</p>
        </div>

        {/* 🔵 2. TÁCTICA (SIEMPRE ACTIVO) */}
        <div onClick={() => accederModulo('/academia/modulo/tactica')} className="absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-20">
          <div className="w-24 h-24 rounded-full bg-blue-900/30 border-2 border-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.4)]">
            <Target size={40} className="text-blue-400" />
          </div>
          <p className="mt-4 font-bold tracking-widest text-blue-400 uppercase text-center bg-[#020617] px-2">Táctica<br/>Quirúrgica</p>
        </div>

        {/* 🟡 3. ESTRATEGIA (SIEMPRE ACTIVO) */}
        <div onClick={() => accederModulo('/academia/modulo/estrategia')} className="absolute top-[45%] left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all cursor-pointer group">
          <div className="w-24 h-24 rounded-full flex items-center justify-center transition-transform relative bg-amber-900/30 border-2 border-amber-500 group-hover:scale-110 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            <Shield size={40} className="text-amber-500" />
          </div>
          <p className="mt-4 font-bold tracking-widest uppercase text-center bg-[#020617] px-2 text-amber-500">Estructura<br/>Posicional</p>
        </div>

        {/* 🟠 4. MATEMÁTICO (SIEMPRE ACTIVO) */}
        <div onClick={() => accederModulo('/academia/modulo/matematico')} className="absolute top-[65%] left-[25%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all cursor-pointer group">
          <div className="w-24 h-24 rounded-full flex items-center justify-center transition-transform relative bg-orange-900/30 border-2 border-orange-500 group-hover:scale-110 shadow-[0_0_30px_rgba(249,115,22,0.4)]">
            <Calculator size={40} className="text-orange-500" />
          </div>
          <p className="mt-4 font-bold tracking-widest uppercase text-center bg-[#020617] px-2 text-orange-500">Pensamiento<br/>Matemático</p>
        </div>

        {/* 🟣 5. CIEGO (SIEMPRE ACTIVO) */}
        <div onClick={() => accederModulo('/academia/modulo/ciego')} className="absolute top-[85%] left-[75%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all cursor-pointer group">
          <div className="w-24 h-24 rounded-full flex items-center justify-center transition-transform relative bg-fuchsia-900/30 border-2 border-fuchsia-500 group-hover:scale-110 shadow-[0_0_30px_rgba(217,70,239,0.4)]">
            <Brain size={40} className="text-fuchsia-400" />
          </div>
          <p className="mt-4 font-bold tracking-widest uppercase text-center bg-[#020617] px-2 text-fuchsia-400">Entrenamiento<br/>Ciego</p>
        </div>

        {/* 🩸 6. APERTURAS (SIEMPRE ACTIVO) */}
        <div onClick={() => accederModulo('/academia/modulo/aperturas')} className="absolute top-[95%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-20 transition-all cursor-pointer group">
          <div className="w-32 h-32 rounded-full flex items-center justify-center transition-transform relative bg-rose-950/40 border-4 border-rose-600 group-hover:scale-110 shadow-[0_0_50px_rgba(225,29,72,0.6)]">
            <Swords size={56} className="text-rose-500" />
          </div>
          <div className="mt-6 flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 mb-1 border rounded text-rose-400 border-rose-900/50 bg-rose-950/30">Prueba Final</span>
             <p className="font-black tracking-widest text-xl uppercase text-center bg-[#020617] px-4 text-white drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]">Arsenal de<br/>Aperturas</p>
          </div>
        </div>

      </div>
    </div>
  );
}