"use client";
import { db } from '@/lib/motorFirebase';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';

const TOMOS_ESTRATEGIA = [
  {
    id: "est_1",
    orden: 1,
    titulo: "Anatomía del Centro",
    concepto: "Dominio Espacial",
    xp: 2000,
    fen: "r1bq1rk1/ppp1nppp/2n5/3pP3/3P4/3B1N2/PP1N1PPP/R2Q1RK1 w - - 0 1",
    informe: [
      "El centro del tablero no son solo cuatro casillas. Es la colina más alta del campo de batalla.",
      "Quien controla esta colina, divide el ejército enemigo en dos mitades que no pueden comunicarse.",
      "Observa la posición. Las blancas tienen un Peón en e5. Ese humilde soldado es una cuña clavada en la garganta de la posición negra.",
      "Ese peón expulsa a los caballos de sus casillas naturales y prepara el terreno para un ataque masivo."
    ],
    pregunta: {
      texto: "Análisis Crítico: ¿Cuál es el mayor beneficio estratégico del peón blanco en e5 en esta posición?",
      opciones: [
        { id: "A", texto: "Amenaza con capturar un caballo en la siguiente jugada.", correcta: false, feedback: "Error. Un peón avanzado no está ahí para comer, está para controlar el espacio." },
        { id: "B", texto: "Divide el tablero y evita que las piezas negras del flanco de dama defiendan su enroque.", correcta: true, feedback: "¡Exacto! Ese peón es un muro. Aisla al Rey enemigo de sus propios defensores." },
        { id: "C", texto: "Prepara un ataque a la descubierta con el Alfil de d3.", correcta: false, feedback: "Mentalidad táctica equivocada. Aquí evaluamos el control del mapa." }
      ]
    }
  },
  {
    id: "est_2",
    orden: 2,
    titulo: "Cadenas de Peones",
    concepto: "Estructuras de Carlsbad",
    xp: 2500,
    fen: "r1bq1rk1/pp2bppp/2n1p3/3p4/3P4/P1PB1N2/1P1N1PPP/R2Q1RK1 w - - 0 1",
    informe: [
      "Los peones son el 'alma del ajedrez', como decía Philidor. Su estructura dicta dónde debes atacar.",
      "Cuando los peones se bloquean entre sí, forman cadenas. La regla de oro es: Ataca en la dirección hacia donde apuntan tus peones.",
      "En la Estructura Carlsbad (muy común en el Gambito de Dama), las blancas suelen tener una mayoría de peones en el centro, y las negras en el flanco de dama."
    ],
    pregunta: {
      texto: "¿Cuál es el plan a largo plazo más efectivo (y clásico) para las blancas en esta estructura de peones?",
      opciones: [
        { id: "A", texto: "Avanzar los peones de a y b para crear debilidades (El Ataque de Minorías).", correcta: true, feedback: "¡Brillante! El Ataque de Minorías busca cambiar peones para dejarle al rival un peón retrasado y débil en c6." },
        { id: "B", texto: "Enrocar largo y lanzar todos los peones del flanco de rey.", correcta: false, feedback: "Demasiado arriesgado. La estructura Carlsbad requiere operaciones quirúrgicas, no ataques a lo loco." },
        { id: "C", texto: "Cambiar todas las piezas para llegar a un final de peones.", correcta: false, feedback: "Incorrecto. Cambiar piezas al azar sin crear debilidades previas solo lleva a un empate." }
      ]
    }
  },
  {
    id: "est_3",
    orden: 3,
    titulo: "Casillas Débiles",
    concepto: "El Puesto Avanzado",
    xp: 3000,
    fen: "r1bq1rk1/pp2bppp/5n2/3p4/3N4/2N1P3/PP2BPPP/R2Q1RK1 w - - 0 1",
    informe: [
      "Una 'casilla débil' es aquella que ya no puede ser defendida por un peón propio.",
      "Para el bando contrario, esa casilla se convierte en un 'Puesto Avanzado' (Outpost). Un lugar perfecto para instalar una pieza.",
      "Observa el peón negro en d5. Es un 'Peón Aislado'. La casilla justo delante de él (d4) es un cráter en la posición enemiga."
    ],
    pregunta: {
      texto: "Ante un Peón Aislado enemigo en d5, ¿qué pieza blanca es estratégicamente la ideal para ocupar y bloquear la casilla d4?",
      opciones: [
        { id: "A", texto: "La Dama blanca.", correcta: false, feedback: "Peligroso. La Dama es muy valiosa; si una pieza menor la ataca, tendrá que huir perdiendo el control de la casilla." },
        { id: "B", texto: "Un Caballo blanco.", correcta: true, feedback: "¡Perfecto! El Caballo en un puesto avanzado es un monstruo. Bloquea el peón y ataca en 8 direcciones distintas sin poder ser expulsado por peones rivales." },
        { id: "C", texto: "Una Torre blanca.", correcta: false, feedback: "La Torre prefiere columnas abiertas, no quedarse estancada bloqueando a un peón." }
      ]
    }
  },
  {
    id: "est_4",
    orden: 4,
    titulo: "El Alfil Malo",
    concepto: "Dinámica de Piezas",
    xp: 3500,
    fen: "8/8/p1p1k3/1p1p1p2/1P1P1P2/P1P1K3/8/5B2 w - - 0 1",
    informe: [
      "No todos los alfiles valen 3 puntos. Su valor depende de la estructura de peones.",
      "Un 'Alfil Bueno' se mueve por casillas de color distinto al de tus propios peones bloqueados. Tiene libertad de visión.",
      "Mira el tablero. Estamos en un final cerrado. El Alfil blanco está en f1 (casilla clara)."
    ],
    pregunta: {
      texto: "¿Por qué el Alfil blanco en esta posición es considerado un 'Alfil Malo' o 'Alfil Grande'?",
      opciones: [
        { id: "A", texto: "Porque choca contra sus propios peones bloqueados en casillas claras, limitando su movilidad a cero.", correcta: true, feedback: "Correcto. Este alfil es un 'peón gordo'. No puede atacar ni defender activamente porque su propio ejército le bloquea el paso." },
        { id: "B", texto: "Porque el Rey enemigo está muy lejos y no puede darle jaque.", correcta: false, feedback: "Un alfil no necesita dar jaques para ser bueno, necesita movilidad." },
        { id: "C", texto: "Porque no hay piezas enemigas para capturar.", correcta: false, feedback: "La bondad de un alfil se mide por sus diagonales abiertas, no por sus capturas." }
      ]
    }
  },
  {
    id: "est_5",
    orden: 5,
    titulo: "Profilaxis",
    concepto: "El Pensamiento de Karpov",
    xp: 5000,
    fen: "r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2NBPN2/PP3PPP/R2Q1RK1 w - - 0 1",
    informe: [
      "El concepto más elevado de la estrategia: La Profilaxis.",
      "El maestro soviético Aaron Nimzowitsch lo introdujo, y Anatoly Karpov lo elevó a arte.",
      "Consiste en no solo pensar '¿Qué quiero hacer yo?', sino hacerte siempre la pregunta: '¿Qué quiere hacer mi rival?'."
    ],
    pregunta: {
      texto: "¿Cuál es la esencia de la Profilaxis en el ajedrez de alto nivel?",
      opciones: [
        { id: "A", texto: "Atacar implacablemente antes de que el rival pueda desarrollar sus piezas.", correcta: false, feedback: "Eso es juego agresivo, no profiláctico." },
        { id: "B", texto: "Anticipar, prevenir y frustrar el plan del oponente ANTES de iniciar tus propias operaciones.", correcta: true, feedback: "¡Maestría pura! La profilaxis es asfixia psicológica. Evitas que el rival respire, y cuando se queda sin ideas, lo aplastas." },
        { id: "C", texto: "Cambiar todas las piezas mayores rápidamente para asegurar tablas.", correcta: false, feedback: "Eso es jugar a no perder. La profilaxis busca ganar cortando el contrajuego." }
      ]
    }
  }
];

