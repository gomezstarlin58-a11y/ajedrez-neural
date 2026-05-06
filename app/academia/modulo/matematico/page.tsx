"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../../lib/motorFirebase';
import { collection, getDocs, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Ruler, PencilRuler, ArrowRight, ArrowLeft, Loader2, Maximize } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Retos prácticos en el Plano Arquitectónico
const RETOS_PRACTICOS: Record<number, { meta: string[], instruccion: string }> = {
  0: { meta: ['h4', 'h8', 'd8', 'd4'], instruccion: 'Toma el carbón. Marca las 4 esquinas exactas para trazar el "Cuadrado de la Muerte" del peón que va de h4 a h8.' },
  1: { meta: ['e4'], instruccion: 'Aritmética espacial: Señala el epicentro (1 sola casilla) que equilibra perfectamente las coordenadas c4 y g4.' },
  2: { meta: ['e3'], instruccion: 'El Teorema de la Oposición. Tu rey está en e2, el enemigo en e4. Marca la casilla central exacta que funciona como el eje del péndulo.' }
};

const FILAS = [8, 7, 6, 5, 4, 3, 2, 1];
const COLUMNAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export default function TallerMatematicoPage() {
  const router = useRouter();
  const [niveles, setNiveles] = useState<any[]>([]);
  const [nivelActual, setNivelActual] = useState(0);
  
  const [fase, setFase] = useState<'informe' | 'pregunta' | 'feedback' | 'practica'>('informe');
  const [pasoInforme, setPasoInforme] = useState(0);
  const [feedbackData, setFeedbackData] = useState({ esCorrecta: false, mensaje: "" });
  const [cargando, setCargando] = useState(true);

  // Estados del Plano de Dibujo
  const [puntosMarcados, setPuntosMarcados] = useState<string[]>([]);
  const [errorPlano, setErrorPlano] = useState(false);
  const [exitoPlano, setExitoPlano] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "matematico_niveles"));
        const data = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        data.sort((a: any, b: any) => a.orden - b.orden);
        setNiveles(data);
      } catch (error) {
        console.error("Error al cargar el Taller:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

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
    setPuntosMarcados([]);
    setErrorPlano(false);
    setExitoPlano(false);
  };

  const marcarPunto = async (idNodo: string) => {
    if (exitoPlano) return; // Bloqueado si ya ganó

    const reto = RETOS_PRACTICOS[nivelActual] || RETOS_PRACTICOS[0];
    const nuevosPuntos = puntosMarcados.includes(idNodo) 
      ? puntosMarcados.filter(p => p !== idNodo) // Desmarcar
      : [...puntosMarcados, idNodo]; // Marcar

    setPuntosMarcados(nuevosPuntos);

    // Verificar si el arreglo de puntos marcados tiene los mismos elementos que la meta (sin importar orden)
    if (nuevosPuntos.length === reto.meta.length) {
      const esCorrecto = reto.meta.every(metaPunto => nuevosPuntos.includes(metaPunto));
      
      if (esCorrecto) {
        setExitoPlano(true);
        setErrorPlano(false);
        await setDoc(doc(db, "usuarios", "comandante_starlin"), {
          niveles_matematicos_completados: arrayUnion(niveles[nivelActual].id)
        }, { merge: true });
      } else {
        setErrorPlano(true);
        setTimeout(() => {
          setPuntosMarcados([]); // Borrón de lápiz
          setErrorPlano(false);
        }, 1000);
      }
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
    return <div className="min-h-screen bg-[#e6dcc3] flex items-center justify-center"><Loader2 size={60} className="text-stone-800 animate-spin" /></div>;
  }

  const nivel = niveles[nivelActual];
  const reto = RETOS_PRACTICOS[nivelActual] || RETOS_PRACTICOS[0];

  return (
    <div className="min-h-screen bg-[#e6dcc3] text-stone-800 font-serif flex flex-col items-center justify-center relative overflow-hidden selection:bg-amber-900/20">
      
      {/* Fondo de Pergamino y Planos */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')" }}></div>
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 flex items-center justify-center">
        <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="300" stroke="#444" strokeWidth="2" strokeDasharray="5 5" />
          <line x1="100" y1="400" x2="700" y2="400" stroke="#444" strokeWidth="1" />
          <line x1="400" y1="100" x2="400" y2="700" stroke="#444" strokeWidth="1" />
        </svg>
      </div>

      <Link href="/academia" className="absolute top-10 left-10 flex items-center gap-3 text-stone-600 hover:text-amber-900 transition-colors z-50 uppercase tracking-widest text-xs font-sans font-bold">
        <ArrowLeft size={16} /> Salir del Taller
      </Link>

      <div className="relative z-10 w-full max-w-4xl px-8 text-center flex flex-col items-center">
        <AnimatePresence mode="wait">
          
          {/* FASES TEÓRICAS: EL PERGAMINO */}
          {fase === 'informe' && (
            <motion.div key="informe" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Compass className="mx-auto text-amber-900 mb-8 opacity-80" size={60} strokeWidth={1.5} />
              <h2 className="text-xs font-bold tracking-[0.4em] uppercase text-stone-500 mb-4">{nivel.concepto}</h2>
              <h1 className="text-5xl font-black text-stone-900 mb-12 uppercase tracking-tight">{nivel.titulo}</h1>
              <div className="min-h-[150px] flex items-center justify-center max-w-2xl mx-auto border-t-2 border-b-2 border-stone-800/10 py-8">
                <p className="text-2xl text-stone-700 leading-relaxed font-medium italic">"{nivel.informe[pasoInforme]}"</p>
              </div>
              <div className="mt-12 flex flex-col items-center gap-6">
                <button onClick={avanzarInforme} className="px-8 py-3 border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-[#e6dcc3] transition-all uppercase tracking-[0.2em] font-bold text-xs flex items-center gap-3">
                  Siguiente Trazo <ArrowRight size={16} />
                </button>
                <div className="flex gap-2">
                  {nivel.informe.map((_: any, i: number) => (
                    <div key={i} className={`w-2 h-2 rounded-full border border-stone-800 ${i === pasoInforme ? 'bg-stone-800' : 'bg-transparent'}`} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {fase === 'pregunta' && (
            <motion.div key="pregunta" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="max-w-2xl w-full">
              <PencilRuler className="mx-auto text-amber-900 mb-8 opacity-80" size={50} strokeWidth={1.5} />
              <h2 className="text-3xl text-stone-900 font-medium leading-relaxed mb-12 text-left border-l-4 border-amber-900 pl-6">
                {nivel.pregunta}
              </h2>
              <div className="flex flex-col gap-4">
                {nivel.opciones.map((opcion: any) => (
                  <button key={opcion.id} onClick={() => evaluarRespuesta(opcion)} className="p-6 text-xl text-stone-700 bg-white/40 border border-stone-800/20 hover:border-amber-900 hover:bg-amber-900/10 transition-all text-left flex gap-4">
                    <span className="font-bold text-amber-900">{opcion.id}.</span> {opcion.texto}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {fase === 'feedback' && (
            <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className={`text-4xl font-black mb-6 uppercase tracking-widest ${feedbackData.esCorrecta ? 'text-stone-900' : 'text-red-800'}`}>
                {feedbackData.esCorrecta ? 'Proporción Exacta' : 'Error de Medición'}
              </h2>
              <p className="text-2xl text-stone-700 leading-relaxed font-light italic mb-12 max-w-2xl mx-auto">
                {feedbackData.mensaje}
              </p>
              {feedbackData.esCorrecta ? (
                <button onClick={iniciarPractica} className="px-10 py-4 bg-amber-900 text-[#e6dcc3] hover:bg-stone-900 transition-colors uppercase tracking-[0.2em] font-bold text-sm shadow-xl">
                  Ir a la Mesa de Dibujo (Práctica)
                </button>
              ) : (
                <button onClick={() => setFase('pregunta')} className="px-10 py-4 border-2 border-red-800 text-red-800 hover:bg-red-800 hover:text-[#e6dcc3] transition-colors uppercase tracking-[0.2em] font-bold text-sm">
                  Borrar y Calcular de Nuevo
                </button>
              )}
            </motion.div>
          )}

          {/* 🔥 LA FASE PRÁCTICA: LA MESA DE DIBUJO 🔥 */}
          {fase === 'practica' && (
            <motion.div key="practica" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full flex flex-col items-center">
              <Maximize className="text-amber-900 mb-6 opacity-80" size={40} strokeWidth={1.5} />
              <h2 className="text-2xl text-stone-800 font-medium leading-relaxed mb-10 max-w-xl mx-auto italic">
                {reto.instruccion}
              </h2>

              {/* El Plano Arquitectónico (Rejilla de Dibujo) */}
              <div className={`p-4 sm:p-8 bg-[#f4ebd8] border-2 border-stone-800 shadow-2xl relative transition-all duration-300 ${errorPlano ? 'animate-shake border-red-800' : ''}`}>
                
                {/* Adornos esquineros */}
                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-stone-800 bg-[#e6dcc3]"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-stone-800 bg-[#e6dcc3]"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-stone-800 bg-[#e6dcc3]"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-stone-800 bg-[#e6dcc3]"></div>

                <div className="grid grid-cols-8 gap-1 border border-stone-800/30 p-1 bg-stone-800/5">
                  {FILAS.map((fila) => (
                    COLUMNAS.map((col) => {
                      const idNodo = `${col}${fila}`;
                      const estaMarcado = puntosMarcados.includes(idNodo);

                      return (
                        <button
                          key={idNodo}
                          onClick={() => marcarPunto(idNodo)}
                          disabled={exitoPlano}
                          className={`
                            w-8 h-8 sm:w-12 sm:h-12 border transition-all duration-200 relative
                            ${estaMarcado ? 'bg-amber-900 border-amber-900 shadow-inner' : 'bg-transparent border-stone-800/20 hover:border-amber-900 hover:bg-amber-900/10'}
                            ${exitoPlano && reto.meta.includes(idNodo) ? 'bg-stone-900 border-stone-900 scale-105 z-10 shadow-xl' : ''}
                          `}
                        >
                          {/* Pequeña cruz en el centro de cada cuadro para dar estilo de plano */}
                          {!estaMarcado && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-stone-800/10 rounded-full"></div>}
                        </button>
                      );
                    })
                  ))}
                </div>
                
                {/* Coordenadas tenues a los lados */}
                <div className="absolute -left-6 top-0 h-full flex flex-col justify-around text-[10px] text-stone-500 font-bold font-sans py-8">
                  {FILAS.map(f => <span key={f}>{f}</span>)}
                </div>
                <div className="absolute -bottom-6 left-0 w-full flex justify-around text-[10px] text-stone-500 font-bold font-sans px-8 uppercase">
                  {COLUMNAS.map(c => <span key={c}>{c}</span>)}
                </div>
              </div>

              {/* Botón de Victoria */}
              {exitoPlano && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 text-center">
                  <p className="text-stone-900 font-black tracking-widest uppercase mb-6 text-lg border-b-2 border-stone-900 inline-block pb-2">
                    Trazo Perfecto
                  </p>
                  <br />
                  <button onClick={siguienteNivel} className="px-12 py-4 bg-stone-900 text-[#e6dcc3] hover:bg-amber-900 transition-colors uppercase tracking-[0.2em] font-bold text-sm shadow-xl">
                    {nivelActual < niveles.length - 1 ? 'Siguiente Plano' : 'Completar Obra Maestra'}
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