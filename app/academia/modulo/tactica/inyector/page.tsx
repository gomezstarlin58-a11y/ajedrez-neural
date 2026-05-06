"use client";
import { db } from '../../../../../lib/motorFirebase';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Database, CheckCircle, Loader2 } from 'lucide-react';

const TODOS_LOS_NIVELES = [
  { id: "1", orden: 1, titulo: "El Mate de Pasillo", tipo: "teoria", xp: 100, descripcion: "La base de la seguridad del rey.", contenido: ["El mate de pasillo ocurre cuando un Rey está atrapado detrás de sus propios peones."], fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", solucion: "Rd8#" },
  { id: "2", orden: 2, titulo: "Práctica de Pasillo", tipo: "practica", xp: 200, descripcion: "Aplica lo aprendido.", instruccion: "Dale jaque mate al rey negro aprovechando el pasillo.", fen: "6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1", solucion: "Rd8#" },
  { id: "3", orden: 3, titulo: "La Clavada: Teoría", tipo: "teoria", xp: 150, descripcion: "Inmoviliza al enemigo.", contenido: ["Una pieza está 'clavada' cuando no puede moverse sin exponer a su Rey."], fen: "4k3/8/8/4n3/8/8/1B6/4R1K1 w - - 0 1", solucion: "Bxe5" },
  { id: "4", orden: 4, titulo: "Prueba: La Clavada", tipo: "practica", xp: 250, descripcion: "Captura la pieza inmovilizada.", instruccion: "El caballo está clavado. Captúralo con tu alfil.", fen: "4k3/8/8/4n3/8/8/1B6/4R1K1 w - - 0 1", solucion: "Bxe5" },
  { id: "5", orden: 5, titulo: "Ataque a la Descubierta", tipo: "teoria_avanzada", xp: 500, descripcion: "Un movimiento, dos amenazas.", contenido: ["Bienvenido al entrenamiento de élite.", "Ocurre cuando mueves una pieza y abres la línea de ataque de otra."], ejercicios: [{ fen: "r1b1k2r/pp3ppp/2n5/q2p4/1b1P4/P1N5/1P1B1PPP/R2QKBNR w KQkq - 0 1", solucion: "axb4", msg: "Descubre el ataque al alfil capturando en b4." }] },
  { id: "6", orden: 6, titulo: "Jaque Doble: El Misil", tipo: "teoria_avanzada", xp: 750, descripcion: "La jugada más potente.", contenido: ["Dos piezas atacan al Rey al mismo tiempo. No se puede bloquear."], ejercicios: [{ fen: "4k3/p3pppp/8/8/4B3/8/8/4R1K1 w - - 0 1", solucion: "Bc6+", msg: "El alfil en e4 bloquea a tu torre. Muévelo a c6 para dar un jaque imparable." }] },
  { id: "7", orden: 7, titulo: "Sacrificio de Atracción", tipo: "maestria", xp: 1000, descripcion: "Obliga al Rey a ir a su tumba.", contenido: ["Sacrificamos una pieza valiosa para forzar al Rey a una casilla mala."], ejercicios: [{ fen: "6k1/1p3ppp/8/8/8/8/5QPP/3R2K1 w - - 0 1", solucion: "Qxf7+", msg: "Sacrifica tu Dama en f7 para destruir la defensa." }] },
  { id: "8", orden: 8, titulo: "El Desvío", tipo: "jefe", xp: 1500, descripcion: "Distrae a la defensa.", contenido: ["Obliga a un defensor a moverse a otro lado sacrificando una pieza."], ejercicios: [{ fen: "1r4k1/p4ppp/8/8/2Q5/8/P4PPP/2R3K1 w - - 0 1", solucion: "Qc8+", msg: "Sacrifica la Dama en c8 para desviar a la torre negra." }] },
  
  // 🔥 NUEVOS NIVELES (9 AL 15)
  {
    id: "9", orden: 9, titulo: "La Enfilada", tipo: "teoria_avanzada", xp: 1200, descripcion: "El ataque a través de las sombras.",
    contenido: ["La enfilada es como una clavada, pero al revés.", "Atacas a una pieza de gran valor (como el Rey), obligándola a moverse, y capturas la pieza que estaba detrás de ella.", "Observa el tablero y usa tu Torre."],
    ejercicios: [{ fen: "8/8/8/2k5/2q5/8/8/2R3K1 w - - 0 1", solucion: "Rxc4+", msg: "Usa tu torre para capturar a la Reina clavada al Rey." }]
  },
  {
    id: "10", orden: 10, titulo: "El Pinchazo de Peón", tipo: "practica", xp: 1300, descripcion: "El soldado de infantería ataca.", instruccion: "Tus peones pueden ser letales. Usa tu peón para atacar dos piezas mayores al mismo tiempo.",
    fen: "8/8/4k3/4p3/3P4/8/8/1K6 w - - 0 1", solucion: "dxe5"
  },
 {
    id: "11", orden: 11, titulo: "Destrucción de la Defensa", tipo: "teoria_avanzada", xp: 1400, descripcion: "Elimina al guardia de seguridad.",
    contenido: ["A veces el cálculo es simple: si una pieza defiende la casilla de Mate, elimina a esa pieza.", "No importa si pierdes material temporalmente, el objetivo es el Rey."],
    // 🔥 CORRECCIÓN: El Alfil ahora está en c5 (casilla clara), apuntando directo al peón en a7.
    ejercicios: [{ fen: "8/p7/8/2B5/8/8/8/1K5k w - - 0 1", solucion: "Bxa7", msg: "Captura el peón defensor." }]
  },
  {
    id: "12", orden: 12, titulo: "La Pieza Sobrecargada", tipo: "practica", xp: 1500, descripcion: "Un soldado no puede hacer dos trabajos.", instruccion: "El rival tiene una pieza haciendo demasiado trabajo. Aprovéchalo capturando gratis.",
    fen: "8/8/8/1k6/1n6/8/1R6/1K6 w - - 0 1", solucion: "Rxb4+"
  },
  {
    id: "13", orden: 13, titulo: "Interferencia Táctica", tipo: "teoria_avanzada", xp: 1600, descripcion: "Corta las líneas de comunicación.",
    contenido: ["Consiste en colocar una pieza en medio de la línea de defensa de dos piezas enemigas.", "Al bloquear su comunicación, una de ellas quedará indefensa."],
    // 🔥 CORRECCIÓN: El puzle real de interferencia.
    ejercicios: [{ 
      fen: "1r5q/8/4N3/8/8/8/8/1R4K1 w - - 0 1", 
      solucion: "Nd8", 
      msg: "La Reina negra en h8 defiende a su Torre en b8. ¡Salta con tu Caballo a d8 para cortar la comunicación!" 
    }]
  },
 {
    id: "14", orden: 14, titulo: "La Promoción Letal", tipo: "maestria", xp: 2000, descripcion: "Un peón se convierte en Dios.",
    contenido: ["Coronar un peón no es solo ganar una Reina, a veces es la única forma de dar el jaque mate inmediato o un jaque decisivo.", "Calcula el avance final de tu infantería."],
    // 🔥 CORRECCIÓN 14: Añadido el signo '+' porque la Reina da jaque automático en la diagonal larga.
    ejercicios: [{ fen: "8/P7/8/8/8/8/8/1K5k w - - 0 1", solucion: "a8=Q+", msg: "Corona tu peón pidiendo Dama. ¡Atento porque darás jaque al instante!" }]
  },
  {
    id: "15", orden: 15, titulo: "Examen de Gran Maestro", tipo: "jefe", xp: 5000, descripcion: "La graduación de la Táctica Quirúrgica.",
    contenido: [
      "Comandante, este es el final del recorrido.",
      "Has superado 14 niveles de tácticas geométricas. Ahora debes demostrar precisión absoluta.",
      "Da el golpe final y desbloquea el siguiente módulo de la Academia."
    ],
    // 🔥 CORRECCIÓN 15: Posición ajustada para un Mate de Pasillo perfecto. El Rey blanco bloquea el escape.
    ejercicios: [{ fen: "k7/7R/1K6/8/8/8/8/8 w - - 0 1", solucion: "Rh8#", msg: "EXAMEN FINAL: Tu Rey en b6 corta el escape. ¡Baja la Torre para el mate definitivo!" }]
  }
];

export default function InyectorQuinceNiveles() {
  const [status, setStatus] = useState("Iniciando secuencia de inyección masiva...");
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    const ejecutarSincronizacion = async () => {
      try {
        setStatus("🧹 Limpiando la matriz por completo...");
        const querySnapshot = await getDocs(collection(db, "niveles"));
        for (const docRef of querySnapshot.docs) {
          await deleteDoc(doc(db, "niveles", docRef.id));
        }

        setStatus("🚀 Inyectando los 15 niveles de élite...");
        for (const nivel of TODOS_LOS_NIVELES) {
          await setDoc(doc(db, "niveles", nivel.id), nivel);
        }
        
        setStatus("🎯 ¡Operación Exitosa! Los 15 niveles están en línea.");
        setCompletado(true);
      } catch (e: any) {
        setStatus("❌ ERROR DE SISTEMA: " + e.message);
      }
    };

    ejecutarSincronizacion();
  }, []);

  return (
    <div className="h-screen bg-[#020617] flex flex-col items-center justify-center text-blue-400 font-mono p-10">
      {completado ? <CheckCircle size={80} className="mb-6 text-emerald-500" /> : <Loader2 size={80} className="mb-6 text-blue-500 animate-spin" />}
      <h1 className="text-3xl font-black mb-4 text-white text-center">
        {completado ? "MATRIZ EXPANDIDA A 15 NIVELES" : "SINCRONIZANDO ARTILLERÍA PESADA..."}
      </h1>
      <div className={`p-6 border rounded-2xl mb-8 w-full max-w-lg text-center transition-colors ${completado ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-blue-900 text-blue-400'}`}>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
}