"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/motorFirebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, BrainCircuit, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// El examen consta de 3 preguntas de pura abstracción mental.
const EXAMEN_MENTAL = [
  {
    pregunta: "Fase 1: Cartografía del Vacío. Imagina el tablero vacío. ¿De qué color es la casilla f7?",
    opciones: [
      { id: "A", texto: "Oscura", correcta: false },
      { id: "B", texto: "Clara", correcta: true } // F es letra 6 (par). 7 es impar. Par+impar = Blanca/Clara.
    ],
    feedbackError: "Tu mente te engaña. F es la sexta columna, 7 es la séptima fila. La casilla f7 es el talón de Aquiles de las piezas negras, y es una casilla Clara. Reiniciando conexión..."
  },
  {
    pregunta: "Fase 2: Geometría Fantasma. Tu Caballo está en la casilla c3. ¿Cuál de estas casillas NO puede atacar bajo ninguna circunstancia en su próximo salto?",
    opciones: [
      { id: "A", texto: "d5", correcta: false },
      { id: "B", texto: "e4", correcta: false },
      { id: "C", texto: "c5", correcta: true } // El caballo no se mueve en línea recta sobre la misma columna.
    ],
    feedbackError: "Has perdido el rastro de la bestia. Un caballo en c3 ataca b5, d5, e4... pero jamás c5. Reiniciando conexión..."
  },
  {
    pregunta: "Fase 3: Rayos X. Ambos reyes están en sus casillas iniciales (e1 y e8). El enemigo coloca un Alfil en a5. ¿Tu rey blanco está en jaque?",
    opciones: [
      { id: "A", texto: "Sí, la diagonal es directa.", correcta: true }, // a5-b4-c3-d2-e1.
      { id: "B", texto: "No, la diagonal no choca con e1.", correcta: false }
    ],
    feedbackError: "Has sido decapitado por no ver la diagonal. De a5 a e1 hay una línea recta inquebrantable. Tu ceguera te ha costado la partida. Reiniciando..."
  }
];

