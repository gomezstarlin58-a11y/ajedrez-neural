"use client";
import React, { useState, useEffect, use } from 'react';
import { db } from '../../../lib/motorFirebase';
import { collection, onSnapshot, query, where, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { Trophy, Sword, Eye, Loader2, Activity, FileText, LayoutDashboard, ArrowRight, Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LobbyTorneoPage({ params }: { params: Promise<{ torneoId: string }> }) {
  const resolvedParams = use(params);
  const torneoId = resolvedParams.torneoId;
  const router = useRouter();

  const [torneo, setTorneo] = useState<any>(null);
  const [partidas, setPartidas] = useState<any[]>([]);
  const [ranking, setRanking] = useState<any[]>([]);
  const [miNombre, setMiNombre] = useState("");
  const [miRol, setMiRol] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const nombre = localStorage.getItem("user_name") || "Recluta_" + Math.floor(Math.random()*1000);
    const rol = localStorage.getItem("user_role") || "alumno";
    setMiNombre(nombre);
    setMiRol(rol);

    const unsubTorneo = onSnapshot(doc(db, "torneos_globales", torneoId), (snap) => {
      if (snap.exists()) setTorneo({ id: snap.id, ...snap.data() });
    });

    const q = query(collection(db, "torneos_pvp"), where("torneoId", "==", torneoId));
    const unsubPartidas = onSnapshot(q, (snap) => {
      const parts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPartidas(parts);
      
      const jugadoresMap: any = {};
      
      parts.forEach((p: any) => {
          if (p.jugador_blancas && p.jugador_blancas !== 'Esperando...') {
              if (!jugadoresMap[p.jugador_blancas]) jugadoresMap[p.jugador_blancas] = { nombre: p.jugador_blancas, puntos: 0, partidas: 0 };
              if (p.estado === 'finalizado' && p.evaluacion?.notaBlancas) {
                  jugadoresMap[p.jugador_blancas].puntos += Number(p.evaluacion.notaBlancas);
                  jugadoresMap[p.jugador_blancas].partidas += 1;
              }
          }
          if (p.jugador_negras && p.jugador_negras !== 'Esperando...') {
              if (!jugadoresMap[p.jugador_negras]) jugadoresMap[p.jugador_negras] = { nombre: p.jugador_negras, puntos: 0, partidas: 0 };
              if (p.estado === 'finalizado' && p.evaluacion?.notaNegras) {
                  jugadoresMap[p.jugador_negras].puntos += Number(p.evaluacion.notaNegras);
                  jugadoresMap[p.jugador_negras].partidas += 1;
              }
          }
      });
      const rankingArray = Object.values(jugadoresMap).sort((a: any, b: any) => b.puntos - a.puntos);
      setRanking(rankingArray);
      setCargando(false);
    });

    return () => { unsubTorneo(); unsubPartidas(); };
  }, [torneoId]);

  const crearMesaDeCombate = async () => {
    // Evitamos crear mesas si el torneo ya cerró
    if (torneo?.estado === 'clausurado') return alert("Este torneo ya ha sido clausurado oficialmente por el Profesor.");

    const activas = partidas.filter(p => p.estado === 'en_curso' || p.estado === 'esperando_jugadores').length;
    if (activas >= 4) return alert("Comandante, todos los frentes de batalla están ocupados (Max 4). Espere a que termine una partida.");

    const docRef = await addDoc(collection(db, "torneos_pvp"), {
      torneoId: torneoId, torneo: torneo.nombre, liga: torneo.liga, cursos_participantes: torneo.cursos_participantes,
      jugador_blancas: miNombre, jugador_negras: 'Esperando...', estado: 'esperando_jugadores', fen_actual: 'start',
      historial_jugadas: [], fecha_creacion: serverTimestamp()
    });
    router.push(`/torneo/${docRef.id}`);
  };

  if (cargando) return <div className="h-screen bg-[#020617] flex items-center justify-center text-emerald-500 font-black animate-pulse"><Loader2 className="animate-spin mr-2"/> SINCRONIZANDO NEXUS...</div>;
  if (!torneo) return <div className="h-screen bg-[#020617] text-rose-500 flex items-center justify-center font-black">TORNEO INEXISTENTE</div>;

  return (
    <div className="w-full min-h-screen bg-[#020617] text-slate-200 p-8 flex flex-col gap-8">
      
      <div className="bg-gradient-to-r from-[#0B1121] to-[#020617] border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10"><LayoutDashboard size={120}/></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">{torneo.nombre}</h1>
            <p className="text-emerald-500 font-bold tracking-[0.3em] uppercase text-sm mt-1">SALA DE OPERACIONES - CURSOS: {torneo.cursos_participantes}</p>
          </div>
          <div className="flex gap-4">
             <div className="text-center bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Tu Rango</p>
                <p className="text-xl font-black text-white">{miNombre}</p>
             </div>
             
             {/* 🔥 MAGIA DE ESTADO: Muestra botones según el estado y rol 🔥 */}
             {torneo.estado === 'clausurado' ? (
               <button onClick={() => window.open(`/lobby/${torneoId}/reporte`, '_blank')} className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-2xl font-black uppercase shadow-[0_0_20px_rgba(217,119,6,0.3)] transition-all flex items-center gap-2">
                 <FileText size={20}/> Ver Acta Final
               </button>
             ) : miRol !== 'profesor' ? (
               <button onClick={crearMesaDeCombate} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black uppercase shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all flex items-center gap-2">
                 <Sword size={20}/> Abrir Nueva Mesa
               </button>
             ) : (
               <button onClick={() => window.open(`/lobby/${torneoId}/reporte`, '_blank')} className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black uppercase shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all flex items-center gap-2">
                 <Crown size={20}/> Clausurar Torneo
               </button>
             )}

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4 bg-[#0B1121] border border-slate-800 rounded-[2.5rem] p-6 h-fit">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase"><Trophy className="text-amber-500"/> Ranking de Honor</h2>
          <div className="space-y-3">
            {ranking.length === 0 ? <p className="text-xs text-slate-500 italic">No hay puntajes aún. El profesor debe evaluar partidas.</p> : (
               ranking.map((jugador, i) => (
                 <div key={i} className="flex justify-between items-center bg-[#020617] border border-slate-800 p-3 rounded-xl">
                   <div className="flex items-center gap-3">
                     <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${i===0 ? 'bg-amber-500 text-black shadow-[0_0_10px_orange]' : i===1 ? 'bg-slate-300 text-black' : i===2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'}`}>{i+1}</span>
                     <span className="font-bold text-sm text-white uppercase">{jugador.nombre}</span>
                   </div>
                   <span className="text-emerald-400 font-mono font-bold text-sm">{jugador.puntos} PTS</span>
                 </div>
               ))
            )}
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 uppercase"><Activity className="text-rose-500"/> Frentes de Batalla ({partidas.length}/4)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {partidas.map((p) => (
              <div key={p.id} className={`bg-[#0B1121] border ${p.estado !== 'finalizado' ? 'border-blue-500/30' : 'border-slate-800'} p-6 rounded-3xl transition-all hover:scale-[1.02]`}>
                <div className="flex justify-between items-start mb-4">
                   <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${p.estado !== 'finalizado' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                     {p.estado === 'esperando_jugadores' ? 'Esperando...' : p.estado === 'en_curso' ? 'En Combate' : 'Finalizado'}
                   </span>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                   <div className="text-center flex-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Blancas</p>
                      <p className="font-bold text-white text-sm truncate uppercase">{p.jugador_blancas}</p>
                   </div>
                   <Sword size={20} className="text-slate-700 mx-2"/>
                   <div className="text-center flex-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Negras</p>
                      <p className="font-bold text-white text-sm truncate uppercase">{p.jugador_negras}</p>
                   </div>
                </div>

                <div className="flex gap-2">
                   {p.estado !== 'finalizado' ? (
                     <>
                       {/* Si el torneo está clausurado, solo se puede observar, no jugar */}
                       {(torneo?.estado !== 'clausurado' && (miNombre === p.jugador_blancas || miNombre === p.jugador_negras || p.jugador_negras === 'Esperando...')) ? (
                         <button onClick={()=>router.push(`/torneo/${p.id}`)} className="flex-1 bg-emerald-600 text-white py-2 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2">Entrar a Mesa <ArrowRight size={14}/></button>
                       ) : (
                         <button onClick={()=>router.push(`/torneo/${p.id}?mode=observer`)} className="flex-1 bg-slate-800 text-white py-2 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"><Eye size={14}/> Observar</button>
                       )}
                     </>
                   ) : (
                     <button onClick={()=>window.open(`/torneo/${p.id}/planilla`, '_blank')} className="flex-1 bg-slate-700 text-slate-300 py-2 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"><FileText size={14}/> Ver Evaluación</button>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}