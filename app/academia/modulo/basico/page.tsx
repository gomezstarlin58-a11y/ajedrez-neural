"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, BookOpen, ChevronRight, CheckCircle2, Target, Loader2, Database } from 'lucide-react';
// 🔥 IMPORTAMOS LA BASE DE DATOS
import { db } from '../../../../lib/motorFirebase';
import { collection, getDocs } from 'firebase/firestore';

// 📚 LOS 7 NIVELES BASE (Hardcoded para que nunca se pierdan)
const LECCIONES_BASE = [
  { id: 1, titulo: "El Peón: La Infantería", teoria: "El Peón es el alma del ajedrez. Se mueve un paso hacia adelante, pero en su primera jugada puede avanzar dos pasos de golpe si lo deseas. Recuerda: es la única pieza que no puede retroceder. Su forma de atacar también es única: captura en diagonal, a un solo paso de distancia.", mision: "Demuestra tu control. Mueve el peón central dos pasos hacia adelante, desde la casilla 'e2' hasta la 'e4'.", fen: "4k3/7p/8/8/8/8/4P3/4K3 w - - 0 1", destinoCorrecto: "e4" },
  { id: 2, titulo: "El Caballo: Fuerzas Especiales", teoria: "El Caballo es letal en posiciones cerradas. Se mueve formando una letra 'L' mayúscula (dos pasos en una dirección y uno hacia el lado). Su mayor ventaja táctica: es la ÚNICA pieza de todo el ejército capaz de saltar por encima de otras unidades, sean aliadas o enemigas.", mision: "El enemigo no te ve venir. Salta con tu Caballo hacia el centro, aterrizando en la casilla 'f3'.", fen: "4k3/7p/8/8/8/8/8/4K1N1 w - - 0 1", destinoCorrecto: "f3" },
  { id: 3, titulo: "El Alfil: El Francotirador", teoria: "El Alfil domina las largas distancias, pero está atado a un color. Se mueve exclusivamente en línea recta por las diagonales, tantas casillas como desee. Un bando tiene un Alfil de casillas blancas y otro de casillas negras. Juntos, forman unas 'tijeras' mortales.", mision: "Posiciona tu Alfil en una diagonal dominante. Muévelo desde 'f1' hasta 'c4'.", fen: "4k3/7p/8/8/8/8/8/4KB2 w - - 0 1", destinoCorrecto: "c4" },
  { id: 4, titulo: "La Torre: Artillería Pesada", teoria: "Fuerte y directa. La Torre se desplaza en líneas rectas (columnas verticales y filas horizontales) a través de todo el tablero. Su verdadero poder se desata en las etapas finales del combate o cuando logras 'abrir' una columna eliminando a los peones.", mision: "¡Fuego a discreción! Mueve tu Torre por toda la columna hacia arriba hasta la casilla 'a8' para darle un Jaque directo al Rey enemigo.", fen: "4k3/7p/8/8/8/8/8/R3K3 w - - 0 1", destinoCorrecto: "a8" },
  { id: 5, titulo: "La Dama: El Arma Definitiva", teoria: "La Reina o Dama es la unidad más poderosa del tablero, combinando el poder del Alfil y la Torre. Puede moverse en cualquier línea recta (horizontal, vertical o diagonal) a cualquier distancia. ¡Perderla temprano suele ser fatal!", mision: "Ejecuta un despliegue agresivo. Mueve tu Dama hacia la casilla 'h5'.", fen: "4k3/7p/8/8/8/8/8/3QK3 w - - 0 1", destinoCorrecto: "h5" },
  { id: 6, titulo: "El Rey: El Comandante", teoria: "La pieza más valiosa de todas. Si el Rey cae, la guerra termina. Solo puede moverse una casilla a la vez en cualquier dirección (arriba, abajo, lados, diagonales). El Rey no puede moverse a una casilla que esté siendo atacada por el enemigo (eso se llama estar en 'Jaque').", mision: "El Rey debe liderar con precaución. Muévelo un paso hacia arriba, a la casilla 'e2'.", fen: "4k3/7p/8/8/8/8/8/4K3 w - - 0 1", destinoCorrecto: "e2" },
  { id: 7, titulo: "El Enroque: Búnker Defensivo", teoria: "Es un movimiento especial de protección. Es la única vez que puedes mover DOS piezas a la vez (El Rey y la Torre). El Rey se mueve dos casillas hacia la Torre, y la Torre salta al otro lado del Rey. Solo se puede hacer si ni el Rey ni la Torre se han movido antes.", mision: "¡Refúgiate! Ejecuta el enroque corto. Mueve el Rey hacia la derecha, a la casilla 'g1'. La torre saltará sola.", fen: "4k3/7p/8/8/8/8/8/4K2R w K - 0 1", destinoCorrecto: "g1" }
];