export default function ExamenCiegoPage() {
  const router = useRouter();
  const [faseActual, setFaseActual] = useState(0);
  const [estado, setEstado] = useState<'inicio' | 'preguntas' | 'error' | 'exito'>('inicio');
  const [mensajeError, setMensajeError] = useState("");

  // Verificar que el usuario no se haya saltado los módulos anteriores
  useEffect(() => {
    const verificarCredenciales = async () => {
      const userDoc = await getDoc(doc(db, "usuarios", "comandante_starlin"));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const nivelesTactica = data.niveles_completados || [];
        const tomosEstrategia = data.tomos_estrategia_completados || [];
        
        // 🔥 PARCHE DE TOLERANCIA APLICADO CORRECTAMENTE
        const pasoTactica = nivelesTactica.length >= 15;
        const pasoEstrategia = tomosEstrategia.length >= 4 || tomosEstrategia.includes(5);
        
        if (!pasoTactica || !pasoEstrategia) {
          router.push('/academia'); // Expulsado por falta de rango
        }
      }
    };
    
    // 🔥 AQUÍ FALTABA LLAMAR A LA FUNCIÓN Y CERRAR EL USEEFFECT
    verificarCredenciales();
  }, [router]);

  const procesarRespuesta = (correcta: boolean, feedback: string) => {
    if (correcta) {
      if (faseActual === EXAMEN_MENTAL.length - 1) {
        aprobarExamen();
      } else {
        setFaseActual(prev => prev + 1);
      }
    } else {
      // Un error = Caída al abismo.
      setMensajeError(feedback);
      setEstado('error');
      setTimeout(() => {
        setFaseActual(0);
        setEstado('preguntas');
        setMensajeError("");
      }, 5000); // Lo deja pensar en su fracaso por 5 segundos antes de reiniciar
    }
  };

  const aprobarExamen = async () => {
    setEstado('exito');
    try {
      await setDoc(doc(db, "usuarios", "comandante_starlin"), {
        examen_ciego_aprobado: true
      }, { merge: true });
    } catch (error) {
      console.error("Error guardando progreso mental:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0514] flex items-center justify-center relative overflow-hidden font-serif selection:bg-fuchsia-500/30">
      
      {/* Fondo orgánico: No hay líneas duras, solo gradientes fluidos y místicos */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-fuchsia-900/10 blur-[150px] rounded-full mix-blend-screen animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/20 blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      <div className="relative z-10 max-w-3xl w-full p-10">
        <AnimatePresence mode="wait">
          
          {/* PANTALLA DE INICIO */}
          {estado === 'inicio' && (
            <motion.div key="inicio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-slate-300">
              <EyeOff size={80} strokeWidth={1} className="mx-auto text-fuchsia-400 mb-8 opacity-80" />
              <h1 className="text-5xl text-white font-black mb-6 tracking-tight">El Umbral de la Percepción</h1>
              <p className="text-xl text-indigo-200/60 leading-relaxed mb-12 max-w-2xl mx-auto">
                Para entrar al Palacio Mental, debes demostrar que puedes ver el tablero cuando cierras los ojos. Cierra la puerta. Apaga las luces. Un solo error desmoronará la geometría en tu mente.
              </p>
              <button 
                onClick={() => setEstado('preguntas')}
                className="px-12 py-4 bg-transparent border border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-500/10 transition-colors rounded-full uppercase tracking-widest text-sm"
              >
                Cerrar los Ojos (Comenzar)
              </button>
            </motion.div>
          )}

          {/* LAS PREGUNTAS EN EL VACÍO */}
          {estado === 'preguntas' && (
            <motion.div key="preguntas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="text-center mb-16">
                <Sparkles className="mx-auto text-indigo-400/50 mb-4" size={30} />
                <h2 className="text-3xl text-indigo-100 font-light leading-relaxed">
                  {EXAMEN_MENTAL[faseActual].pregunta}
                </h2>
              </div>
              
              <div className="flex flex-col gap-6 max-w-xl mx-auto">
                {EXAMEN_MENTAL[faseActual].opciones.map((opcion) => (
                  <button 
                    key={opcion.id}
                    onClick={() => procesarRespuesta(opcion.correcta, EXAMEN_MENTAL[faseActual].feedbackError)}
                    className="p-6 text-xl text-indigo-200 bg-white/[0.01] border border-white/5 hover:border-fuchsia-500/40 hover:bg-fuchsia-900/10 transition-all rounded-2xl flex items-center justify-center"
                  >
                    {opcion.texto}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* PANTALLA DE ERROR (COLAPSO MENTAL) */}
          {estado === 'error' && (
            <motion.div key="error" initial={{ filter: "blur(10px)", opacity: 0 }} animate={{ filter: "blur(0px)", opacity: 1 }} className="text-center">
              <BrainCircuit size={80} strokeWidth={1} className="mx-auto text-rose-500 mb-8 animate-pulse" />
              <h2 className="text-4xl text-rose-500 font-bold mb-6">Visión Fragmentada</h2>
              <p className="text-2xl text-rose-300/80 leading-relaxed font-light">{mensajeError}</p>
            </motion.div>
          )}

          {/* PANTALLA DE ÉXITO */}
          {estado === 'exito' && (
            <motion.div key="exito" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <Eye size={80} strokeWidth={1} className="mx-auto text-teal-400 mb-8" />
              <h2 className="text-5xl text-white font-black mb-6">Tu mente se ha expandido.</h2>
              <p className="text-xl text-teal-200/60 leading-relaxed mb-12">
                Las coordenadas ya no son tinta sobre un tablero. Ahora son instintos en tu cabeza. Bienvenido al Palacio Mental.
              </p>
              <button 
                onClick={() => router.push('/academia/modulo/ciego')}
                className="px-12 py-4 bg-teal-900/30 border border-teal-500/50 text-teal-300 hover:bg-teal-800/40 transition-colors rounded-full uppercase tracking-widest text-sm shadow-[0_0_40px_rgba(45,212,191,0.2)]"
              >
                Entrar a la Oscuridad
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}