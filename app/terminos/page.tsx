import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TerminosPage() {
  return (
    <div className="min-h-screen w-full bg-[#020617] p-10 md:p-20">
      <Link href="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-white transition-colors mb-10 font-bold">
        <ArrowLeft size={20} /> Volver a la página principal
      </Link>
      
      <div className="max-w-4xl mx-auto bg-[#0B1121] border border-slate-800 p-10 md:p-16 rounded-3xl shadow-2xl text-slate-300 space-y-6">
        <h1 className="text-4xl text-white font-extrabold mb-8">Términos y Condiciones de Uso</h1>
        <p><strong>Última actualización:</strong> 13 de Abril de 2026</p>
        
        <h2 className="text-2xl text-white font-bold mt-8">1. Aceptación de los Términos</h2>
        <p>Al acceder y utilizar la plataforma "Ajedrez Neural", el usuario acepta estar sujeto a los presentes Términos y Condiciones. Esta plataforma es un simulador avanzado diseñado exclusivamente para el análisis cognitivo y táctico del ajedrez.</p>
        
        <h2 className="text-2xl text-white font-bold mt-8">2. Uso del Motor Analítico</h2>
        <p>El sistema provee evaluaciones basadas en redes neuronales y cálculos de profundidad extrema. El usuario comprende que la plataforma registra las decisiones tomadas en el tablero para generar un perfil psicológico con el único fin de mejorar su entrenamiento.</p>
        
        <h2 className="text-2xl text-white font-bold mt-8">3. Propiedad Intelectual</h2>
        <p>Toda la arquitectura, interfaz, el flujo de "Aprendizaje Socrático" y metodologías presentadas son propiedad intelectual desarrollada por Starlin Gómez. Queda prohibida su copia o distribución sin autorización previa.</p>
      </div>
    </div>
  );
}