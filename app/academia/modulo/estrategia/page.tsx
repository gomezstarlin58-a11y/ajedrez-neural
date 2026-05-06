"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/motorFirebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { BookOpen, Compass, Crown, ChevronRight, Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation'; // 🔥 AGREGADO: El enrutador forzado

export default function AteneoEstrategicoPage() {
  const router = useRouter(); // 🔥 Instanciamos el enrutador
  const [tomos, setTomos] = useState<any[]>([]);
  const [tomosCompletados, setTomosCompletados] = useState<number[]>([]);
  const [cargando, setCargando] = useState(true);
  const [hoveredTomo, setHoveredTomo] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "usuarios", "comandante_starlin"));
        const completados = userDoc.exists() ? (userDoc.data().tomos_estrategia_completados || []) : [];
        setTomosCompletados(completados);

        const querySnapshot = await getDocs(collection(db, "estrategia_tomos"));
        const tomosData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        tomosData.sort((a: any, b: any) => a.orden - b.orden);
        setTomos(tomosData);
      } catch (error) {
        console.error("Error al cargar los datos del Ateneo:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 size={60} className="text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-900/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none"></div>

      <nav className="relative z-10 border-b border-white/5 bg-black/40 backdrop-blur-md px-10 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <BookOpen className="text-amber-500" size={28} />
          <h1 className="text-2xl font-serif font-bold text-white tracking-wide">Ateneo Neural</h1>
        </div>
        <button onClick={() => router.push('/academia')} className="text-xs uppercase tracking-widest text-slate-500 hover:text-amber-400 transition-colors">
          Retornar al Árbol
        </button>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-10 py-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        <div className="lg:col-span-5 flex flex-col justify-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h2 className="text-amber-500 text-sm font-bold tracking-[0.3em] uppercase mb-6">Módulo Avanzado II</h2>
            <h1 className="text-5xl md:text-6xl font-serif font-black text-white leading-tight mb-8">
              Estructura <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600">Posicional</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed font-light mb-10">
              La táctica te enseña qué hacer cuando hay algo que hacer. La estrategia te enseña qué hacer cuando no hay nada que hacer. Bienvenido al arte de la guerra silenciosa.
            </p>
          </motion.div>
        </div>

        <div className="lg:col-span-7 relative">
          <div className="space-y-4">
            {tomos.map((tomo, index) => {
              const estaDesbloqueado = index === 0 || tomosCompletados.includes(tomos[index - 1].orden);
              
              return estaDesbloqueado ? (
                <motion.div 
                  key={tomo.id}
                  onClick={() => router.push(`/academia/modulo/estrategia/${tomo.id}`)} // 🔥 El clic forzado
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredTomo(tomo.id)}
                  onMouseLeave={() => setHoveredTomo(null)}
                  className="group relative overflow-hidden p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between bg-white/[0.03] border-white/10 hover:bg-amber-900/20 hover:border-amber-500/30 cursor-pointer"
                >
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border font-serif text-xl border-amber-500/50 text-amber-400 bg-amber-500/10">
                      {"I" + (index === 0 ? "" : "I".repeat(index))}
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold mb-1 text-white">{tomo.titulo}</h3>
                      <p className="text-sm tracking-wide text-amber-500/70 uppercase">{tomo.concepto}</p>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-amber-500 transition-transform duration-300 ${hoveredTomo === tomo.id ? 'translate-x-2' : ''}`}>
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div key={tomo.id} className="group relative overflow-hidden p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between bg-black/40 border-white/5 opacity-60">
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center border font-serif text-xl border-slate-800 text-slate-600 bg-slate-900">
                      <Lock size={18} />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold mb-1 text-slate-500">{tomo.titulo}</h3>
                      <p className="text-sm tracking-wide text-slate-600 uppercase">{tomo.concepto}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}