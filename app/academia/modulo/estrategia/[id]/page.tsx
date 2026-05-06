"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../../../lib/motorFirebase';
// 🔥 IMPORTAMOS INCREMENT PARA SUMAR LA XP 🔥
import { doc, getDoc, setDoc, arrayUnion, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, ChevronRight, ShieldCheck, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation'; 

export default function SalaDeGuerraPage() {
  const params = useParams(); 
  const router = useRouter();
  const tomoId = params.id as string;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [tomo, setTomo] = useState<any>(null);
  const [fase, setFase] = useState<'informe' | 'evaluacion' | 'completado'>('informe');
  const [pasoInforme, setPasoInforme] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState("");

  // 🛡️ SEGURIDAD INICIAL: Verificar que no sea un fantasma
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
       router.push('/');
       return;
    }
  }, [router]);

  useEffect(() => {
    if (!tomoId) return;
    const fetchTomo = async () => {
      try {
        const docSnap = await getDoc(doc(db, "estrategia_tomos", tomoId));
        if (docSnap.exists()) {
          setTomo(docSnap.data());
        }
      } catch (error) {
        console.error("Error cargando el tomo:", error);
      }
    };
    fetchTomo();
  }, [tomoId]);

  useEffect(() => {
    if (tomo && iframeRef.current) {
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({
          tipo: 'CARGAR_FEN',
          fen: tomo.fen,
          orientacion: 'white',
          draggable: false
        }, '*');
      }, 800);
    }
  }, [tomo, fase]);

  const avanzarInforme = () => {
    if (pasoInforme < tomo.informe.length - 1) {
      setPasoInforme(p => p + 1);
    } else {
      setFase('evaluacion');
    }
  };

  const procesarRespuesta = async (opcion: any) => {
    setRespuestaSeleccionada(opcion.id);
    
    if (opcion.correcta) {
      setMensajeError("");
      try {
        // 🔥 CORRECCIÓN CRÍTICA: USUARIO REAL Y SUMA DE XP 🔥
        const userId = localStorage.getItem("user_id");
        if (!userId) return;

        await setDoc(doc(db, "usuarios", userId), {
          tomos_estrategia_completados: arrayUnion(tomo.orden),
          xp: increment(tomo.xp || 1000) // Estrategia da más XP, por defecto 1000
        }, { merge: true });
        
      } catch (error) {
        console.error("Error guardando progreso:", error);
      }
      setTimeout(() => setFase('completado'), 1500);
    } else {
      setMensajeError(opcion.feedback);
    }
  };

  if (!tomo) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
      <Loader2 size={60} className="text-amber-500 animate-spin mb-4" />
      <p className="text-amber-500 font-serif tracking-widest uppercase">Descifrando Documentos...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans flex flex-col">
      <div className="h-20 border-b border-white/5 bg-black/50 backdrop-blur-md flex items-center justify-between px-10">
        <button onClick={() => router.push('/academia/modulo/estrategia')} className="flex items-center gap-3 text-slate-500 hover:text-amber-500 transition-colors">
          <ArrowLeft size={20} />
          <span className="font-serif tracking-widest text-sm uppercase">Cerrar Tomo</span>
        </button>
        <div className="flex items-center gap-6">
          <div className="text-amber-500/50 font-serif tracking-widest text-sm uppercase">Tomo {tomo.orden}: {tomo.concepto}</div>
          {/* 🔥 INDICADOR DE RECOMPENSA 🔥 */}
          <div className="font-bold text-amber-500 font-mono">+{tomo.xp || 1000} XP</div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="p-12 flex flex-col justify-center relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-900/10 to-transparent pointer-events-none"></div>

          <AnimatePresence mode="wait">
            {fase === 'informe' && (
              <motion.div key="informe" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <BookOpen className="text-amber-500 mb-6" size={40} />
                <h2 className="text-4xl font-serif font-bold text-white mb-8">{tomo.titulo}</h2>
                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl backdrop-blur-sm shadow-2xl relative">
                  <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-amber-500"></div>
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-amber-500"></div>
                  
                  <p className="text-sm text-amber-500/70 font-bold tracking-widest uppercase mb-4">
                    Informe de Inteligencia ({pasoInforme + 1}/{tomo.informe.length})
                  </p>
                  <p className="text-2xl text-slate-300 font-serif leading-relaxed">
                    "{tomo.informe[pasoInforme]}"
                  </p>
                </div>
                
                <button onClick={avanzarInforme} className="mt-10 px-8 py-4 border border-amber-500/30 text-amber-400 font-serif uppercase tracking-widest rounded-xl hover:bg-amber-500/10 transition-all flex items-center gap-3">
                  Siguiente Fragmento <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {fase === 'evaluacion' && (
              <motion.div key="evaluacion" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Brain className="text-amber-500 mb-6" size={40} />
                <h2 className="text-3xl font-serif font-bold text-white mb-6">Evaluación Analítica</h2>
                <p className="text-lg text-slate-400 mb-8 font-serif leading-relaxed">{tomo.pregunta.texto}</p>

                <div className="space-y-4">
                  {tomo.pregunta.opciones.map((opcion: any) => (
                    <button 
                      key={opcion.id}
                      onClick={() => procesarRespuesta(opcion)}
                      className={`w-full text-left p-6 rounded-xl border transition-all duration-300 flex items-start gap-4
                        ${respuestaSeleccionada === opcion.id 
                          ? opcion.correcta ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-rose-900/20 border-rose-500/50'
                          : 'bg-white/[0.02] border-white/5 hover:border-amber-500/30 hover:bg-amber-900/10'}`}
                    >
                      <span className="font-serif font-bold text-amber-500 text-xl">{opcion.id}.</span>
                      <span className="text-slate-300 font-serif text-lg leading-relaxed">{opcion.texto}</span>
                    </button>
                  ))}
                </div>

                {mensajeError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400">
                    <AlertTriangle size={20} />
                    <p className="font-serif">{mensajeError}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {fase === 'completado' && (
              <motion.div key="completado" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                <ShieldCheck size={80} className="mx-auto text-amber-500 mb-6" />
                <h2 className="text-4xl font-serif font-bold text-white mb-4">Concepto Asimilado</h2>
                <p className="text-slate-400 font-serif text-lg mb-6">Tu visión del tablero se ha expandido. Has desbloqueado el siguiente Tomo.</p>
                {/* 🔥 MENSAJE FINAL DE RECOMPENSA 🔥 */}
                <p className="text-amber-400 font-bold tracking-widest uppercase mb-10 text-sm">
                  Sinapsis Fortalecida: +{tomo.xp || 1000} XP
                </p>
                <button onClick={() => router.push('/academia/modulo/estrategia')} className="px-10 py-4 bg-amber-600 text-white font-serif font-bold uppercase tracking-widest rounded-xl hover:bg-amber-500 transition-colors shadow-[0_0_30px_rgba(217,119,6,0.3)]">
                  Volver al Ateneo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-12 flex items-center justify-center border-l border-white/5 bg-black/20">
          <div className="w-full max-w-[550px] aspect-square rounded-sm overflow-hidden border-[8px] border-[#1a1a1a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            <div className="absolute inset-0 bg-amber-900/5 pointer-events-none z-10"></div>
            <iframe ref={iframeRef} src="/ajedrez-motor.html" className="w-full h-full bg-transparent relative z-0" />
          </div>
        </div>
      </div>
    </div>
  );
}