"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Swords, ChevronRight, CheckCircle2, Flame, Shield, BookOpen, Target, Loader2, Database } from 'lucide-react';
import { db } from '../../../../lib/motorFirebase';
import { collection, getDocs } from 'firebase/firestore';



// 📚 LOS TOMOS CLÁSICOS (Base de datos integrada en código)
const APERTURAS_BASE = [
  { 
    id: 1, 
    titulo: "Gambito de Rey", 
    tipo: "Apertura Abierta",
    agresividad: "Extrema",
    teoria: "El eco de la era romántica del ajedrez. Las blancas sacrifican inmediatamente su peón de 'f4' en el segundo movimiento para destruir el centro negro y abrir la letal columna 'f' para su Torre. Es una apertura de alto riesgo y alta recompensa; un solo error de cálculo por parte de cualquiera de los bandos resulta en una aniquilación rápida.", 
    mision: "Estás jugando con piezas Negras. El enemigo te ofrece el sacrificio. Acepta el Gambito capturando su peón: mueve tu peón de e5 hacia f4.", 
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR b KQkq - 0 2", 
    destinoCorrecto: "f4" 
  },
  { 
    id: 2, 
    titulo: "Apertura Ruy López", 
    tipo: "Apertura Española",
    agresividad: "Posicional Moderada",
    teoria: "La cumbre del ajedrez académico. Bautizada en honor al sacerdote español del siglo XVI, esta apertura busca dominar el centro a largo plazo. Al colocar el Alfil en 'b5', las blancas amenazan indirectamente al caballo negro que defiende el peón central. Requiere una paciencia y comprensión estratégica absolutas.", 
    mision: "Posiciónate como las Blancas. Despliega tu Alfil de casillas claras desde f1 hasta b5 para clavar o amenazar al caballo enemigo.", 
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3", 
    destinoCorrecto: "b5" 
  },
  { 
    id: 3, 
    titulo: "Defensa Siciliana", 
    tipo: "Defensa Asimétrica",
    agresividad: "Letal / Contraataque",
    teoria: "La respuesta más exitosa y combativa contra el movimiento 1.e4. Al responder con 'c5', las negras rechazan la simetría y luchan por el control central desde el flanco. Esto genera desequilibrios tácticos brutales, partidas de enroques opuestos y masacres en el medio juego. Es el arma elegida por los campeones mundiales.", 
    mision: "Juegas con Negras. El blanco ha movido e4. Rompe la simetría y controla la casilla d4 moviendo tu peón de c7 a c5.", 
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1", 
    destinoCorrecto: "c5" 
  },
  { 
    id: 4, 
    titulo: "Defensa Francesa", 
    tipo: "Estructura Cerrada",
    agresividad: "Contra-Gambito",
    teoria: "Una fortaleza de hierro. Las negras permiten que las blancas formen un centro imponente temporalmente, preparando un contraataque masivo contra la base de esa cadena de peones. Se caracteriza por partidas cerradas donde la maniobra milimétrica en espacios reducidos decide la victoria.", 
    mision: "Juegas con Blancas (Variante del Avance). Cierra el centro bloqueando el ataque negro. Mueve tu peón de e4 a e5.", 
    fen: "rnbqkbnr/ppp2ppp/4p3/3p4/3PP3/8/PPP2PPP/RNBQKBNR w KQkq d6 0 3", 
    destinoCorrecto: "e5" 
  }
];

