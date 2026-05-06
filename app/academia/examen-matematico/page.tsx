"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/motorFirebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Ruler, PencilRuler, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const EXAMEN_ARQUITECTURA = [
  {
    pregunta: "Cálculo I: La Regla del Cuadrado. Un peón enemigo huye en la columna 'a'. Está en la fila 5 y coronará en 'a8'. ¿De cuántas casillas es el lado del 'cuadrado de la muerte' que tu Rey debe pisar?",
    opciones: [
      { id: "A", texto: "De 4 casillas (a5, a6, a7, a8).", correcta: true },
      { id: "B", texto: "De 3 casillas, porque restas la fila actual.", correcta: false }
    ],
    feedbackError: "El compás ha resbalado. Tienes que contar la casilla donde está el peón y la casilla donde corona. Son 4. Tu plano es defectuoso. Rompiendo el pergamino..."
  },
  {
    pregunta: "Cálculo II: La Balanza de Sangre. Tu Torre (vale 5) y tu Alfil (3) atacan un Caballo enemigo (3) que está defendido por una Torre (5). Tomas la decisión de iniciar la captura total. ¿Cuál es el saldo neto?",
    opciones: [
      { id: "A", texto: "Gano el intercambio por 3 puntos.", correcta: false },
      { id: "B", texto: "Pierdo 2 puntos netos.", correcta: true } // Capturas el Caballo (+3). Él captura tu Torre con su Torre (-5). Saldo: -2.
    ],
    feedbackError: "Tus matemáticas te han llevado a la ruina. Ganas 3 (Caballo) pero pierdes 5 (Torre). Tu déficit es de -2. El banco te ha embargado la partida. Reiniciando..."
  },
  {
    pregunta: "Cálculo III: El Teorema de la Oposición. Tu Rey y el enemigo están frente a frente en la misma columna. Hay 3 casillas vacías entre ustedes. Es TU turno de mover. ¿Tienes la ventaja matemática de la Oposición?",
    opciones: [
      { id: "A", texto: "No. Al tocarme mover a mí, me obligo a ceder el paso.", correcta: true }, 
      { id: "B", texto: "Sí, porque el número de casillas es impar (3).", correcta: false }
    ],
    feedbackError: "Cálculo erróneo de tiempos. Con número impar, el que mueve PIERDE la oposición (Zugzwang). Has cedido el trono por no saber contar. Borrando trazos..."
  }
];

