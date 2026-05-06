import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen w-full bg-[#020617] p-10 md:p-20">
      <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-white transition-colors mb-10 font-bold">
        <ArrowLeft size={20} /> Volver a la página principal
      </Link>
      
      <div className="max-w-4xl mx-auto bg-[#0B1121] border border-slate-800 p-10 md:p-16 rounded-3xl shadow-2xl text-slate-300 space-y-6">
        <h1 className="text-4xl text-white font-extrabold mb-8">Política de Privacidad Integral</h1>
        
        <h2 className="text-2xl text-white font-bold mt-8">Protección de Datos Estratégicos</h2>
        <p>En Ajedrez Neural tomamos la privacidad de sus datos analíticos con la máxima seriedad. La información recopilada incluye, pero no se limita a:</p>
        <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-400">
          <li>Tiempos de respuesta (milisegundos) en la resolución de problemas.</li>
          <li>Precisión táctica y detección de errores (Blunders, Mistakes).</li>
          <li>Patrones de navegación dentro de La Academia y El Coliseo.</li>
        </ul>

        <h2 className="text-2xl text-white font-bold mt-8">Uso de la Información</h2>
        <p>Los datos son procesados exclusivamente por nuestros algoritmos para generar curvas de dificultad personalizadas. No vendemos ni compartimos sus datos de rendimiento con terceros.</p>
      </div>
    </div>
  );
}