"use client";
import { db } from '../../../lib/motorFirebase'; // Asegúrate de tener los 3 saltos
import { doc, setDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Compass, CheckCircle2, Loader2 } from 'lucide-react';

const GEOMETRIA_SAGRADA = [
  {
    id: "mate_1",
    orden: 1,
    titulo: "La Regla del Cuadrado",
    concepto: "Proporción Áurea",
    xp: 3000,
    informe: [
      "El tablero es un lienzo perfecto de proporciones exactas.",
      "Cuando un peón huye hacia su coronación y no tienes piezas para detenerlo, no calcules jugada por jugada. Eso es de novatos.",
      "Traza una línea desde el peón hasta la casilla de promoción. Ese es un lado de tu cuadrado.",
      "Ahora dibuja el resto del cuadrado hacia el lado donde está tu Rey.",
      "La regla matemática absoluta: Si tu Rey puede pisar dentro de ese cuadrado en su turno, atrapará al peón. Si no, el peón se convertirá en Reina y habrás perdido."
    ],
    pregunta: "Un peón blanco enemigo está en la casilla 'h4' y avanza hacia 'h8'. Trazas el cuadrado perfecto. ¿Qué casillas definen las cuatro esquinas de esta figura geométrica?",
    opciones: [
      { id: "A", texto: "h4, h8, d8, d4", correcta: true, feedback: "¡Precisión geométrica! El peón tiene 5 casillas hasta el final (h4 a h8). Cuentas 5 casillas hacia la izquierda (h, g, f, e, d). El cuadrado exacto es h4-h8-d8-d4." },
      { id: "B", texto: "h4, h8, c8, c4", correcta: false, feedback: "Tu compás ha fallado. Ese es un rectángulo, no un cuadrado. De h a c hay 6 columnas, pero de la fila 4 a la 8 hay solo 5." }
    ]
  },
  {
    id: "mate_2",
    orden: 2,
    titulo: "La Balanza de Intercambio",
    concepto: "Aritmética de Tensión",
    xp: 4000,
    informe: [
      "No hay sacrificio sin un cálculo exacto. El valor absoluto de las piezas es: Peón (1), Caballo (3), Alfil (3), Torre (5), Reina (9).",
      "Cuando varias piezas atacan una misma casilla, debes sumar las fuerzas y proyectar el resultado final de la masacre.",
      "Entregar una Torre (5) a cambio de un Caballo (3) y dos Peones (1+1) es matemáticamente un intercambio equilibrado (5 por 5)."
    ],
    pregunta: "Decides iniciar una secuencia de capturas. Entregas tus dos Torres (5+5) y a cambio capturas la Reina enemiga (9) y un Peón (1). ¿Cuál es el resultado matemático neto de esta operación?",
    opciones: [
      { id: "A", texto: "Pierdes ventaja, porque las dos Torres valen más que la Reina.", correcta: false, feedback: "Error de cálculo. 5+5 es 10. La Reina es 9, más el peón es 1. El total es 10. No pierdes ventaja material." },
      { id: "B", texto: "Es un equilibrio matemático perfecto (10 = 10).", correcta: true, feedback: "¡Matemática pura! Has cambiado 10 puntos por 10 puntos. El peso en la balanza es idéntico." }
    ]
  },
  {
    id: "mate_3",
    orden: 3,
    titulo: "El Péndulo Impar",
    concepto: "La Oposición",
    xp: 5000,
    informe: [
      "En el final del juego, los Reyes bailan un vals letal. Quien se aparta, cede terreno.",
      "La Oposición es una regla matemática estricta: Si los reyes están en la misma columna o fila, debes contar las casillas vacías entre ellos.",
      "Si el número de casillas vacías es IMPAR (1, 3, 5), el jugador que NO tiene el turno de mover es el que posee la ventaja matemática. Acaba de 'tomar la oposición'."
    ],
    pregunta: "Tu Rey está en 'e2' y el Rey enemigo está en 'e4'. Hay exactamente UNA (1) casilla vacía entre ambos (e3). Es el turno de las piezas negras (el enemigo). ¿Quién tiene la ventaja de la Oposición?",
    opciones: [
      { id: "A", texto: "Tú (Las Blancas), porque el número es impar y el rival está obligado a mover.", correcta: true, feedback: "¡Magia numérica! Como hay 1 casilla (impar) y le toca a él, él está en 'Zugzwang' (obligado a empeorar su posición). Tú dominas." },
      { id: "B", texto: "El enemigo (Las Negras), porque le toca mover y puede atacar.", correcta: false, feedback: "Error conceptual. Los reyes no pueden acercarse a menos de una casilla. Al tocarle mover a él, está obligado a retroceder o hacerse a un lado, cediéndote el paso." }
    ]
  }
];

export default function InyectorMatematico() {
  const [status, setStatus] = useState("Preparando pergaminos y tinta...");
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    const inyectarDB = async () => {
      try {
        setStatus("Trazando líneas con compás en Firebase...");
        for (const nivel of GEOMETRIA_SAGRADA) {
          await setDoc(doc(db, "matematico_niveles", nivel.id), nivel);
        }
        setStatus("📜 ¡Geometría Sagrada en Línea! Los pergaminos están listos.");
        setCompletado(true);
      } catch (e: any) {
        setStatus("❌ ERROR DE CÁLCULO: " + e.message);
      }
    };
    inyectarDB();
  }, []);

  return (
    <div className="h-screen bg-[#e6dcc3] flex flex-col items-center justify-center text-stone-800 font-serif p-10 relative overflow-hidden">
      
      {/* Textura de papel antiguo de fondo */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/aged-paper.png')" }}></div>

      {completado ? <CheckCircle2 size={80} className="mb-6 text-amber-700" strokeWidth={1.5} /> : <Loader2 size={80} className="mb-6 text-stone-600 animate-spin" />}
      
      <h1 className="text-4xl font-black mb-4 tracking-tight">
        {completado ? "TALLER MATEMÁTICO LISTO" : "CALCULANDO PROPORCIONES..."}
      </h1>
      
      <div className={`p-6 border-2 rounded-sm mb-8 w-full max-w-lg text-center transition-colors relative shadow-xl
        ${completado ? 'bg-[#f4ebd8] border-amber-800/30 text-stone-700' : 'bg-[#d6ccb3] border-stone-400 text-stone-600'}`}>
        
        {/* Adornos esquineros estilo plano arquitectónico */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-900/40"></div>
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-amber-900/40"></div>
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-amber-900/40"></div>
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-900/40"></div>

        <p className="text-xl font-medium italic">{status}</p>
      </div>

      {completado && (
        <p className="text-amber-900/60 mt-4 tracking-[0.2em] uppercase text-xs font-bold">Puedes retornar a la arquitectura principal.</p>
      )}
    </div>
  );
}