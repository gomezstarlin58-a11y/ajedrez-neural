"use client";
import { db } from '../../../lib/motorFirebase'; // Asegúrate de que la ruta a firebase sea correcta (3 saltos)
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Brain, CheckCircle, Loader2 } from 'lucide-react';

const VISION_CIEGA = [
  {
    id: "ciego_1",
    orden: 1,
    titulo: "El Color del Vacío",
    concepto: "Cartografía Mental",
    xp: 3000,
    informe: [
      "Bienvenido al Palacio Mental, Comandante.",
      "Aquí no hay madera ni plástico. Solo matemáticas y memoria.",
      "Para jugar a ciegas, debes saber el color de cualquier casilla al instante. La fórmula es simple:",
      "Convierte la letra en número (a=1, b=2... h=8). Suma la letra y el número de la casilla.",
      "Si el resultado es PAR, la casilla es OSCURA. Si es IMPAR, la casilla es CLARA."
    ],
    pregunta: "Visualiza la casilla d5. Aplica la fórmula. ¿De qué color es?",
    opciones: [
      { id: "A", texto: "Oscura", correcta: false, feedback: "Error. 'd' es la 4ta letra. 4 + 5 = 9. El 9 es impar." },
      { id: "B", texto: "Clara", correcta: true, feedback: "¡Exacto! d(4) + 5 = 9 (Impar). Es una casilla de luz." }
    ]
  },
  {
    id: "ciego_2",
    orden: 2,
    titulo: "La Geometría del Caballo",
    concepto: "Saltos de Color",
    xp: 4000,
    informe: [
      "El Caballo es la bestia más difícil de domar en la oscuridad.",
      "Pero tiene una regla de oro inquebrantable: En cada salto, SIEMPRE cambia de color.",
      "Si está en una casilla clara, su próximo salto será obligatoriamente a una oscura. Sin excepciones.",
      "Esto te permite descartar rutas imposibles al instante."
    ],
    pregunta: "Tu Caballo está en a1 (Oscura). Quieres llevarlo a c2 (Clara). ¿Es posible hacerlo en exactamente DOS saltos?",
    opciones: [
      { id: "A", texto: "Sí, es posible.", correcta: false, feedback: "Imposible. Salto 1 (a1 a Clara). Salto 2 (Clara a Oscura). Nunca podrías terminar en c2 (Clara) en un número par de saltos." },
      { id: "B", texto: "No, es matemáticamente imposible.", correcta: true, feedback: "¡Brillante! Como c2 es Clara, y a1 es Oscura, requieres un número IMPAR de saltos (1, 3, 5) para cambiar de color." }
    ]
  },
  {
    id: "ciego_3",
    orden: 3,
    titulo: "Diagonales Cruzadas",
    concepto: "Rayos X",
    xp: 5000,
    informe: [
      "Las diagonales son los rayos X del tablero.",
      "La Gran Diagonal Oscura va de a1 a h8. La Gran Diagonal Clara va de a8 a h1.",
      "Ambas se cruzan en el epicentro exacto del tablero: las casillas d4, d5, e4, e5."
    ],
    pregunta: "Colocas un Alfil en a1. Tu rival tiene un Rey en h8 y un Peón en d5. ¿El Alfil ataca al Rey?",
    opciones: [
      { id: "A", texto: "Sí, están en la misma diagonal libre.", correcta: false, feedback: "Falso. La diagonal a1-h8 pasa exactamente por e4 y d5. El peón en d5 bloquea la visión del Alfil." },
      { id: "B", texto: "No, la diagonal está bloqueada por el peón.", correcta: true, feedback: "¡Visión perfecta! La diagonal a1-h8 cruza exactamente por d5. El peón hace de escudo." }
    ]
  }
];

export default function InyectorCiego() {
  const [status, setStatus] = useState("Iniciando inyección del Palacio Mental...");
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    const inyectarDB = async () => {
      try {
        setStatus("🌌 Creando el vacío... Subiendo redes neuronales...");
        for (const nivel of VISION_CIEGA) {
          await setDoc(doc(db, "ciego_niveles", nivel.id), nivel);
        }
        setStatus("👁️ ¡Palacio Mental en Línea! Visualización activada.");
        setCompletado(true);
      } catch (e: any) {
        setStatus("❌ ERROR DE SISTEMA: " + e.message);
      }
    };
    inyectarDB();
  }, []);

  return (
    <div className="h-screen bg-[#0a0514] flex flex-col items-center justify-center text-fuchsia-500 font-serif p-10">
      {completado ? <CheckCircle size={80} className="mb-6 text-fuchsia-400" /> : <Loader2 size={80} className="mb-6 text-fuchsia-500 animate-spin" />}
      <h1 className="text-4xl font-black mb-4 text-white">
        {completado ? "SINAPSIS CONECTADA" : "FORMANDO EL VACÍO..."}
      </h1>
      <div className={`p-6 border rounded-2xl mb-8 w-full max-w-lg text-center transition-colors ${completado ? 'bg-fuchsia-900/20 border-fuchsia-500/50 text-fuchsia-300' : 'bg-black/40 border-white/10 text-slate-400'}`}>
        <p className="text-xl">{status}</p>
      </div>
    </div>
  );
}