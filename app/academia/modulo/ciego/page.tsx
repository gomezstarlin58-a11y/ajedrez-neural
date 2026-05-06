"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/motorFirebase'; // Asegúrate de que los puntos de ruta estén bien
import { collection, getDocs, doc, setDoc, arrayUnion, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Sparkles, ArrowRight, ArrowLeft, Loader2, Focus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Retos prácticos incrustados para cada nivel
const RETOS_PRACTICOS: Record<number, { meta: string, instruccion: string }> = {
  0: { meta: 'd5', instruccion: 'Demuestra tu cartografía. Ubica y toca la luz de la casilla D5 en el vacío.' },
  1: { meta: 'b3', instruccion: 'El Caballo está en A1. Marca su primer salto exacto (B3) en la ruta hacia C2.' },
  2: { meta: 'e4', instruccion: 'Marca el centro exacto donde se cruzan las dos Grandes Diagonales (E4).' }
};

const FILAS = [8, 7, 6, 5, 4, 3, 2, 1];
const COLUMNAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function PalacioMentalPage() {
  const router = useRouter();
  const [niveles, setNiveles] = useState<any[]>([]);
  const [nivelActual, setNivelActual] = useState(0);
  
  // Fases: informe -> pregunta -> feedback -> practica
  const [fase, setFase] = useState<'informe' | 'pregunta' | 'feedback' | 'practica'>('informe');
  const [pasoInforme, setPasoInforme] = useState(0);
  const [feedbackData, setFeedbackData] = useState({ esCorrecta: false, mensaje: "" });
  const [cargando, setCargando] = useState(true);

  // Estados del Lienzo Mental (La Práctica)
  const [nodoError, setNodoError] = useState<string | null>(null);
  const [nodoExito, setNodoExito] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // 🛡️ VERIFICACIÓN DE IDENTIDAD AL ENTRAR 🛡️
      const userId = localStorage.getItem("user_id");
      if (!userId) {
         router.push('/');
         return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, "ciego_niveles"));
        const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        data.sort((a: any, b: any) => a.orden - b.orden);
        setNiveles(data);
      } catch (error) {
        console.error("Error al cargar el Palacio Mental:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, [router]);

  const avanzarInforme = () => {
    if (pasoInforme < niveles[nivelActual].informe.length - 1) {
      setPasoInforme(p => p + 1);
    } else {
      setFase('pregunta');
    }
  };

  const evaluarRespuesta = (opcion: any) => {
    setFeedbackData({ esCorrecta: opcion.correcta, mensaje: opcion.feedback });
    setFase('feedback');
  };

  const iniciarPractica = () => {
    setFase('practica');
    setNodoError(null);
    setNodoExito(null);
  };

  // 🔥 AQUÍ SE APLICA LA CURA DEL XP Y EL USUARIO REAL 🔥
  const intentarNodo = async (nodo: string) => {
    if (nodoExito) return; // Si ya ganó, bloquea los clics
    
    const reto = RETOS_PRACTICOS[nivelActual] || RETOS_PRACTICOS[0];
    
    if (nodo === reto.meta) {
      setNodoExito(nodo);
      setNodoError(null);
      
      const userId = localStorage.getItem("user_id");
      if (!userId) {
          console.warn("Recluta no identificado. No se puede guardar la XP.");
          return;
      }

      try {
        // Guardar victoria en Firebase al superar la práctica con el usuario REAL y sumar XP
        await setDoc(doc(db, "usuarios", userId), {
          niveles_ciego_completados: arrayUnion(niveles[nivelActual].id),
          xp: increment(niveles[nivelActual].xp || 500) // 👈 Suma la experiencia de verdad
        }, { merge: true });
      } catch (error) {
        console.error("Error guardando el progreso del entrenamiento ciego:", error);
      }

    } else {
      setNodoError(nodo);
      setTimeout(() => setNodoError(null), 800); // Quitar el rojo después de un rato
    }
  };

  const siguienteNivel = () => {
    if (nivelActual < niveles.length - 1) {
      setNivelActual(n => n + 1);
      setPasoInforme(0);
      setFase('informe');
    } else {
      router.push('/academia'); // Fin del módulo
    }
  };

  if (cargando || niveles.length === 0) {
    return <div className="min-h-screen bg-[#0a0514] flex items-center justify-center"><Loader2 size={60} className="text-fuchsia-500 animate-spin" /></div>;
  }

  const nivel = niveles[nivelActual];
  const reto = RETOS_PRACTICOS[nivelActual] || RETOS_PRACTICOS[0];

  return (
    <div className="min-h-screen bg-[#0a0514] text-indigo-100 font-serif flex flex-col items-center justify-center relative overflow-hidden selection:bg-fuchsia-500/30">
      
      {/* Fondo Místico */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[20%] left-[50%] transform -translate-x-1/2 w-[800px] h-[800px] bg-fuchsia-900/10 blur-[200px] rounded-full mix-blend-screen animate-pulse"></div>
      </div>

      <Link href="/academia" className="absolute top-10 left-10 flex items-center gap-3 text-indigo-400 hover:text-fuchsia-400 transition-colors z-50 uppercase tracking-widest text-xs font-sans">
        <ArrowLeft size={16} /> Salir del Vacío
      </Link>

      <div className="relative z-10 w-full max-w-4xl px-8 text-center flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* FASES TEÓRICAS (Ocultadas si estamos en la práctica) */}
          {fase === 'informe' && (
            <motion.div key="informe" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BrainCircuit className="mx-auto text-fuchsia-500/50 mb-8" size={50} strokeWidth={1} />
              <h2 className="text-sm tracking-[0.4em] uppercase text-fuchsia-400 mb-4">{nivel.concepto}</h2>
              <h1 className="text-4xl font-light text-white mb-12">{nivel.titulo}</h1>
              <div className="min-h-[150px] flex items-center justify-center max-w-2xl mx-auto">
                <p className="text-2xl text-indigo-200/80 leading-relaxed font-light">{nivel.informe[pasoInforme]}</p>
              </div>
              <div className="mt-16 flex flex-col items-center gap-6">
                <button onClick={avanzarInforme} className="w-16 h-16 rounded-full border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 hover:bg-fuchsia-500/10 hover:border-fuchsia-400 transition-all"><ArrowRight size={24} /></button>
              </div>
            </motion.div>
          )}

          {fase === 'pregunta' && (
            <motion.div key="pregunta" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl">
              <Sparkles className="mx-auto text-teal-400/50 mb-8" size={50} strokeWidth={1} />
              <h2 className="text-3xl text-white font-light leading-relaxed mb-12">{nivel.pregunta?.texto || nivel.pregunta}</h2>
              <div className="grid grid-cols-1 gap-4">
                {nivel.pregunta?.opciones?.map((opcion: any) => (
                  <button key={opcion.id} onClick={() => evaluarRespuesta(opcion)} className="p-6 text-xl text-indigo-200 bg-white/[0.02] border border-white/5 hover:border-fuchsia-500/40 hover:bg-fuchsia-900/20 transition-all rounded-2xl">{opcion.texto}</button>
                ))}
              </div>
            </motion.div>
          )}

          {fase === 'feedback' && (
            <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className={`text-4xl font-bold mb-6 ${feedbackData.esCorrecta ? 'text-teal-400' : 'text-rose-500'}`}>
                {feedbackData.esCorrecta ? 'Visión Clara' : 'Ilusión Óptica'}
              </h2>
              <p className="text-2xl text-indigo-200/80 leading-relaxed font-light mb-12 max-w-2xl mx-auto">{feedbackData.mensaje}</p>
              
              {feedbackData.esCorrecta ? (
                <button onClick={iniciarPractica} className="px-10 py-4 bg-fuchsia-900/30 border border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-800/40 transition-colors rounded-full uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(217,70,239,0.2)] flex items-center gap-2 mx-auto">
                  Entrar al Lienzo Mental (Práctica) <span className="font-bold text-amber-500 ml-2">+{nivel.xp || 500} XP</span>
                </button>
              ) : (
                <button onClick={() => setFase('pregunta')} className="px-10 py-4 bg-rose-900/30 border border-rose-500/50 text-rose-300 hover:bg-rose-800/40 transition-colors rounded-full uppercase tracking-widest text-sm mx-auto block">
                  Enfocar de Nuevo
                </button>
              )}
            </motion.div>
          )}

          {/* 🔥 LA NUEVA FASE PRÁCTICA: EL LIENZO MENTAL 🔥 */}
          {fase === 'practica' && (
            <motion.div key="practica" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full flex flex-col items-center">
              <Focus className="text-fuchsia-500 mb-6 animate-pulse" size={40} strokeWidth={1} />
              <h2 className="text-2xl text-indigo-200/90 font-light leading-relaxed mb-10 max-w-xl mx-auto">
                {reto.instruccion}
              </h2>

              {/* La Rejilla Sensorial (Sin coordenadas, pura intuición) */}
              <div className="bg-black/40 p-4 sm:p-8 rounded-[3rem] border border-white/5 shadow-2xl backdrop-blur-md relative">
                <div className="grid grid-cols-8 gap-1 sm:gap-2">
                  {FILAS.map((fila) => (
                    COLUMNAS.map((col) => {
                      const idNodo = `${col}${fila}`;
                      const esError = nodoError === idNodo;
                      const esExito = nodoExito === idNodo;

                      return (
                        <button
                          key={idNodo}
                          onClick={() => intentarNodo(idNodo)}
                          disabled={!!nodoExito} // Deshabilita clics si ya ganó
                          className={`
                            w-8 h-8 sm:w-12 sm:h-12 rounded-full sm:rounded-xl transition-all duration-300 
                            ${esExito ? 'bg-teal-400 shadow-[0_0_30px_teal] scale-110 border-transparent' 
                              : esError ? 'bg-rose-600 shadow-[0_0_20px_rose] scale-90 border-transparent animate-shake' 
                              : 'bg-white/5 border border-white/10 hover:bg-fuchsia-500/20 hover:border-fuchsia-500/50 hover:scale-105'}
                          `}
                        />
                      );
                    })
                  ))}
                </div>
              </div>

              {/* Botón de Victoria (Aparece solo cuando tocas la luz correcta) */}
              {nodoExito && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 text-center">
                  <p className="text-teal-400 font-bold tracking-widest uppercase mb-6 text-sm">
                    Sinapsis Correcta: Casilla {reto.meta.toUpperCase()} localizada.
                  </p>
                  <button onClick={siguienteNivel} className="px-10 py-4 bg-teal-900/30 border border-teal-500/50 text-teal-300 hover:bg-teal-800/40 transition-colors rounded-full uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(45,212,191,0.2)]">
                    {nivelActual < niveles.length - 1 ? 'Siguiente Desafío Mental' : 'Despertar (Módulo Completado)'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}