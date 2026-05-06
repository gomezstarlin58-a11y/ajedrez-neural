"use client";
import React, { useState, useEffect, useRef, use } from 'react';
import { db } from '../../../lib/motorFirebase';
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, ArrowLeft, Bot, Swords, Eye, Play, Pause, RotateCcw, ScrollText, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Chess } from 'chess.js';

const comentariosGenericos = [
  "Analizando la tensión en el centro del tablero...",
  "Desarrollo de piezas. Preparando el medio juego.",
  "Evaluando estructuras de peones y posibles rupturas.",
  "Calculando líneas de profundidad táctica...",
  "Maniobra posicional. Reubicando piezas a casillas clave.",
  "Buscando debilidades en la defensa enemiga...",
  "Posición sólida. Las máquinas evalúan igualdad temporal."
];

export default function PartidaEpicaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const partidaId = resolvedParams.id;
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [partida, setPartida] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  
  const [modo, setModo] = useState<'observacion' | 'combate'>('observacion');
  const [iframeCargado, setIframeCargado] = useState(false);
  
  const [movimientos, setMovimientos] = useState<string[]>([]);
  const [fens, setFens] = useState<string[]>([]);
  const [jugadaActual, setJugadaActual] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(false);
  
  const [comentarioIA, setComentarioIA] = useState("Esperando que comience la batalla histórica...");
  const [escribiendo, setEscribiendo] = useState(false);

  useEffect(() => {
    const cargarPartida = async () => {
      try {
        const docSnap = await getDoc(doc(db, "partidas_epicas", partidaId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPartida(data);
          
          if (data.pgn) {
            const ajedrez = new Chess();
            try {
                // 🔥 AQUÍ ESTÁ LA CORRECCIÓN: load_pgn en lugar de loadPgn 🔥
                ajedrez.load_pgn(data.pgn);
                
                const historial = ajedrez.history(); 
                const tableroVirtual = new Chess();
                
                const arrayMovimientos: string[] = [];
                const arrayFens: string[] = [];
                
                for (let move of historial) {
                    tableroVirtual.move(move);
                    arrayMovimientos.push(move);
                    arrayFens.push(tableroVirtual.fen());
                }
                
                setMovimientos(arrayMovimientos);
                setFens(arrayFens);

            } catch (err) {
                console.error("El PGN de la base de datos es inválido o tiene jugadas ilegales:", err);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };
    cargarPartida();
  }, [partidaId]);

  // MOTOR DE REPRODUCCIÓN BLINDADO
  useEffect(() => {
    let intervalo: NodeJS.Timeout;
    if (modo === 'observacion' && reproduciendo && iframeCargado) {
      intervalo = setInterval(() => {
        if (jugadaActual < fens.length) {
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ 
              tipo: 'CARGAR_FEN', 
              fen: fens[jugadaActual] 
            }, '*');
          }
          setJugadaActual(prev => prev + 1);
        } else {
          setReproduciendo(false); 
          setComentarioIA("La historia se ha escrito. Fin de la transmisión.");
        }
      }, 2500); 
    }
    return () => clearInterval(intervalo);
  }, [modo, reproduciendo, iframeCargado, jugadaActual, fens]);

  // CEREBRO IA
  useEffect(() => {
    if (!partida || modo === 'combate') return;
    if (jugadaActual === 0) {
      setComentarioIA(`Bienvenidos a la transmisión histórica de: ${partida.titulo}. Haz clic en PLAY para comenzar.`);
      return;
    }

    setEscribiendo(true); 
    
    const timerIA = setTimeout(() => {
      const claveJugada = jugadaActual.toString();
      if (partida.comentarios && partida.comentarios[claveJugada]) {
        setComentarioIA("🔥 " + partida.comentarios[claveJugada]);
      } else {
        const generico = comentariosGenericos[jugadaActual % comentariosGenericos.length];
        setComentarioIA("🤖 " + generico);
      }
      setEscribiendo(false); 
    }, 600); 

    return () => clearTimeout(timerIA);
  }, [jugadaActual, partida, modo]);

  const handleIframeLoad = () => {
    setIframeCargado(true);
    reiniciarTablero();
  };

  const reiniciarTablero = () => {
    setJugadaActual(0);
    setReproduciendo(false);
    if (iframeRef.current?.contentWindow && partida) {
      iframeRef.current.contentWindow.postMessage({ tipo: 'CARGAR_FEN', fen: partida.fen || 'start' }, '*');
    }
  };

  const cambiarModo = (nuevoModo: 'observacion' | 'combate') => {
    setModo(nuevoModo);
    setJugadaActual(0);
    setReproduciendo(false);
    if (iframeRef.current) {
        iframeRef.current.src = `/ajedrez-motor.html?modo=${nuevoModo === 'observacion' ? 'libre' : 'ia'}`;
    }
  };

  if (cargando) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-yellow-500 font-black animate-pulse"><Loader2 className="animate-spin mr-2" size={30}/> RECUPERANDO ARCHIVOS HISTÓRICOS...</div>;
  if (!partida) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-red-500 font-black">ARCHIVOS CORRUPTOS O NO ENCONTRADOS</div>;

  return (
    <div className="h-screen bg-[#020617] text-slate-200 p-4 md:p-6 flex flex-col relative overflow-hidden">
      
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <button onClick={() => router.push('/epicas')} className="w-fit shrink-0 flex items-center gap-2 text-slate-400 hover:text-yellow-500 font-bold uppercase text-xs transition-colors mb-4 relative z-10">
        <ArrowLeft size={16}/> Volver a la Galería
      </button>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 min-h-0">
        
        <div className="lg:col-span-3 flex flex-col gap-4 h-full min-h-0">
          <div className="bg-gradient-to-b from-[#1a1405] to-[#0B1121] border border-yellow-900/30 p-6 rounded-3xl shadow-2xl flex-1 flex flex-col min-h-0">
            <h3 className="text-yellow-600 shrink-0 font-black tracking-[0.3em] uppercase text-[10px] mb-2 flex items-center gap-2"><ScrollText size={14}/> Archivo Épico</h3>
            <h1 className="text-2xl shrink-0 font-black text-white leading-none tracking-tighter mb-4">{partida.titulo}</h1>
            
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-900/50">
                <p className="text-slate-400 text-sm leading-relaxed text-justify">{partida.historia}</p>
            </div>
          </div>

          <div className="bg-[#0B1121] border border-slate-800 p-4 rounded-3xl shrink-0">
            <div className="flex gap-2 mb-4">
                <button onClick={() => cambiarModo('observacion')} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl font-bold uppercase tracking-widest text-[9px] transition-all ${modo === 'observacion' ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-transparent text-slate-500 hover:bg-slate-900'}`}>
                <Eye size={16}/> Modo Análisis
                </button>
                <button onClick={() => cambiarModo('combate')} className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 rounded-2xl font-bold uppercase tracking-widest text-[9px] transition-all ${modo === 'combate' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-transparent text-slate-500 hover:bg-slate-900'}`}>
                <Swords size={16}/> Jugar Partida
                </button>
            </div>

            <AnimatePresence mode="wait">
                {modo === 'observacion' ? (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl">
                    <div className="flex justify-center gap-4 mb-4">
                    <button onClick={reiniciarTablero} className="bg-slate-800 p-3 rounded-full text-slate-400 hover:text-white transition-colors" title="Reiniciar"><RotateCcw size={18}/></button>
                    <button onClick={() => setReproduciendo(!reproduciendo)} className={`p-3 rounded-full text-black transition-all shadow-lg ${reproduciendo ? 'bg-amber-500' : 'bg-emerald-500 hover:bg-emerald-400'}`}>
                        {reproduciendo ? <Pause fill="currentColor" size={20}/> : <Play fill="currentColor" size={20}/>}
                    </button>
                    </div>
                    <div>
                        <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-1">
                            <span>Progreso</span>
                            <span>{jugadaActual} / {movimientos.length}</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-yellow-500 h-full transition-all duration-300" style={{ width: `${movimientos.length > 0 ? (jugadaActual / movimientos.length) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                </motion.div>
                ) : (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="bg-red-950/20 border border-red-900/30 p-4 rounded-2xl text-center">
                    <h3 className="text-red-500 font-black uppercase tracking-widest text-[10px] mb-1">Alerta de Combate</h3>
                    <p className="text-slate-400 text-[10px]">Stockfish activado al máximo nivel. Sobrevive a la historia.</p>
                </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-6 flex items-center justify-center h-full min-h-0">
          <div className={`w-full max-w-[650px] aspect-square rounded-2xl overflow-hidden border-4 shadow-2xl transition-colors duration-500 flex-shrink-0 ${modo === 'combate' ? 'border-red-900/50 shadow-red-900/20' : 'border-yellow-900/30 shadow-yellow-900/10'}`}>
            <iframe 
                ref={iframeRef} 
                src={`/ajedrez-motor.html?modo=libre`} 
                onLoad={handleIframeLoad} 
                width="100%" 
                height="100%" 
                style={{ border: 'none', display: 'block' }} 
            />
          </div>
        </div>

        <div className="lg:col-span-3 h-full flex flex-col min-h-0">
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/20 p-6 rounded-3xl shadow-2xl flex-1 flex flex-col relative overflow-hidden min-h-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-[pulse_2s_infinite]"></div>
            
            <div className="shrink-0 flex items-center gap-3 mb-6 border-b border-indigo-500/20 pb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                <Bot size={20} className="text-indigo-400"/>
              </div>
              <div>
                <h3 className="text-indigo-400 font-black uppercase tracking-widest text-xs">Gemini AI</h3>
                <p className="text-slate-500 text-[9px] font-mono uppercase flex items-center gap-1"><Sparkles size={10}/> Transmisión En Vivo</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col justify-center">
              {modo === 'combate' ? (
                <p className="text-slate-400 italic text-sm text-center">Análisis táctico desactivado en Modo Combate. Confía en tu instinto, Comandante.</p>
              ) : (
                <div className="bg-black/40 border border-indigo-500/10 p-5 rounded-2xl relative min-h-[120px] flex items-center">
                  <span className="absolute -top-4 -left-2 text-6xl text-indigo-500/20 font-serif">"</span>
                  {escribiendo ? (
                     <div className="flex items-center gap-2 text-indigo-400 font-mono text-sm relative z-10 w-full justify-center">
                         <Loader2 className="animate-spin" size={16}/> Analizando...
                     </div>
                  ) : (
                     <p className="text-indigo-100 text-sm leading-relaxed relative z-10 font-medium">
                        {comentarioIA}
                     </p>
                  )}
                </div>
              )}
            </div>

            {modo === 'observacion' && jugadaActual > 0 && movimientos.length > 0 && (
              <div className="shrink-0 mt-6 text-center bg-indigo-950/30 py-3 rounded-xl border border-indigo-500/20">
                <p className="text-[9px] text-indigo-300 font-mono uppercase tracking-widest mb-1">Último Movimiento</p>
                <p className="text-2xl font-black text-white tracking-widest">{movimientos[jugadaActual - 1]}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}