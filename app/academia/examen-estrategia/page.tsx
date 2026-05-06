"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../lib/motorFirebase'; // Ajusta la ruta a tu firebase.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { ShieldAlert, Crosshair, Skull, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// El Gauntlet: 3 ejercicios brutales que deben resolverse sin errores.
const EXAMEN_TACTICO = [
  { 
    fen: "r1bq2r1/b4pk1/p1pp1p2/1p2pP2/1P2P1PB/3P4/1PPQ2P1/R3K2R w KQ - 0 1", 
    solucion: "Qh6+", 
    msg: "FASE 1: ATRACCIÓN. Destruye la barrera del Rey cueste lo que cueste." 
  },
  { 
    fen: "8/2N2k2/8/8/8/8/8/3R2K1 w - - 0 1", 
    solucion: "Rd7+", 
    msg: "FASE 2: PRECISIÓN. Da el jaque exacto para arrinconar." 
  },
  { 
    fen: "1r4k1/p4ppp/8/8/2Q5/8/P4PPP/2R3K1 w - - 0 1", 
    solucion: "Qc8+", 
    msg: "FASE 3: EL DESVÍO MORTAL. El sacrificio final para la victoria." 
  }
];

export default function ExamenAdmisionPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [accesoPermitido, setAccesoPermitido] = useState<boolean | null>(null);
  const [faseActual, setFaseActual] = useState(0);
  const [mensaje, setMensaje] = useState("Iniciando Protocolo de Evaluación...");
  const [examenAprobado, setExamenAprobado] = useState(false);

  // 1. Verificación de Seguridad (¿Pasó los 15 niveles?)
  useEffect(() => {
    const verificarAcceso = async () => {
      const docSnap = await getDoc(doc(db, "usuarios", "comandante_starlin"));
      if (docSnap.exists()) {
        const completados = docSnap.data().niveles_completados || [];
        // Debe tener al menos 15 niveles completados para tomar el examen
        if (completados.length >= 15) {
          setAccesoPermitido(true);
          cargarFase(0);
        } else {
          setAccesoPermitido(false);
        }
      }
    };
    verificarAcceso();
  }, []);

  const cargarFase = (indice: number) => {
    setMensaje(EXAMEN_TACTICO[indice].msg);
    setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage({
        tipo: 'CARGAR_FEN',
        fen: EXAMEN_TACTICO[indice].fen,
        orientacion: 'white',
        draggable: true
      }, '*');
    }, 800);
  };

  // 2. Lógica del Examen (Si fallas, vuelves a cero)
  useEffect(() => {
    const handleMensaje = async (event: MessageEvent) => {
      if (event.data?.tipo === 'HUMANO_MOVIO' && !examenAprobado) {
        
        const solucionCorrecta = EXAMEN_TACTICO[faseActual].solucion;

        if (event.data.san === solucionCorrecta) {
          // Acierto
          if (faseActual === EXAMEN_TACTICO.length - 1) {
            aprobarExamen();
          } else {
            setFaseActual(prev => prev + 1);
            cargarFase(faseActual + 1);
          }
        } else {
          // ERROR: REINICIO TOTAL
          setMensaje("¡ERROR CRÍTICO! Tu cálculo falló. Reiniciando el examen...");
          setFaseActual(0);
          cargarFase(0);
        }
      }
    };
    window.addEventListener('message', handleMensaje);
    return () => window.removeEventListener('message', handleMensaje);
  }, [faseActual, examenAprobado]);

  const aprobarExamen = async () => {
    setExamenAprobado(true);
    setMensaje("¡EXAMEN SUPERADO! Acceso a Estrategia Posicional Concedido.");
    // Guardar en Firebase que ya puede entrar al nuevo módulo
    await setDoc(doc(db, "usuarios", "comandante_starlin"), {
      examen_estrategia_aprobado: true
    }, { merge: true });
  };

  // Pantalla de carga
  if (accesoPermitido === null) return <div className="h-screen bg-[#020617] text-amber-500 flex items-center justify-center font-black animate-pulse">VERIFICANDO CREDENCIALES...</div>;

  // Pantalla de Rechazo
  if (accesoPermitido === false) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-center p-8">
        <ShieldAlert size={100} className="text-rose-600 mb-6" />
        <h1 className="text-4xl font-black text-white mb-4">ACCESO DENEGADO</h1>
        <p className="text-slate-400 mb-8 max-w-md">No tienes el rango necesario para esta prueba. Completa los 15 niveles de Táctica Quirúrgica primero.</p>
        <Link href="/academia/modulo/tactica" className="px-8 py-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700">Volver a Táctica</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      <div className="h-20 border-b border-[#1E293B] bg-[#0B1121] flex items-center justify-between px-8">
        <h1 className="text-xl font-black tracking-widest text-rose-500 flex items-center gap-3">
          <Skull size={24} /> LA PRUEBA DE FUEGO
        </h1>
        <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">
          Fase {faseActual + 1} de {EXAMEN_TACTICO.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 gap-12">
        <div className="w-full max-w-md text-center lg:text-left">
          {examenAprobado ? (
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <CheckCircle size={80} className="text-emerald-500 mb-6 mx-auto lg:mx-0" />
              <h2 className="text-4xl font-black text-white mb-4">Graduación Exitosa</h2>
              <p className="text-slate-400 mb-8">Has demostrado una visión táctica impecable. Estás listo para pensar como un verdadero maestro.</p>
              <button onClick={() => router.push('/academia/modulo/estrategia')} className="w-full py-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:scale-105 transition-transform">
                ENTRAR A ESTRATEGIA POSICIONAL
              </button>
            </motion.div>
          ) : (
            <div>
              <Crosshair size={60} className="text-rose-600 mb-6 mx-auto lg:mx-0 animate-pulse" />
              <h2 className="text-3xl font-black text-white mb-6">Un error y mueres.</h2>
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
                <p className={`text-lg font-bold ${mensaje.includes('ERROR') ? 'text-rose-500' : 'text-slate-300'}`}>
                  {mensaje}
                </p>
              </div>
              <p className="text-slate-500 text-sm mt-6 font-mono">Advertencia: El motor no perdona movimientos imprecisos. Piensa antes de soltar la pieza.</p>
            </div>
          )}
        </div>

        <div className={`w-full max-w-[500px] aspect-square rounded-3xl overflow-hidden border-4 ${mensaje.includes('ERROR') ? 'border-rose-600 shadow-[0_0_50px_rgba(225,29,72,0.5)]' : 'border-[#1E293B]'} transition-all duration-300`}>
          <iframe ref={iframeRef} src="/ajedrez-motor.html" className="w-full h-full bg-transparent" />
        </div>
      </div>
    </div>
  );
}