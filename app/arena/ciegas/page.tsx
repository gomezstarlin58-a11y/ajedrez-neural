"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Chess } from 'chess.js';
import { Terminal, EyeOff, Radio, Brain, Target, MessageSquare } from 'lucide-react';

const Chessboard = dynamic(
  () => import('react-chessboard').then((mod) => mod.Chessboard),
  { ssr: false }
);

export default function EntrenamientoCiegoPage() {
  const [game, setGame] = useState(new Chess());
  const [gameFen, setGameFen] = useState(game.fen()); 
  const [comando, setComando] = useState("");
  const [radarActivo, setRadarActivo] = useState(false);
  const [energia, setEnergia] = useState(100);
  
  const [logs, setLogs] = useState([
    { tipo: 'sistema', texto: "[SISTEMA] Matriz de Privación Sensorial Calibrada." },
    { tipo: 'oraculo', texto: "[ORÁCULO] Usa la terminal inferior para ingresar tus comandos. No busques las piezas visualmente." }
  ]);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const procesarComando = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comando.trim()) return;

    const jugada = comando.trim();
    setComando("");

    try {
      const move = game.move(jugada);

      if (move) {
        setGameFen(game.fen()); 
        setLogs(prev => [...prev, 
          { tipo: 'usuario', texto: `> Ejecutando: ${jugada}` },
          { tipo: 'exito', texto: `[MATRIZ] Jugada aceptada. Sincronizando red...` }
        ]);

        setTimeout(() => {
           const posiblesMoves = game.moves({ verbose: true });
           if(posiblesMoves.length > 0 && !game.isGameOver()) {
             const randomMove = posiblesMoves[Math.floor(Math.random() * posiblesMoves.length)];
             game.move(randomMove);
             
             setGameFen(game.fen()); 

             setLogs(prev => [...prev, { tipo: 'enemigo', texto: `[ANOMALÍA] El enemigo ha respondido: ${randomMove.san}. Tu turno Comandante.` }]);
           }
           
           if(game.isGameOver()) {
             setLogs(prev => [...prev, { tipo: 'alerta', texto: `[FIN] Simulación terminada. Resultado: ${game.isCheckmate() ? 'Jaque Mate' : 'Tablas'}` }]);
           }
        }, 1100);

      }
    } catch (error) {
      setLogs(prev => [...prev, 
        { tipo: 'usuario', texto: `> Ejecutando: ${jugada}` },
        { tipo: 'error', texto: `[ERROR] Movimiento inválido o sintaxis incorrecta. Revisa tu cálculo.` }
      ]);
    }
  };

  const activarRadar = () => {
    if (energia >= 30 && !radarActivo) {
      setEnergia(prev => prev - 30);
      setRadarActivo(true);
      setLogs(prev => [...prev, { tipo: 'alerta', texto: `[RADAR] Pulso electromagnético emitido. Revelando matriz por 1.2 segundos...` }]);
      
      setTimeout(() => {
        setRadarActivo(false);
      }, 1200);
    } else if (energia < 30) {
      setLogs(prev => [...prev, { tipo: 'error', texto: `[SISTEMA] Energía neural insuficiente.` }]);
    }
  };

  const opcionesTablero: any = {
    position: gameFen, 
    arePiecesDraggable: false, 
    customDarkSquareStyle: { backgroundColor: '#0B1121', border: '1px solid rgba(30, 41, 59, 0.3)' },
    customLightSquareStyle: { backgroundColor: '#1E293B', border: '1px solid rgba(30, 41, 59, 0.3)' },
    animationDuration: 250
  };

  return (
    <div className="w-full min-h-screen text-slate-200 flex flex-col gap-8 relative overflow-hidden">
      
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full flex justify-between items-center z-10 border-b border-[#1E293B] pb-6 mt-6">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-3 rounded-2xl border border-cyan-500/30 text-cyan-400">
            <EyeOff size={28} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Cámara de Privación Sensorial</h1>
            <p className="text-slate-400 mt-1">Simulación de Nivel 5: Entrenamiento Visual-Espacial Puro</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 z-10 flex-1">
        
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-3 space-y-6">
          <div className="bg-[#0B1121] border border-[#1E293B] p-6 rounded-3xl shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-16 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full shadow-[0_0_15px_cyan]"></div>
             
             <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Brain className="text-cyan-400" /> Teoría del Entrenamiento
             </h3>
             <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
               <p>
                 <strong className="text-white">Para qué sirve:</strong> Desactiva la entrada sensorial directa (visión) para forzar al cerebro a construir el tablero en la corteza visual y parietal.
               </p>
               <ul className="list-disc pl-5 space-y-2 text-slate-400">
                  <li>Forja la Memoria Cortical a corto plazo.</li>
                  <li>Mejora la Geometría Profunda (cálculo de líneas).</li>
                  <li>Reduce la dependencia de la 'vista' y aumenta la 'intuición'.</li>
               </ul>
               <p className="text-xs text-slate-500 mt-4 font-mono">"No juegues con lo que ves; juega con lo que sabes que está ahí."</p>
             </div>
          </div>
        </motion.div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="lg:col-span-6 flex flex-col items-center gap-6 justify-center">
          <div className="relative p-2 bg-[#020617] rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-[#1E293B]">
            
            <AnimatePresence>
            {!radarActivo && (
               <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-[#0B1121]/95 backdrop-blur-[2px] rounded-xl z-30 flex items-center justify-center border border-cyan-500/20">
                    <div className="text-center text-cyan-400 flex flex-col items-center gap-3">
                        <Target className="animate-pulse" size={40}/>
                        <p className="font-bold tracking-widest text-lg">MATRIZ SELLADA</p>
                        <p className="text-xs text-slate-500 max-w-xs">Usa la consola para mover. Memoriza el rastro.</p>
                    </div>
               </motion.div>
            )}
            </AnimatePresence>
            
            <div className="w-full max-w-[550px] aspect-square rounded overflow-hidden relative z-10 border-4 border-[#1E293B]">
              <div className={`w-full h-full transition-all duration-300 ${
                  radarActivo 
                  ? '[&_svg]:opacity-100 [&_svg]:drop-shadow-[0_0_10px_cyan] [&_svg]:hue-rotate-[180deg]' 
                  : '[&_.piece]:opacity-0 pointer-events-none'
                }`}>
                <Chessboard options={opcionesTablero} />
              </div>
            </div>
          </div>

          <button 
            onClick={activarRadar}
            className={`flex items-center gap-2 px-8 py-3 rounded-full border ${
              energia >= 30 ? 'bg-cyan-600 text-[#020617] border-cyan-500 hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)] font-bold' : 'border-slate-800 text-slate-700 cursor-not-allowed bg-transparent'
            } uppercase text-xs font-bold tracking-widest`}
          >
            <Radio size={16} /> Ping de Radar Neural (-30 Neural Energy)
          </button>
        </motion.div>

        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="lg:col-span-3 flex-1 flex flex-col">
          <div className="bg-[#0B1121]/90 backdrop-blur-xl border border-[#1E293B] h-[450px] lg:h-[550px] rounded-[2rem] p-6 flex flex-col shadow-2xl relative overflow-hidden">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-[#1E293B] pb-4">
              <Terminal size={16} className="text-blue-500" /> Consola de Entrada Cuántica
            </h4>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 custom-scrollbar pr-2 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className={`${
                  log.tipo === 'error' ? 'text-rose-400' : 
                  log.tipo === 'usuario' ? 'text-white' : 
                  log.tipo === 'alerta' ? 'text-amber-400' :
                  log.tipo === 'enemigo' ? 'text-cyan-400' :
                  'text-slate-400'
                }`}>
                  {log.texto}
                </div>
              ))}
              <div ref={endOfMessagesRef} />
            </div>

            <form onSubmit={procesarComando} className="flex items-center gap-2 border border-[#1E293B] bg-[#020617] p-2 rounded-xl">
              <span className="text-cyan-400 font-bold font-mono text-sm">{`~#`}</span>
              <input 
                type="text" 
                value={comando}
                onChange={(e) => setComando(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder-slate-700 font-mono text-sm"
                placeholder="Ingresa jugada (Ej: e4, Nf3, O-O)..."
                autoFocus
                autoComplete="off"
              />
            </form>
          </div>
        </motion.div>

      </div>
    </div>
  );
}