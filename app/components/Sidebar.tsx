"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// 🔥 Añadimos UserCheck (para el profesor) y FileBadge (para la solicitud) 🔥
import { LayoutDashboard, GraduationCap, Sword, ShieldCheck, Settings, Trophy, Brain, Crown, ScrollText, UserCheck, FileBadge } from 'lucide-react';
import { db } from '../../lib/motorFirebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Sidebar() {
  const pathname = usePathname();
  const [esAdmin, setEsAdmin] = useState(false);
  const [esProfesor, setEsProfesor] = useState(false); // 🔥 Nuevo estado para el Profesor
  const [rutaTorneos, setRutaTorneos] = useState('/torneo/unirse');

  useEffect(() => {
    const verificarRango = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) return;

      try {
        // SEGURIDAD AVANZADA: Leemos la base de datos real, no confiamos en el navegador
        const docSnap = await getDoc(doc(db, "usuarios", userId));
        if (docSnap.exists()) {
          const rol = docSnap.data().rol;
          if (rol === 'admin') {
            setEsAdmin(true);
          } else if (rol === 'profesor') {
            setEsProfesor(true); // Autorización concedida
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

  // Ocultamos este menú en la portada y dentro del panel de Admin
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
    // 🔥 BOTÓN RESTRINGIDO: Panel Profesor 🔥
    { icon: UserCheck, label: 'Panel Profesor', href: '/profesor', reqProfesor: true },
    // 🔥 BOTÓN RESTRINGIDO: Admin 🔥
    { icon: ShieldCheck, label: 'Admin', href: '/admin', reqAdmin: true },
  ];

  // Filtro de Seguridad Inteligente
  const menuVisible = menuItems.filter(item => {
    if (item.reqAdmin && !esAdmin) return false; // Solo el admin pasa
    if (item.reqProfesor && !esProfesor && !esAdmin) return false; // Solo profe (o admin) pasa
    return true;
  });

  return (
    <aside className="w-64 bg-[#0B1121] border-r border-[#1E293B] h-screen sticky top-0 flex flex-col p-6 shadow-2xl z-50 shrink-0">
      <div className="flex items-center gap-3 mb-10 px-2">
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

        {/* 🔥 BOTÓN SOLICITUD DE RANGO (Solo para reclutas) 🔥 */}
        {!esProfesor && !esAdmin && (
          <Link
            href="/solicitar-rango"
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group mt-6 border border-teal-500/30 bg-teal-500/5 text-teal-400 hover:bg-teal-500/20`}
          >
            <FileBadge size={20} className="group-hover:scale-110 transition-transform text-teal-500" />
            <span className="font-medium text-sm">Ser Docente</span>
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
  );
}