"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, Home, Loader2 } from 'lucide-react';

export default function Centinela({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 1. ZONAS PÚBLICAS
  const rutasPublicas = ['/', '/terminos', '/privacidad', '/login', '/registro', '/solicitar-rango'];
  
  // Verificamos de inmediato si la ruta actual es pública.
  const esPublica = rutasPublicas.includes(pathname || '');

  // 🔥 EL TRUCO MAESTRO 🔥
  // Si la ruta es pública, verificando arranca en FALSE. ¡Carga instantáneamente!
  // Si es privada, arranca en TRUE para encender el radar.
  const [verificando, setVerificando] = useState(!esPublica);
  const [autorizado, setAutorizado] = useState(esPublica);

  useEffect(() => {
    try {
      const userId = localStorage.getItem('user_id');
      const userRole = localStorage.getItem('user_role');

      // AUTO-LOGIN MÁGICO: Si está en la portada y YA tiene cuenta
      if (pathname === '/' && userId) {
        router.push(userRole === 'profesor' ? '/profesor' : '/hub');
        return;
      }

      // Si es ruta pública, ya lo dejamos pasar arriba, así que no hacemos nada más
      if (esPublica) {
        return;
      }

      // ⛔ EL MURO: Si es privada y NO tiene cuenta
      if (!userId) {
        setAutorizado(false);
        setVerificando(false);
        return;
      }

      // ✅ PASE VIP: Si es privada y SÍ tiene cuenta
      setAutorizado(true);
      setVerificando(false);

    } catch (error) {
      console.error("Fallo en el radar del Centinela:", error);
      // Si el incógnito bloquea la lectura, apagamos la carga para no congelar la pantalla
      setVerificando(false); 
    }
  }, [pathname, router, esPublica]);

  // Pantalla de carga (AHORA SOLO SE VERÁ EN RUTAS PRIVADAS)
  if (verificando) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center text-blue-500 font-black">
        <Loader2 className="animate-spin mb-4" size={40}/> IDENTIFICANDO RECLUTA...
      </div>
    );
  }

  // Pantalla de Bloqueo
  if (!autorizado) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-950/20 border border-red-900/50 p-10 rounded-[3rem] max-w-lg w-full flex flex-col items-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
          <ShieldAlert size={80} className="text-red-500 mb-6" />
          <h1 className="text-3xl font-black text-white uppercase mb-2 tracking-tighter">Acceso Restringido</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Comandante, el radar detecta que no estás identificado en la matriz. Los reclutas que intentan infiltrarse por la puerta trasera son enviados al calabozo. 
            <br/><br/>
            <span className="text-white font-bold">Debes iniciar sesión o registrarte primero.</span>
          </p>
          
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)]"
          >
            <Home size={20} /> Volver a la Base Principal
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}