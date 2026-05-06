import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen w-full bg-[#020617] p-10 md:p-20">
      <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-white transition-colors mb-10 font-bold">
        <ArrowLeft size={20} /> Volver a la página principal
      </Link>
      
      <div className="max-w-4xl mx-auto bg-[#0B1121] border border-slate-800 p-10 md:p-16 rounded-3xl shadow-2xl text-slate-300 space-y-10">
        
        {/* Encabezado Principal */}
        <div className="border-b border-slate-800 pb-8">
          <h1 className="text-4xl text-white font-extrabold mb-4 flex items-center gap-3">
            <span>🛡️</span> Política de Privacidad y Seguridad
          </h1>
          <p className="text-lg leading-relaxed text-slate-400">
            En <strong className="text-white">Chess Academy</strong>, nuestra misión es ofrecerte la mejor experiencia de ajedrez táctil. Queremos que tu única preocupación sea planear tu próxima jugada maestra, por eso, nos tomamos muy en serio la protección de tu tranquilidad y tu información.
          </p>
        </div>

        {/* Sección 1 */}
        <div className="space-y-3">
          <h2 className="text-2xl text-blue-400 font-bold">1. Solo lo necesario para jugar</h2>
          <p className="leading-relaxed">
            Para que el tablero y las piezas funcionen con fluidez, nuestro sistema solo procesa la información estrictamente necesaria: tus movimientos en el tablero, el estado de la partida y tus resultados. No te pedimos información personal innecesaria para que puedas empezar a jugar de inmediato.
          </p>
        </div>

        {/* Sección 2 */}
        <div className="space-y-3">
          <h2 className="text-2xl text-blue-400 font-bold">2. Tu juego es privado</h2>
          <p className="leading-relaxed">
            Tus estrategias y tu estilo de juego te pertenecen. La información de las partidas se procesa en entornos seguros y <strong className="text-white">no compartimos ni vendemos</strong> tus datos, hábitos de juego o resultados a terceras empresas para fines publicitarios.
          </p>
        </div>

        {/* Sección 3 */}
        <div className="space-y-3">
          <h2 className="text-2xl text-blue-400 font-bold">3. Conexión Segura y Protegida</h2>
          <p className="leading-relaxed">
            Ya sea que juegues desde tu celular, tablet o computadora, nuestra plataforma utiliza estándares modernos de seguridad web. Esto significa que la conexión entre tu dispositivo y nuestro juego está protegida, evitando que terceros puedan interferir o alterar tu partida mientras juegas.
          </p>
        </div>

        {/* Sección 4 con viñetas */}
        <div className="space-y-4">
          <h2 className="text-2xl text-blue-400 font-bold">4. Cero Intrusiones en tu Dispositivo</h2>
          <p className="leading-relaxed">Nuestra aplicación está diseñada para ser ligera y respetuosa:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-400 marker:text-blue-500">
            <li>No rastreamos tu ubicación geográfica.</li>
            <li>No accedemos a la cámara, micrófono ni archivos personales de tu dispositivo.</li>
            <li>El soporte táctil avanzado solo detecta los toques dentro del tablero de ajedrez.</li>
          </ul>
        </div>

        {/* Sección 5 */}
        <div className="space-y-3">
          <h2 className="text-2xl text-blue-400 font-bold">5. Entorno Libre de Trampas</h2>
          <p className="leading-relaxed">
            Hemos diseñado el motor físico del juego para que respete estrictamente las reglas del ajedrez tradicional. Nuestro sistema valida cada movimiento para garantizar que todas las partidas sean justas y seguras para todos los jugadores.
          </p>
        </div>

        {/* Conclusión Destacada */}
        <div className="mt-12 bg-[#0f172a] border border-blue-900/30 p-6 rounded-2xl shadow-inner">
          <p className="text-xl text-center font-semibold text-blue-200">
            En resumen: En Neural Touch, tu privacidad está protegida por defecto. <br/>
            <span className="text-white font-bold mt-2 inline-block">¡Disfruta la partida!</span>
          </p>
        </div>

      </div>
    </div>
  );
}