export default function EntrenamientoBasicoPage() {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 🔥 ESTADOS CONECTADOS A LA BASE DE DATOS
  const [lecciones, setLecciones] = useState(LECCIONES_BASE);
  const [cargandoDb, setCargandoDb] = useState(true);
  
  const [leccionActiva, setLeccionActiva] = useState(0);
  const [misionCompletada, setMisionCompletada] = useState(false);
  
  // Descargamos las misiones extra desde Firebase y las fusionamos
  useEffect(() => {
    const cargarNivelesFirebase = async () => {
      try {
        const snap = await getDocs(collection(db, "basico_niveles"));
        const nivelesBD = snap.docs.map(d => {
          const data = d.data();
          return {
            id: Number(data.orden), 
            titulo: data.titulo || "Sin Título",
            teoria: data.teoria || "",
            mision: data.mision || "",
            fen: data.fen || "",
            destinoCorrecto: data.destinoCorrecto || ""
          };
        });

        // Fusionamos: Si el ID ya existe en los base, lo sobreescribimos. Si no, lo añadimos.
        let nivelesCombinados = [...LECCIONES_BASE];
        nivelesBD.forEach(nivelNuevo => {
          const index = nivelesCombinados.findIndex(n => n.id === nivelNuevo.id);
          if (index !== -1) {
            nivelesCombinados[index] = nivelNuevo; // El Admin sobreescribe al código base
          } else {
            nivelesCombinados.push(nivelNuevo); // Añadimos el nuevo al final
          }
        });

        // Ordenamos del nivel 1 al infinito
        nivelesCombinados.sort((a, b) => a.id - b.id);
        setLecciones(nivelesCombinados);

      } catch (error) {
        console.error("Error al cargar niveles de la BD:", error);
      } finally {
        setCargandoDb(false);
      }
    };

    cargarNivelesFirebase();
  }, []);

  const leccion = lecciones[leccionActiva];

  const cargarPosicion = () => {
    if (iframeRef.current && iframeRef.current.contentWindow && leccion) {
      iframeRef.current.contentWindow.postMessage({
        tipo: 'CARGAR_FEN',
        fen: leccion.fen,
        modo: 'entrenamiento'
      }, '*');
    }
    setMisionCompletada(false); 
  };

  useEffect(() => {
    if (!cargandoDb && leccion) {
      const timer = setTimeout(() => {
        cargarPosicion();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [leccionActiva, cargandoDb, lecciones]);

  useEffect(() => {
    const escucharMotor = (event: MessageEvent) => {
      if (event.data.tipo === 'HUMANO_MOVIO' && leccion) {
        
        // 🧠 VALIDADOR AVANZADO DE JUGADAS (MATE DE PASILLO Y MÁS)
        const destinoHumano = event.data.destino; // ej: 'c8'
        const jugadaCompletaHumano = event.data.origen + event.data.destino; // ej: 'c4c8'
        const sanHumano = event.data.san; // ej: 'Qxc8+' o 'Re8#'

        const objetivoCorrecto = leccion.destinoCorrecto; // Lo que pusiste en el Admin

        // Validamos si la jugada del jugador es igual a CUALQUIERA de esos formatos
        if (
          destinoHumano === objetivoCorrecto || 
          jugadaCompletaHumano === objetivoCorrecto || 
          sanHumano === objetivoCorrecto
        ) {
          setMisionCompletada(true);
        } else {
          cargarPosicion(); // Movimiento incorrecto, se devuelve la pieza
        }
      }
    };

    window.addEventListener('message', escucharMotor);
    return () => window.removeEventListener('message', escucharMotor);
  }, [leccion]);

  const siguienteLeccion = () => {
    if (leccionActiva < lecciones.length - 1) {
      setLeccionActiva(leccionActiva + 1);
    }
  };

  const leccionAnterior = () => {
    if (leccionActiva > 0) {
      setLeccionActiva(leccionActiva - 1);
    }
  };

  if (cargandoDb) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
        <Loader2 size={60} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-emerald-400 tracking-widest uppercase font-bold text-sm">Descargando Misiones...</p>
      </div>
    );
  }

  // Si por alguna razón no hay lecciones (muy raro)
  if (!leccion) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <nav className="w-full p-4 border-b border-white/10 bg-[#0B1121] flex items-center justify-between z-10 sticky top-0">
        <button 
          onClick={() => router.push('/academia')}
          className="text-slate-400 hover:text-emerald-400 flex items-center gap-2 font-bold transition-colors"
        >
          <ChevronLeft /> Volver al Árbol
        </button>
        <div className="flex items-center gap-3">
          <BookOpen className="text-emerald-500" />
          <h1 className="font-black tracking-widest text-emerald-500 uppercase hidden sm:block">
            Entrenamiento Básico
          </h1>
        </div>
        <div className="text-emerald-500/50 text-sm font-mono font-bold tracking-widest flex items-center gap-2">
          <Database size={14} /> BD CONECTADA
        </div>
      </nav>

      {/* CUERPO PRINCIPAL */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 lg:p-8 gap-8 items-center lg:items-start">
        
        {/* PANEL IZQUIERDO */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6">
          
          <div className="bg-[#0B1121] border border-emerald-900/50 p-6 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
            
            <span className="text-emerald-500 font-bold text-xs tracking-[0.3em] uppercase mb-3 block">
              Módulo {leccion.id} de {lecciones.length}
            </span>
            <h2 className="text-3xl lg:text-4xl font-black mb-6 text-white leading-tight">
              {leccion.titulo}
            </h2>
            <p className="text-slate-300 leading-relaxed text-lg mb-8 text-justify">
              {leccion.teoria}
            </p>

            <div className={`p-5 rounded-2xl flex flex-col gap-3 transition-colors duration-500 border ${misionCompletada ? 'bg-emerald-900/40 border-emerald-500' : 'bg-slate-900/80 border-slate-700'}`}>
              <div className="flex items-center gap-3">
                {misionCompletada ? (
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
                ) : (
                  <Target className="text-amber-400 shrink-0" size={24} />
                )}
                <p className={`font-black uppercase tracking-widest text-sm ${misionCompletada ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {misionCompletada ? 'Misión Completada' : 'Orden de Operaciones'}
                </p>
              </div>
              <p className={`font-medium ${misionCompletada ? 'text-emerald-100' : 'text-slate-300'}`}>
                {leccion.mision}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={leccionAnterior}
              disabled={leccionActiva === 0}
              className="flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 p-4 rounded-2xl flex justify-center items-center font-bold transition-colors"
            >
              <ChevronLeft /> Anterior
            </button>
            <button 
              onClick={siguienteLeccion}
              disabled={!misionCompletada && leccionActiva < lecciones.length - 1}
              className={`flex-1 p-4 rounded-2xl flex justify-center items-center gap-2 font-bold transition-all ${
                misionCompletada || leccionActiva === lecciones.length - 1
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)]' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Siguiente <ChevronRight />
            </button>
          </div>

          {/* Barras de Progreso Dinámicas */}
          <div className="flex gap-2 mt-2">
            {lecciones.map((l, index) => (
              <div 
                key={l.id} 
                className={`h-2 flex-1 rounded-full transition-all ${
                  index === leccionActiva 
                    ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' 
                    : index < leccionActiva ? 'bg-emerald-900' : 'bg-slate-800'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* PANEL DERECHO: IFRAME */}
        <div className="w-full lg:w-[55%] flex items-center justify-center">
          <div className="w-full max-w-[600px] aspect-square relative group">
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full transition-opacity group-hover:opacity-100 opacity-50"></div>
            
            <iframe 
              ref={iframeRef}
              src="/ajedrez-motor.html" 
              className="relative z-10 w-full h-full border-0 rounded-xl"
              title="Simulador de Entrenamiento"
            />
            
          </div>
        </div>

      </main>
    </div>
  );
}