export default function ExamenMatematicoPage() {
  const router = useRouter();
  const [faseActual, setFaseActual] = useState(0);
  const [estado, setEstado] = useState<'inicio' | 'preguntas' | 'error' | 'exito'>('inicio');
  const [mensajeError, setMensajeError] = useState("");

  // Control de seguridad
  useEffect(() => {
    const verificarCredenciales = async () => {
      const userDoc = await getDoc(doc(db, "usuarios", "comandante_starlin"));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const nivelesTactica = data.niveles_completados || [];
        const tomosEstrategia = data.tomos_estrategia_completados || [];
        
        const pasoTactica = nivelesTactica.length >= 15;
        const pasoEstrategia = tomosEstrategia.length >= 4 || tomosEstrategia.includes(5);
        
        if (!pasoTactica || !pasoEstrategia) {
          router.push('/academia'); // Expulsado
        }
      }
    };
    verificarCredenciales();
  }, [router]);

  const procesarRespuesta = (correcta: boolean, feedback: string) => {
    if (correcta) {
      if (faseActual === EXAMEN_ARQUITECTURA.length - 1) {
        aprobarExamen();
      } else {
        setFaseActual(prev => prev + 1);
      }
    } else {
      setMensajeError(feedback);
      setEstado('error');
      setTimeout(() => {
        setFaseActual(0);
        setEstado('preguntas');
        setMensajeError("");
      }, 5500); 
    }
  };

  const aprobarExamen = async () => {
    setEstado('exito');
    try {
      await setDoc(doc(db, "usuarios", "comandante_starlin"), {
        examen_matematico_aprobado: true
      }, { merge: true });
    } catch (error) {
      console.error("Error guardando progreso matemático:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#e6dcc3] text-stone-800 flex items-center justify-center relative overflow-hidden font-serif selection:bg-amber-900/20">
      
      {/* Textura de papel pergamino antiguo */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')" }}></div>
      
      {/* Líneas de boceto arquitectónico en el fondo */}
      <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="300" r="200" stroke="#444" strokeWidth="1" fill="none" strokeDasharray="5,5"/>
          <rect x="200" y="100" width="400" height="400" stroke="#444" strokeWidth="1" fill="none" />
          <line x1="200" y1="100" x2="600" y2="500" stroke="#444" strokeWidth="1" />
          <line x1="600" y1="100" x2="200" y2="500" stroke="#444" strokeWidth="1" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl w-full p-10">
        <AnimatePresence mode="wait">
          
          {/* INICIO DEL EXAMEN */}
          {estado === 'inicio' && (
            <motion.div key="inicio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <Compass size={80} strokeWidth={1} className="mx-auto text-amber-900 mb-8 opacity-80" />
              <h1 className="text-5xl text-stone-900 font-black mb-6 tracking-tight uppercase border-b-2 border-stone-800/20 inline-block pb-4">La Mesa de Dibujo</h1>
              <p className="text-xl text-stone-700 leading-relaxed mb-12 max-w-2xl mx-auto italic">
                El ajedrez es arquitectura en movimiento. Demuestra que puedes calcular la geometría del tablero sin mover una sola pieza de madera. Un error de cálculo y tu plano será destruido.
              </p>
              <button 
                onClick={() => setEstado('preguntas')}
                className="px-12 py-4 border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-[#e6dcc3] transition-all duration-300 uppercase tracking-[0.2em] font-bold text-sm"
              >
                Tomar el Lápiz y Compás
              </button>
            </motion.div>
          )}

          {/* PREGUNTAS EN PAPEL */}
          {estado === 'preguntas' && (
            <motion.div key="preguntas" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-16">
                <PencilRuler className="mx-auto text-amber-900/60 mb-4" size={30} />
                <h2 className="text-3xl text-stone-900 font-medium leading-relaxed border-l-4 border-amber-900 pl-6 text-left">
                  {EXAMEN_ARQUITECTURA[faseActual].pregunta}
                </h2>
              </div>
              
              <div className="flex flex-col gap-6 max-w-xl mx-auto">
                {EXAMEN_ARQUITECTURA[faseActual].opciones.map((opcion) => (
                  <button 
                    key={opcion.id}
                    onClick={() => procesarRespuesta(opcion.correcta, EXAMEN_ARQUITECTURA[faseActual].feedbackError)}
                    className="p-6 text-xl text-stone-700 bg-white/40 border border-stone-800/20 hover:border-amber-900 hover:bg-amber-900/10 transition-all text-left flex items-start gap-4"
                  >
                    <span className="font-bold text-amber-900">{opcion.id}.</span> {opcion.texto}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ERROR (PLANO ROTO) */}
          {estado === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <XCircle size={80} strokeWidth={1} className="mx-auto text-red-800 mb-8" />
              <h2 className="text-4xl text-red-900 font-black mb-6 uppercase tracking-widest">Cálculo Defectuoso</h2>
              <p className="text-2xl text-stone-800 leading-relaxed font-light italic">{mensajeError}</p>
            </motion.div>
          )}

          {/* ÉXITO (INGRESO AL TALLER) */}
          {estado === 'exito' && (
            <motion.div key="exito" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <CheckCircle2 size={80} strokeWidth={1} className="mx-auto text-amber-900 mb-8" />
              <h2 className="text-5xl text-stone-900 font-black mb-6 uppercase tracking-widest">Planos Aprobados</h2>
              <p className="text-xl text-stone-700 leading-relaxed mb-12 italic">
                Tus proporciones son exactas. Has demostrado tener la mente de un arquitecto. Puedes pasar al Taller.
              </p>
              <button 
                onClick={() => router.push('/academia/modulo/matematico')}
                className="px-12 py-4 bg-amber-900 text-[#e6dcc3] hover:bg-stone-900 transition-colors uppercase tracking-[0.2em] font-bold text-sm shadow-xl"
              >
                Entrar al Taller de Geometría
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}