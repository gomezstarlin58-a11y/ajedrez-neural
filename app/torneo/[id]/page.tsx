"use client";
import React, { useState, useEffect, useRef, use } from 'react';
import { db } from '../../../lib/motorFirebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { Sword, History, PenLine, Loader2, Crown, ShieldAlert, FileText, GraduationCap, ArrowLeft, Eye } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ArenaPVPPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const salaId = resolvedParams.id;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const registroEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  
  const searchParams = useSearchParams();
  const isObserver = searchParams.get('mode') === 'observer';

  const [sala, setSala] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [miBando, setMiBando] = useState<'w' | 'b' | 'espectador' | null>('espectador'); 
  const [inputJugada, setInputJugada] = useState("");
  const [miNombre, setMiNombre] = useState("");
  
  // 🔥 NUEVO ESTADO: Autoridad del Profesor 🔥
  const [esProfesor, setEsProfesor] = useState(false);

  useEffect(() => {
    let nombre = localStorage.getItem("user_name");
    let rol = localStorage.getItem("user_role");
    
    if (!nombre) {
      nombre = "Recluta_" + Math.floor(Math.random() * 10000);
      localStorage.setItem("user_name", nombre);
    }
    setMiNombre(nombre);
    
    // Si tiene rango profesor, lo guardamos para darle poderes absolutos
    if (rol === 'profesor') {
      setEsProfesor(true);
    }

    const docRef = doc(db, "torneos_pvp", salaId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSala(data);
        
        let bandoAsignado: 'w' | 'b' | 'espectador' = 'espectador';
        if (data.jugador_blancas === nombre) bandoAsignado = 'w';
        else if (data.jugador_negras === nombre) bandoAsignado = 'b';
        
        if (isObserver) bandoAsignado = 'espectador';
        
        setMiBando(bandoAsignado);

        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({ tipo: 'CARGAR_FEN', fen: data.fen_actual || 'start' }, '*');
          iframeRef.current.contentWindow.postMessage({ tipo: 'SET_BANDO', bando: bandoAsignado }, '*');
        }
      } else {
        setSala(null);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, [salaId, isObserver]);

  useEffect(() => {
    registroEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sala?.historial_jugadas]);

  const unirseAlBando = async (bando: 'w' | 'b') => {
    if (!miNombre || isObserver) return;
    const docRef = doc(db, "torneos_pvp", salaId);
    const campo = bando === 'w' ? 'jugador_blancas' : 'jugador_negras';
    await updateDoc(docRef, { [campo]: miNombre, estado: 'en_curso' });
    setMiBando(bando);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ tipo: 'SET_BANDO', bando: bando }, '*');
    }
  };

  const enviarJugadaManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputJugada.trim() || miBando === 'espectador') return;
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ tipo: 'JUGADA_HUMANA_TEXTO', san: inputJugada.trim() }, '*');
    }
    setInputJugada("");
  };

  useEffect(() => {
    const handleMotor = async (event: MessageEvent) => {
      if (event.data?.tipo === 'HUMANO_MOVIO' && miBando !== 'espectador') {
        const docRef = doc(db, "torneos_pvp", salaId);
        await updateDoc(docRef, { fen_actual: event.data.fen, historial_jugadas: arrayUnion(event.data.san), ultimo_movimiento: Date.now() });
      }
    };
    window.addEventListener('message', handleMotor);
    return () => window.removeEventListener('message', handleMotor);
  }, [salaId, miBando]);

  // 🔥 FUNCIÓN DE AUTORIDAD: Finaliza y abre planilla 🔥
  const abrirPlanillaOficial = async () => {
    if (sala.estado !== 'finalizado') {
      await updateDoc(doc(db, "torneos_pvp", salaId), { estado: 'finalizado' });
    }
    window.open(`/torneo/${salaId}/planilla`, '_blank');
  };

  const handleIframeLoad = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ tipo: 'SET_BANDO', bando: miBando }, '*');
      if (sala?.fen_actual) {
        iframeRef.current.contentWindow.postMessage({ tipo: 'CARGAR_FEN', fen: sala.fen_actual }, '*');
      }
    }
  };

  if (cargando) return <div className="h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-black animate-pulse"><Loader2 className="animate-spin mb-2" size={30}/> SINCRONIZANDO CON LA RED NEURAL...</div>;
  if (!sala) return <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-rose-500 font-black"><ShieldAlert size={60} className="mb-4" /> ERROR 404: LA SALA FUE DESTRUIDA O NO EXISTE</div>;

  return (
    <div className="w-full min-h-screen bg-[#020617] text-slate-200 p-6 flex flex-col gap-6 relative">
      
      {sala.torneoId && (
        <button onClick={()=>router.push(`/lobby/${sala.torneoId}`)} className="w-fit flex items-center gap-2 text-slate-400 hover:text-white font-bold uppercase text-xs transition-colors">
          <ArrowLeft size={16}/> Volver al Menú del Torneo
        </button>
      )}

      {isObserver && !esProfesor && (
        <div className="bg-blue-600/20 border border-blue-500 text-blue-400 px-4 py-2 rounded-xl flex items-center gap-2 font-bold uppercase text-xs justify-center w-full">
          <Eye size={16}/> Modo Observador Público Activado (Solo Lectura)
        </div>
      )}

      {esProfesor && (
        <div className="bg-rose-600/20 border border-rose-500 text-rose-400 px-4 py-2 rounded-xl flex items-center gap-2 font-bold uppercase text-xs justify-center w-full">
          <GraduationCap size={16}/> Autoridad Docente Reconocida
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-2xl border ${miBando === 'w' ? 'bg-white/10 border-white/20' : 'bg-slate-900/50 border-slate-800'}`}>
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Blancas</p>
          <p className="font-black text-white">{sala.jugador_blancas}</p>
          {sala.jugador_blancas === 'Esperando...' && miBando === 'espectador' && !isObserver && <button onClick={() => unirseAlBando('w')} className="mt-2 text-xs bg-emerald-600 px-3 py-1 rounded-lg font-bold transition-colors">Tomar Mando</button>}
          </div>
          <div className="bg-[#0B1121] border border-rose-500/20 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">{sala.torneo}</h2>
          <p className="text-[10px] text-rose-400 font-bold tracking-[0.3em] uppercase mt-1">Cursos: {sala.cursos_participantes} | Liga {sala.liga}</p>
          </div>
          <div className={`p-4 rounded-2xl border ${miBando === 'b' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-slate-900/50 border-slate-800'}`}>
          <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">Negras</p>
          <p className="font-black text-white">{sala.jugador_negras}</p>
          {sala.jugador_negras === 'Esperando...' && miBando === 'espectador' && !isObserver && <button onClick={() => unirseAlBando('b')} className="mt-2 text-xs bg-rose-600 px-3 py-1 rounded-lg font-bold transition-colors">Tomar Mando</button>}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="hidden lg:flex lg:col-span-3 bg-[#0B1121] border border-[#1E293B] h-[600px] rounded-[2rem] p-6 flex-col shadow-2xl">
              <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 mb-4 border-b border-[#1E293B] pb-4">
                  <History size={16} className="text-rose-500"/> Registro de Movimientos
              </h4>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 font-mono text-sm scrollbar-thin scrollbar-thumb-slate-800">
                  {sala.historial_jugadas?.reduce((result: any[], move: string, index: number) => {
                  if (index % 2 === 0) result.push([move]);
                  else result[result.length - 1].push(move);
                  return result;
                  }, []).map((pair: any, i: number) => (
                  <div key={i} className="flex justify-between border-b border-slate-800/50 py-2 px-2 bg-slate-900/40 rounded transition-colors hover:bg-slate-800">
                      <span className="text-slate-600 w-8">{i + 1}.</span>
                      <span className="flex-1 text-center font-bold text-emerald-400">{pair[0]}</span>
                      <span className="flex-1 text-center font-bold text-rose-400">{pair[1] || '---'}</span>
                  </div>
                  ))}
                  <div ref={registroEndRef} />
              </div>
              <div className="mt-4 pt-4 border-t border-[#1E293B]">
                  <form onSubmit={enviarJugadaManual} className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <PenLine size={12} /> {miBando === 'espectador' ? 'Modo Árbitro / Lector' : 'Registrar Jugada'}
                  </label>
                  <div className="flex gap-2">
                      <input disabled={miBando === 'espectador' || sala.estado === 'finalizado'} type="text" value={inputJugada} onChange={(e) => setInputJugada(e.target.value)} placeholder={miBando === 'espectador' ? "Solo lectura" : "Ej: e4, Cf3..."} className="flex-1 bg-[#020617] border border-slate-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-rose-500 disabled:opacity-50 transition-colors" />
                      <button type="submit" disabled={miBando === 'espectador' || sala.estado === 'finalizado'} className="bg-rose-600 text-white px-5 rounded-lg font-black hover:bg-rose-500 disabled:opacity-50 transition-colors">IR</button>
                  </div>
                  </form>
              </div>
          </div>

          <div className="lg:col-span-6 flex justify-center relative">
              <div className="w-full max-w-[550px] aspect-square rounded-2xl overflow-hidden border-4 border-[#1E293B] shadow-[0_0_60px_rgba(239,68,68,0.1)] relative">
                  <iframe ref={iframeRef} src={`/ajedrez-motor.html?modo=${isObserver && !esProfesor ? 'torneo' : 'libre'}`} onLoad={handleIframeLoad} width="100%" height="100%" style={{ border: 'none' }} />
                  
                  {sala.estado === 'finalizado' && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 z-10">
                      <Crown size={60} className="text-amber-500 mb-4" />
                      <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Combate Finalizado</h2>
                      <p className="text-rose-400 font-mono text-sm border border-rose-500/30 bg-rose-500/10 px-4 py-2 rounded-lg">El Árbitro ha sellado el resultado de esta mesa.</p>
                  </div>
                  )}
              </div>
          </div>

          <div className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            
            {/* 🔥 PANEL EXCLUSIVO DEL PROFESOR 🔥 */}
            {esProfesor && (
                <div className="bg-gradient-to-b from-rose-950/30 to-[#0B1121] border border-rose-500/40 p-6 rounded-[2rem] shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                    <h4 className="text-xs font-bold text-rose-400 uppercase mb-4 flex items-center gap-2 tracking-widest"><GraduationCap size={16}/> Autoridad Docente</h4>
                    <p className="text-sm text-slate-300 mb-6 font-serif">Puedes finalizar el combate en cualquier momento para generar la evaluación legal.</p>
                    <button onClick={abrirPlanillaOficial} className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-rose-500/20">
                        <FileText size={20}/> {sala.estado === 'finalizado' ? 'Abrir Planilla' : 'Finalizar y Evaluar'}
                    </button>
                </div>
            )}

            {/* 🔥 PANEL PARA LOS ALUMNOS (SOLO APARECE CUANDO EL PROFE FINALIZA) 🔥 */}
            {(!esProfesor && sala.estado === 'finalizado') && (
                <div className="bg-gradient-to-b from-blue-950/30 to-[#0B1121] border border-blue-500/40 p-6 rounded-[2rem] shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                    <h4 className="text-xs font-bold text-blue-400 uppercase mb-4 flex items-center gap-2 tracking-widest"><FileText size={16}/> Documento Oficial</h4>
                    <p className="text-sm text-slate-300 mb-6 font-serif">El árbitro ha finalizado la partida. Puedes revisar tu documento de evaluación y firmar tu resultado.</p>
                    <button onClick={() => window.open(`/torneo/${salaId}/planilla`, '_blank')} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg">
                        Ver Evaluación
                    </button>
                </div>
            )}

          </div>
      </div>
    </div>
  );
}