export default function InyectorEstrategia() {
  const [status, setStatus] = useState("Iniciando inyección de Tomos Estratégicos...");
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    const inyectarDB = async () => {
      try {
        setStatus("🚀 Subiendo Tomos al Ateneo (Firebase)...");
        // Usamos una nueva colección llamada 'estrategia_tomos' para separarlo de táctica
        for (const tomo of TOMOS_ESTRATEGIA) {
          await setDoc(doc(db, "estrategia_tomos", tomo.id), tomo);
        }
        setStatus("🎯 ¡Matriz Estratégica en Línea! Tomos guardados.");
        setCompletado(true);
      } catch (e: any) {
        setStatus("❌ ERROR DE SISTEMA: " + e.message);
      }
    };
    inyectarDB();
  }, []);

  return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-amber-500 font-serif p-10">
      {completado ? <CheckCircle size={80} className="mb-6 text-amber-400" /> : <Loader2 size={80} className="mb-6 text-amber-500 animate-spin" />}
      <h1 className="text-4xl font-black mb-4 text-white">
        {completado ? "ATENEO CONFIGURADO" : "SINCRONIZANDO ESTRATEGIA..."}
      </h1>
      <div className={`p-6 border rounded-2xl mb-8 w-full max-w-lg text-center transition-colors ${completado ? 'bg-amber-900/20 border-amber-500/50 text-amber-400' : 'bg-black/40 border-white/10 text-slate-400'}`}>
        <p className="text-xl">{status}</p>
      </div>
      {completado && (
        <p className="text-slate-500 mt-4 tracking-widest uppercase text-sm">Ya puedes regresar al proyecto.</p>
      )}
    </div>
  );
}