export default function ArsenalAperturasPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [aperturas, setAperturas] = useState(APERTURAS_BASE);
  const [cargandoDb, setCargandoDb] = useState(true);
  
  const [activaIdx, setActivaIdx] = useState(0);
  const [misionCompletada, setMisionCompletada] = useState(false);
  
  // 🔌 CONEXIÓN CON NEXUS (Sincronización de Base de Datos)
  useEffect(() => {
    const cargarAperturasFirebase = async () => {
      try {
        const snap = await getDocs(collection(db, "aperturas_niveles"));
        if (!snap.empty) {
            const nivelesBD = snap.docs.map(d => {
            const data = d.data();
            return {
                id: Number(data.orden), 
                titulo: data.titulo || "Archivo Clasificado",
                tipo: data.tipo || "Variante Táctica",
                agresividad: data.agresividad || "Desconocida",
                teoria: data.teoria || data.instruccion || "",
                mision: data.mision || data.pregunta || "",
                fen: data.fen || "",
                destinoCorrecto: data.destinoCorrecto || data.jugada_correcta || ""
            };
            });

            let nivelesCombinados = [...APERTURAS_BASE];
            nivelesBD.forEach(nivelNuevo => {
            const index = nivelesCombinados.findIndex(n => n.id === nivelNuevo.id);
            if (index !== -1) nivelesCombinados[index] = nivelNuevo;
            else nivelesCombinados.push(nivelNuevo);
            });

            nivelesCombinados.sort((a, b) => a.id - b.id);
            setAperturas(nivelesCombinados);
        }
      } catch (error) {
        console.error("Error al cargar aperturas:", error);
      } finally {
        setCargandoDb(false);
      }
    };
    cargarAperturasFirebase();
  }, []);

  const apertura = aperturas[activaIdx];

  const cargarPosicion = () => {
    if (iframeRef.current && iframeRef.current.contentWindow && apertura) {
      iframeRef.current.contentWindow.postMessage({
        tipo: 'CARGAR_FEN',
        fen: apertura.fen,
        modo: 'academia' // 🔥 CÓDIGO CORREGIDO: Esto permite que el tablero gire si juegas con negras
      }, '*');
    }
    setMisionCompletada(false); 
  };

  useEffect(() => {
    if (!cargandoDb && apertura) {
      const timer = setTimeout(() => cargarPosicion(), 500);
      return () => clearTimeout(timer);
    }
  }, [activaIdx, cargandoDb, aperturas]);

  // 🧠 VALIDADOR AVANZADO
  useEffect(() => {
    const escucharMotor = (event: MessageEvent) => {
      if (event.data.tipo === 'HUMANO_MOVIO' && apertura) {
        const destino = event.data.destino;
        const jugadaCompleta = event.data.origen + event.data.destino;
        const san = event.data.san;
        const objetivo = apertura.destinoCorrecto;

        if (destino === objetivo || jugadaCompleta === objetivo || san === objetivo) {
          setMisionCompletada(true);
        } else {
          cargarPosicion(); // Falla y resetea el tablero
        }
      }
    };
    window.addEventListener('message', escucharMotor);
    return () => window.removeEventListener('message', escucharMotor);
  }, [apertura]);

  // 🔥 MOTORES DE NAVEGACIÓN AÑADIDOS
  const siguienteLeccion = () => {
    if (activaIdx < aperturas.length - 1) {
      setActivaIdx(activaIdx + 1);
    }
  };

  const leccionAnterior = () => {
    if (activaIdx > 0) {
      setActivaIdx(activaIdx - 1);
    }
  };

  if (cargandoDb) {
    return (
      <div className="min-h-screen bg-[#050000] flex flex-col items-center justify-center">
        <Loader2 size={60} className="text-rose-600 animate-spin mb-4" />
        <p className="text-rose-400 tracking-widest uppercase font-bold text-sm">Desencriptando Archivos...</p>
      </div>
    );
  }

  if (!apertura) return null;

  return (
    <div className="min-h-screen bg-[#050204] text-white flex flex-col font-sans selection:bg-rose-500/30">
      
      {/* NAVEGACIÓN SUPERIOR - ESTÉTICA ROJO Y BLANCO */}
      <nav className="w-full p-4 border-b border-rose-900/30 bg-[#0B0406] flex items-center justify-between z-10 sticky top-0 shadow-[0_4px_30px_rgba(225,29,72,0.05)]">
        <button onClick={() => router.push('/academia')} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold transition-colors">
          <ChevronLeft /> Volver a la Academia
        </button>
        <div className="flex items-center gap-3">
          <Swords className="text-rose-600" />
          <h1 className="font-black tracking-widest text-white uppercase hidden sm:block">
            Arsenal de Aperturas
          </h1>
        </div>
        <div className="text-rose-600/50 text-sm font-mono font-bold tracking-widest flex items-center gap-2">
          <Database size={14} /> BD SINCRONIZADA
        </div>
      </nav>

      {/* CUERPO PRINCIPAL */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-[1400px] mx-auto w-full p-4 lg:p-8 gap-10 items-center lg:items-start">
        
        {/* PANEL IZQUIERDO: EL ARCHIVO ACADÉMICO */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          
          <div className="bg-[#0A0406] border border-rose-900/40 p-8 rounded-tr-3xl rounded-bl-3xl rounded-tl-sm rounded-br-sm shadow-[0_0_50px_rgba(225,29,72,0.08)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-600 to-transparent"></div>
            
            <div className="flex justify-between items-start mb-6">
              <span className="text-rose-600 font-black text-[10px] tracking-[0.3em] uppercase border border-rose-900 px-3 py-1 bg-rose-950/20">
                Archivo No. 0{apertura.id}
              </span>
            </div>

            {/* Título en Fuente Serif para toque Académico */}
            <h2 className="text-4xl lg:text-5xl font-serif font-black mb-6 text-white leading-[1.1] tracking-tight">
              {apertura.titulo}
            </h2>

            {/* Badges de Información Militar */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded text-xs font-mono text-slate-300">
                <BookOpen size={14} className="text-slate-400" /> {apertura.tipo}
              </div>
              <div className="flex items-center gap-2 bg-rose-950/30 border border-rose-900/50 px-3 py-1.5 rounded text-xs font-mono text-rose-200">
                <Flame size={14} className="text-rose-500" /> Letalidad: {apertura.agresividad}
              </div>
            </div>

            <p className="text-slate-300 leading-relaxed text-lg mb-10 text-justify border-l-2 border-white/10 pl-6 py-2">
              {apertura.teoria}
            </p>

            {/* Misión Táctica / Orden de Ejecución */}
            <div className={`p-6 bg-[#0F070A] transition-colors duration-500 border-t-2 ${misionCompletada ? 'border-emerald-500' : 'border-rose-600'}`}>
              <div className="flex items-center gap-3 mb-3">
                {misionCompletada ? (
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                ) : (
                  <Target className="text-rose-600 shrink-0" size={24} />
                )}
                <p className={`font-black uppercase tracking-widest text-sm ${misionCompletada ? 'text-emerald-500' : 'text-white'}`}>
                  {misionCompletada ? 'Variante Memorizada' : 'Directriz de Tablero'}
                </p>
              </div>
              <p className={`font-serif text-lg italic ${misionCompletada ? 'text-emerald-100/70' : 'text-slate-300'}`}>
                "{apertura.mision}"
              </p>
            </div>
          </div>

          {/* Navegación Inferior */}
          <div className="flex gap-4">
            <button 
              onClick={leccionAnterior}
              disabled={activaIdx === 0}
              className="flex-1 bg-transparent border border-white/10 hover:bg-white/5 disabled:opacity-30 p-4 font-bold transition-colors uppercase tracking-widest text-xs text-slate-400"
            >
              Archivo Anterior
            </button>
            <button 
              onClick={siguienteLeccion}
              disabled={!misionCompletada && activaIdx < aperturas.length - 1}
              className={`flex-1 p-4 flex justify-center items-center gap-2 font-black uppercase tracking-widest text-xs transition-all ${
                misionCompletada || activaIdx === aperturas.length - 1
                ? 'bg-white text-[#050204] hover:bg-slate-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]' 
                : 'bg-rose-950/20 border border-rose-900/50 text-rose-900 cursor-not-allowed'
              }`}
            >
              Siguiente Estudio <ChevronRight size={16} />
            </button>
          </div>

          {/* Progreso Visual Elegante */}
          <div className="flex gap-1 mt-2">
            {aperturas.map((l, index) => (
              <div 
                key={l.id} 
                className={`h-1 flex-1 transition-all ${
                  index === activaIdx 
                    ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                    : index < activaIdx ? 'bg-rose-600' : 'bg-white/10'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* PANEL DERECHO: IFRAME DEL MOTOR FÍSICO */}
        <div className="w-full lg:w-[55%] flex items-center justify-center">
          <div className="w-full max-w-[650px] aspect-square relative group">
            
            {/* Brillo de fondo color Rojo/Carmesí */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-rose-600/10 blur-[120px] pointer-events-none rounded-full transition-opacity group-hover:opacity-100 opacity-60"></div>
            
            <div className="relative z-10 w-full h-full border-8 border-[#0B0406] rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              <iframe 
                ref={iframeRef}
                src="/ajedrez-motor.html" 
                className="w-full h-full border-0"
                title="Simulador de Aperturas"
              />
            </div>
            
          </div>
        </div>

      </main>
    </div>
  );
}