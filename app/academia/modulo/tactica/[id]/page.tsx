"use client";
import React, { useState, useEffect, useRef, use } from 'react';
import { db } from '../../../../../lib/motorFirebase';
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function NivelRunner({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const nivelId = resolvedParams.id;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [nivel, setNivel] = useState<any>(null);
  const [faseActual, setFaseActual] = useState<'teoria' | 'ejercicios'>('teoria');
  const [pasoTeoria, setPasoTeoria] = useState(0);
  const [indiceEjercicio, setIndiceEjercicio] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [mensajeError, setMensajeError] = useState("");

  useEffect(() => {
    const fetchNivel = async () => {
      const docSnap = await getDoc(doc(db, "niveles", nivelId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("📦 Datos del Nivel Cargados desde Firebase:", data); // <-- DIAGNÓSTICO 1
        setNivel(data);
        
        if (data.contenido && data.contenido.length > 0) {
          setFaseActual('teoria');
        } else if (data.instruccion) {
          setFaseActual('ejercicios');
          cargarFEN(data);
        } else {
          setFaseActual('ejercicios');
          cargarFEN(data);
        }
      } else {
        console.error("❌ NO SE ENCONTRÓ EL NIVEL EN FIREBASE. ID Buscado:", nivelId);
      }
    };
    fetchNivel();
  }, [nivelId]);

  const cargarFEN = (datosNivel: any, indice = 0) => {
    let fenACargar = "";
    if (datosNivel.ejercicios && datosNivel.ejercicios[indice]) {
      fenACargar = datosNivel.ejercicios[indice].fen;
    } else if (datosNivel.fen) {
      fenACargar = datosNivel.fen;
    }

    if (fenACargar) {
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage({
          tipo: 'CARGAR_FEN',
          fen: fenACargar,
          orientacion: 'white',
          draggable: true
        }, '*');
      }, 500); 
    }
  };

  useEffect(() => {
    const handleMensaje = async (event: MessageEvent) => {
      if (event.data?.tipo === 'HUMANO_MOVIO' && faseActual === 'ejercicios') {
        
        console.log("--------- INICIO DE DIAGNÓSTICO DE JUGADA ---------"); // <-- DIAGNÓSTICO 2
        console.log("🎮 Datos enviados por el tablero:", event.data);
        
        let solucionGuardada = "";
        
        if (nivel.jugada_correcta) {
           solucionGuardada = String(nivel.jugada_correcta).toLowerCase().trim();
           console.log("✅ Usando 'jugada_correcta':", solucionGuardada);
        } else if (nivel.ejercicios) {
           solucionGuardada = String(nivel.ejercicios[indiceEjercicio].solucion).toLowerCase().trim();
           console.log("✅ Usando 'nivel.ejercicios[].solucion':", solucionGuardada);
        } else if (nivel.solucion) {
           solucionGuardada = String(nivel.solucion).toLowerCase().trim();
           console.log("✅ Usando 'nivel.solucion':", solucionGuardada);
        } else {
           console.log("❌ ERROR CRÍTICO: No se encontró ninguna solución guardada en el objeto nivel.");
        }

        // 🔥 VALIDADOR AVANZADO MEJORADO 🔥
        // Extraemos todas las posibles formas de la jugada y las convertimos a minúsculas
        const destino = event.data.destino ? String(event.data.destino).toLowerCase().trim() : "";
        const jugadaCompleta = (event.data.origen && event.data.destino) 
            ? `${event.data.origen}${event.data.destino}`.toLowerCase().trim() 
            : "";
        const san = event.data.san ? String(event.data.san).toLowerCase().trim() : "";
        const lan = event.data.lan ? String(event.data.lan).toLowerCase().trim() : "";

        console.log("🔍 Comparando Solución [", solucionGuardada, "] CONTRA:");
        console.log("   - Destino Puro:", destino);
        console.log("   - Jugada Completa:", jugadaCompleta);
        console.log("   - SAN / LAN:", san, "/", lan);

        // Si la solución que escribiste en Admin coincide con CUALQUIERA de estos, pasas de nivel
        if (
          solucionGuardada === destino || 
          solucionGuardada === jugadaCompleta || 
          solucionGuardada === san || 
          solucionGuardada === lan
        ) {
          console.log("🎉 ¡COINCIDENCIA ENCONTRADA! JUGADA ACEPTADA.");
          setMensajeError("");
          avanzarEjercicio();
        } else {
          console.log("❌ NINGUNA COINCIDENCIA. JUGADA RECHAZADA.");
          const textoError = nivel.pregunta?.feedback || "¡Movimiento incorrecto! Piensa en la táctica.";
          setMensajeError(textoError);
          cargarFEN(nivel, indiceEjercicio); 
        }
        console.log("--------- FIN DE DIAGNÓSTICO ---------");
      }
    };
    window.addEventListener('message', handleMensaje);
    return () => window.removeEventListener('message', handleMensaje);
  }, [nivel, faseActual, indiceEjercicio]);

  const avanzarEjercicio = () => {
    if (nivel.ejercicios && indiceEjercicio < nivel.ejercicios.length - 1) {
      setIndiceEjercicio(prev => prev + 1);
      cargarFEN(nivel, indiceEjercicio + 1);
    } else {
      finalizarNivel();
    }
  };

  const finalizarNivel = async () => {
    setCompletado(true);
    try {
      const userRef = doc(db, "usuarios", "comandante_starlin");
      await setDoc(userRef, {
        niveles_completados: arrayUnion(Number(nivelId.replace(/\D/g, '')) || Number(nivel.orden)),
        xp: (nivel.xp || 0) + 250
      }, { merge: true });
    } catch (error) {
      console.error("Error guardando:", error);
    }
  };

  const avanzarTeoria = () => {
    if (nivel.contenido && pasoTeoria < nivel.contenido.length - 1) {
      setPasoTeoria(p => p + 1);
    } else {
      setFaseActual('ejercicios');
      cargarFEN(nivel, 0);
    }
  };

  if (!nivel) return <div className="h-screen bg-[#020617] flex items-center justify-center text-blue-500 font-black animate-pulse">CARGANDO MATRIZ...</div>;

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      <div className="p-6 border-b border-[#1E293B] bg-[#0B1121] flex justify-between items-center">
        <Link href="/academia/modulo/tactica" className="flex items-center gap-2 text-slate-500 hover:text-white">
          <ArrowLeft size={20} /> <span className="text-xs font-bold uppercase">Abandonar</span>
        </Link>
        <div className="font-bold text-amber-500">+{nivel.xp || 500} XP</div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        <div className="p-12 flex flex-col justify-center bg-[#0B1121]">
          <AnimatePresence mode="wait">
            {!completado ? (
              <motion.div key="learning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-4xl font-black text-white mb-6">{nivel.titulo || nivel.concepto}</h2>
                
                {faseActual === 'teoria' ? (
                  <div className="space-y-6">
                     <p className="text-sm text-blue-500 font-bold tracking-widest uppercase mb-4">
                       Fase de Inteligencia ({pasoTeoria + 1}/{nivel.contenido?.length || 1})
                     </p>
                    <p className="text-2xl text-slate-300 font-serif leading-relaxed">
                      "{nivel.contenido ? nivel.contenido[pasoTeoria] : nivel.instruccion}"
                    </p>
                    <button onClick={avanzarTeoria}
                            className="mt-8 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black uppercase flex items-center gap-2">
                      Siguiente <ChevronRight size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-rose-500 font-bold tracking-widest uppercase mb-4">
                       Fase Práctica {nivel.ejercicios ? `(${indiceEjercicio + 1}/${nivel.ejercicios.length})` : ""}
                     </p>
                    <p className="text-xl text-slate-300">
                      {nivel.ejercicios ? nivel.ejercicios[indiceEjercicio].msg : nivel.pregunta?.texto || "Realiza la jugada ganadora."}
                    </p>
                    {mensajeError && (
                      <p className="text-rose-500 font-bold p-4 bg-rose-500/10 rounded-xl border border-rose-500/20 animate-pulse">
                        {mensajeError}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
                <CheckCircle2 size={80} className="mx-auto text-emerald-500 mb-6" />
                <h2 className="text-3xl font-black text-white mb-2">¡Nivel Dominado!</h2>
                <Link href="/academia/modulo/tactica" className="inline-block mt-8 bg-emerald-600 text-white px-10 py-4 rounded-xl font-black hover:bg-emerald-500">
                  Volver a la Matriz
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`p-8 flex items-center justify-center ${faseActual === 'teoria' ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
          <div className="w-full max-w-[500px] aspect-square rounded-3xl overflow-hidden border-4 border-[#1E293B]">
            <iframe ref={iframeRef} src="/ajedrez-motor.html" className="w-full h-full bg-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}