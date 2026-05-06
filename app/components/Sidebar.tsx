"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// 🔥 Añadimos Menu y X (para el botón de abrir y cerrar en celular) 🔥
import { LayoutDashboard, GraduationCap, Sword, ShieldCheck, Settings, Trophy, Brain, Crown, ScrollText, UserCheck, FileBadge, Menu, X } from 'lucide-react';
import { db } from '../../lib/motorFirebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Sidebar() {
  const pathname = usePathname();
  const [esAdmin, setEsAdmin] = useState(false);
  const [esProfesor, setEsProfesor] = useState(false);
  const [rutaTorneos, setRutaTorneos] = useState('/torneo/unirse');
  
  // 🔥 ESTADO TÁCTICO: Controla si el menú está abierto en celulares 🔥
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  useEffect(() => {
    const verificarRango = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) return;

      try {
        const docSnap = await getDoc(doc(db, "usuarios", userId));
        if (docSnap.exists()) {
          const rol = docSnap.data().rol;
          if (rol === 'admin') {
            setEsAdmin(true);
          } else if (rol === 'profesor') {
            setEsProfesor(true);
          }
        }
      } catch (error) {
        console.error("Error en radar:", error);
      }
    };
    verificarRango();

    const rol = localStorage.getItem('user_role');
    if (rol === 'profesor') {
      setRutaTorneos('/profesor');
    } else {
      setRutaTorneos('/torneo/unirse');
    }
  }, []);

  // 🔥 AUTO-CIERRE: Cierra el menú en el celular cuando el usuario hace clic en un link 🔥
  useEffect(() => {
    setMenuMovilAbierto(false);
  }, [pathname]);

  if (pathname === '/' || pathname === '/terminos' || pathname === '/privacidad' || pathname.startsWith('/admin')) {
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: 'Panel principal', href: '/hub' },
    { icon: GraduationCap, label: 'Academia', href: '/academia' },
    { icon: Sword, label: 'Juega y gana', href: '/arena' },
    { icon: Brain, label: 'Entrenamiento Ciego', href: '/arena/ciegas' },
    { icon: ScrollText, label: 'Partidas historicas ', href: '/epicas' },
    { icon: Crown, label: 'Torneos', href: rutaTorneos },
    { icon: UserCheck, label: 'Panel Profesor', href: '/profesor', reqProfesor: true },
    { icon: ShieldCheck, label: 'Admin', href: '/admin', reqAdmin: true },
  ];

  const menuVisible = menuItems.filter(item => {
    if (item.reqAdmin && !esAdmin) return false;
    if (item.reqProfesor && !esProfesor && !esAdmin) return false;
    return true;
  });

  return (
    <>
      {/* 🔥 BOTÓN DE HAMBURGUESA (Flota arriba a la izquierda, SOLO EN MÓVIL) 🔥 */}
      <button 
        onClick={() => setMenuMovilAbierto(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-[#0B1121] border border-slate-700 rounded-lg text-white shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-slate-800 transition-colors"
      >
        <Menu size={24} />
      </button>

      {/* 🔥 OVERLAY DE CAMUFLAJE (Fondo oscuro que aparece al abrir el menú en el celular) 🔥 */}
      {menuMovilAbierto && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm transition-opacity"
          onClick={() => setMenuMovilAbierto(false)} // Cierra el menú si tocas fuera de él
        />
      )}

      {/* 🔥 LA BARRA LATERAL (Con animaciones para entrar y salir) 🔥 */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0B1121] border-r border-[#1E293B] flex flex-col p-6 shadow-2xl z-50 shrink-0 transform transition-transform duration-300 ease-in-out 
        ${menuMovilAbierto ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        
        {/* 🔥 BOTÓN PARA CERRAR EL MENÚ (La 'X' arriba a la derecha, SOLO MÓVIL) 🔥 */}
        <button 
          onClick={() => setMenuMovilAbierto(false)}
          className="md:hidden absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/50 p-1 rounded-md"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-10 px-2 mt-2 md:mt-0">
          <div className="bg-blue-500 p-2 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Trophy className="text-white" size={24} />
          </div>
          <span className="text-slate-100 font-bold text-xl tracking-tight">Chess & Academic</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {menuVisible.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/hub') 
                  ? 'bg-blue-500/20 text-blue-400' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={20} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}

          {!esProfesor && !esAdmin && (
            <Link
              href="/solicitar-rango"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group mt-6 border border-teal-500/30 bg-teal-500/5 text-teal-400 hover:bg-teal-500/20`}
            >
              <FileBadge size={20} className="group-hover:scale-110 transition-transform text-teal-500" />
              <span className="font-medium text-sm">Aplica ser Docente</span>
            </Link>
          )}
        </nav>

        <div className="mt-auto border-t border-[#1E293B] pt-6">
          <button className="flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-slate-200 w-full transition-colors">
            <Settings size={20} />
            <span className="text-sm font-medium">Configuración</span>
          </button>
        </div>
      </aside>
    </>
  );
}