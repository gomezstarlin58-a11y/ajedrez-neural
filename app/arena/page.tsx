"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Swords, Zap, Cpu, History, PenLine, Settings2, User, UserCheck } from 'lucide-react';

const NIVELES = [
  { id: 1, nombre: 'Novato', skill: 0, depth: 1, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 2, nombre: 'Aficionado', skill: 3, depth: 3, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 3, nombre: 'Intermedio', skill: 7, depth: 5, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 4, nombre: 'Avanzado', skill: 10, depth: 8, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { id: 5, nombre: 'Maestro', skill: 15, depth: 12, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 6, nombre: 'Gran Maestro', skill: 20, depth: 16, color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10' },
];

export default function ColiseoPage() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const stockfishRef = useRef<Worker | null>(null);
  const registroEndRef = useRef<HTMLDivElement | null>(null); 
  
  const [engineReady, setEngineReady] = useState<boolean>(false);
  
  // CONFIGURACIONES DE PARTIDA
  const [nivelActivo, setNivelActivo] = useState(NIVELES[0]);
  const [colorJugador, setColorJugador] = useState<'w' | 'b'>('w');
  
  const [registro, setRegistro] = useState<string[]>([]);
  const [inputJugada, setInputJugada] = useState<string>(""); 

  useEffect(() => {
    registroEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [registro]);

  useEffect(() => {
    let worker: Worker | null = null;
    const iniciarMotor = async () => {
      try {
        const response = await fetch("https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js");
        const texto = await response.text();
        const blob = new Blob([texto], { type: 'application/javascript' });
        worker = new Worker(URL.createObjectURL(blob));
        stockfishRef.current = worker;

        worker.onmessage = (event: MessageEvent) => {
          const line = event.data;
          if (typeof line !== "string") return;
          if (line === "uciok") {
            setEngineReady(true);
            // Configurar nivel de habilidad inicial
            worker?.postMessage(`setoption name Skill Level value ${nivelActivo.skill}`);
          } else if (line.startsWith("bestmove")) {
            const moveStr = line.split(" ")[1];
            if (moveStr && moveStr !== "(none)") {
               procesarRespuestaMotor(moveStr);
            }
          }
        };

        worker.postMessage("uci");
        worker.postMessage("isready");
      } catch (error) {
        console.error("Error al iniciar motor físico.");
      }
    };
    iniciarMotor();
    return () => { if (worker) worker.terminate(); };
  }, []);

  useEffect(() => {
    const handleMensajeIframe = (event: MessageEvent) => {
      if (!event.data) return;

      if (event.data.tipo === 'HUMANO_MOVIO') {
        const nuevoFen = event.data.fen;
        const jugada = event.data.san;

        setRegistro((prev) => [...prev, jugada]);
        
        // Poner a pensar a la máquina
        if (stockfishRef.current) {
            stockfishRef.current.postMessage(`position fen ${nuevoFen}`);
            stockfishRef.current.postMessage(`go depth ${nivelActivo.depth}`);
        }
      } 
      else if (event.data.tipo === 'MOTOR_MOVIO') {
        // La máquina contestó y el iframe ya lo aplicó
        setRegistro((prev) => [...prev, event.data.san]);
      }
      else if (event.data.tipo === 'ERROR_JUGADA') {
        alert(`Movimiento inválido: ${event.data.mensaje}`);
      }
    };

    window.addEventListener('message', handleMensajeIframe);
    return () => window.removeEventListener('message', handleMensajeIframe);
  }, [nivelActivo]);

  const procesarRespuestaMotor = async (moveStr: string) => {
      if(iframeRef.current && iframeRef.current.contentWindow) {
          // Le mandamos las coordenadas al iframe (ej: e2e4)
          iframeRef.current.contentWindow.postMessage({ tipo: 'JUGADA_MOTOR', san: moveStr }, '*');
      }
  };

  const enviarJugadaManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputJugada.trim()) return;
    
    if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
            tipo: 'JUGADA_HUMANA_TEXTO',
            san: inputJugada.trim()
        }, '*');
    }
    setInputJugada("");
  };

  const iniciarPartida = () => {
    setRegistro([]);
    
    if(iframeRef.current && iframeRef.current.contentWindow) {
       iframeRef.current.contentWindow.postMessage({ tipo: 'REINICIAR' }, '*');
       iframeRef.current.contentWindow.postMessage({ tipo: 'SET_BANDO', bando: colorJugador }, '*');
    }
    
    if (stockfishRef.current) {
        stockfishRef.current.postMessage("ucinewgame");
        stockfishRef.current.postMessage(`setoption name Skill Level value ${nivelActivo.skill}`);
        
        // Si el humano eligió Negras, Stockfish juega con Blancas y empieza de inmediato
        if (colorJugador === 'b') {
            stockfishRef.current.postMessage("position startpos");
            stockfishRef.current.postMessage(`go depth ${nivelActivo.depth}`);
        }
    }
  };

  return (
    <div className="w-full min-h-screen text-slate-200 flex flex-col gap-6 overflow-x-hidden p-2">
      
      {/* PANEL SUPERIOR DE ESTADO */}
      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0B1121]/80 border border-[#1E293B] p-4 rounded-2xl flex items-center gap-4">
          <div className={`p-3 rounded-xl bg-slate-900 border border-slate-700 ${nivelActivo.color}`}>
            <Swords size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Adversario Activo</p>
            <h3 className="font-bold text-white text-lg tracking-tight">Stockfish - {nivelActivo.nombre}</h3>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#0B1121] to-[#0f172a] border border-blue-500/30 p-4 rounded-2xl flex items-center gap-4">
           <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
              {engineReady ? <Zap size={24} /> : <Cpu size={24} className="animate-spin text-slate-500" />}
           </div>
           <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400/60">Motor Físico (WASM)</p>
              <p className="text-sm font-bold text-white">
                  {engineReady ? 'Calculando a máxima velocidad' : 'Iniciando Redes Neuronales...'}
              </p>
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 items-start">
        
        {/* PANEL CENTRAL: TABLERO */}
        <div className="lg:col-span-6 lg:order-2 flex flex-col items-center w-full gap-4">
          <div className="w-full max-w-[550px] aspect-square rounded-xl overflow-hidden shadow-2xl relative border-4 border-[#1E293B]">
            <iframe ref={iframeRef} src="/ajedrez-motor.html" width="100%" height="100%" style={{ border: 'none', backgroundColor: '#020617' }} title="Motor Ajedrez Físico" onLoad={iniciarPartida} />
          </div>
        </div>

        {/* PANEL IZQUIERDO: CONFIGURACIÓN */}
        <div className="hidden lg:flex lg:col-span-3 lg:order-1 bg-[#0B1121]/90 border border-[#1E293B] h-[600px] rounded-[2rem] p-6 flex-col shadow-2xl">
          <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-6 border-b border-[#1E293B] pb-4">
            <Settings2 size={16} className="text-blue-500"/> Configuración de Batalla
          </h4>
          
          <div className="flex-1 space-y-6">
             {/* SELECCIÓN DE COLOR */}
             <div>
                <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-3 block">1. Elige tu facción</label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setColorJugador('w')} className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${colorJugador === 'w' ? 'bg-slate-200 text-black shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'}`}>
                        <div className="w-4 h-4 rounded-full bg-white border border-slate-400"></div> Blancas
                    </button>
                    <button onClick={() => setColorJugador('b')} className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${colorJugador === 'b' ? 'bg-slate-800 text-white shadow-lg border border-slate-600' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'}`}>
                        <div className="w-4 h-4 rounded-full bg-black border border-slate-600"></div> Negras
                    </button>
                </div>
             </div>

             {/* SELECCIÓN DE DIFICULTAD */}
             <div>
                <label className="text-[10px] font-black tracking-widest text-slate-500 uppercase mb-3 block">2. Nivel de la Máquina</label>
                <div className="flex flex-col gap-2">
                    {NIVELES.map(nivel => (
                        <button 
                          key={nivel.id} 
                          onClick={() => setNivelActivo(nivel)}
                          className={`px-4 py-3 rounded-xl flex items-center justify-between text-sm transition-all border ${nivelActivo.id === nivel.id ? `${nivel.bg} ${nivel.color} border-current shadow-lg` : 'bg-transparent border-[#1E293B] text-slate-400 hover:bg-white/5'}`}
                        >
                            <span className="font-bold">{nivel.nombre}</span>
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Lvl {nivel.id}</span>
                        </button>
                    ))}
                </div>
             </div>
          </div>

          <button onClick={iniciarPartida} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)] mt-4">
             Iniciar Combate
          </button>
        </div>

        {/* PANEL DERECHO: PLANILLA */}
        <div className="hidden lg:flex lg:col-span-3 lg:order-3 bg-[#0B1121]/90 border border-[#1E293B] h-[600px] rounded-[2rem] p-6 flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-4 border-b border-[#1E293B] pb-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <History size={16} className="text-blue-500"/> Planilla Oficial
              </h4>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2 text-sm font-mono text-slate-400 pr-2 scrollbar-thin scrollbar-thumb-[#1E293B]">
            {registro.reduce((result: string[][], move: string, index: number) => {
              if (index % 2 === 0) result.push([move]);
              else result[result.length - 1].push(move);
              return result;
            }, []).map((pair, i) => (
              <div key={i} className="flex justify-between border-b border-slate-800/50 py-2 bg-slate-900/20 px-2 rounded hover:bg-slate-800/40 transition-colors">
                <span className="text-slate-600 font-black w-8">{i + 1}.</span>
                <span className={`flex-1 text-center font-bold ${colorJugador === 'w' ? 'text-emerald-400' : 'text-rose-400'}`}>{pair[0]}</span>
                <span className={`flex-1 text-center font-bold ${colorJugador === 'w' ? 'text-rose-400' : 'text-emerald-400'}`}>{pair[1] || ''}</span>
              </div>
            ))}
            <div ref={registroEndRef} />
          </div>

          <div className="mt-4 pt-4 border-t border-[#1E293B]">
            <form onSubmit={enviarJugadaManual} className="flex flex-col gap-3">
              <label className="text-[10px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
                <PenLine size={12} /> Movimiento por Teclado
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={inputJugada}
                  onChange={(e) => setInputJugada(e.target.value)}
                  placeholder="Ej: e4, Cf3..." 
                  className="flex-1 bg-[#020617] border border-slate-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                  autoComplete="off"
                />
                <button type="submit" className="bg-blue-600 text-white px-5 rounded-lg font-black tracking-wider hover:bg-blue-500 transition-colors active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                  IR
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}