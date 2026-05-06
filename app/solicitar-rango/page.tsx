"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../lib/motorFirebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ShieldCheck, Lock, UserPlus, GraduationCap, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SolicitarRangoPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [codigoActivacion, setCodigoActivacion] = useState("");

  const [estado, setEstado] = useState<'inicio' | 'pendiente' | 'error'>('inicio');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(""); 
  const router = useRouter();

  useEffect(() => {
    const verificarEstado = async () => {
      let userId = localStorage.getItem("user_name");
      if (!userId) return; 

      const docRef = doc(db, "solicitudes_profesor", userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        if (snap.data().estado === 'aprobado') {
           localStorage.setItem("user_role", "profesor");
           router.push("/profesor");
        } else {
           setEstado('pendiente');
        }
      }
    };
    verificarEstado();
  }, [router]);

  // 🔥 VALIDACIÓN MANUAL: Adiós a los bloqueos silenciosos del navegador 🔥
  const enviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Verificamos nosotros mismos que todo esté lleno
    if (!nombre.trim() || !apellido.trim() || !cedula.trim() || !institucion.trim()) {
        setMensaje("Comandante, debe llenar todos los campos obligatorios.");
        return;
    }

    setCargando(true);
    setMensaje(""); 

    // 2. Si no tiene ID (incógnito), le creamos uno
    let userId = localStorage.getItem("user_name");
    if (!userId) {
        userId = "Recluta_" + Math.floor(Math.random() * 10000);
        localStorage.setItem("user_name", userId);
        localStorage.setItem("user_role", "alumno"); // Rol base por defecto
    }

    // 3. Enviamos a la Base de Datos
    try {
      const codigoSecreto = "PRO-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      await setDoc(doc(db, "solicitudes_profesor", userId), {
        nombre: nombre.trim(), 
        apellido: apellido.trim(), 
        cedula: cedula.trim(), 
        institucion: institucion.trim(),
        estado: 'pendiente',
        codigo_requerido: codigoSecreto, 
        fecha: serverTimestamp()
      });
      setEstado('pendiente');
    } catch (err: any) {
      console.error(err);
      setMensaje("Error al conectar con la Base de Datos. Revisa los permisos de Firebase.");
    }
    setCargando(false);
  };

  const activarRango = async () => {
    setCargando(true);
    setMensaje("");
    const userId = localStorage.getItem("user_name");

    if (!userId) {
        setMensaje("Error crítico: No se encontró tu ID de usuario en este navegador.");
        setCargando(false);
        return;
    }

    const docRef = doc(db, "solicitudes_profesor", userId);
    const snap = await getDoc(docRef);

    if (snap.exists() && snap.data().codigo_requerido === codigoActivacion.trim()) {
      await updateDoc(docRef, { estado: 'aprobado' });
      localStorage.setItem("user_role", "profesor");
      alert("¡Rango de Profesor Activado, Comandante!");
      router.push("/profesor");
    } else {
      setMensaje("Código de activación inválido o incorrecto. Contacte al Administrador.");
    }
    setCargando(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0B1121] border border-slate-800 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

        {estado === 'inicio' ? (
          <>
            <div className="flex justify-center mb-6 text-blue-500"><UserPlus size={60}/></div>
            <h2 className="text-3xl font-black text-center uppercase tracking-tighter mb-2">Solicitar Rango</h2>
            <p className="text-slate-400 text-center text-sm mb-6 font-mono">Protocolo de Verificación Académica</p>

            {mensaje && (
                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-3 rounded-xl text-xs text-center mb-4 font-bold flex items-center gap-2 justify-center">
                    <AlertTriangle size={16}/> {mensaje}
                </div>
            )}

            {/* Le quitamos la etiqueta form para evitar que el navegador interfiera */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nombre" value={nombre} onChange={e=>setNombre(e.target.value)} className="bg-[#020617] border border-slate-700 p-3 rounded-xl outline-none focus:border-blue-500 text-sm" />
                <input placeholder="Apellido" value={apellido} onChange={e=>setApellido(e.target.value)} className="bg-[#020617] border border-slate-700 p-3 rounded-xl outline-none focus:border-blue-500 text-sm" />
              </div>
              <input placeholder="ID / Cédula" value={cedula} onChange={e=>setCedula(e.target.value)} className="w-full bg-[#020617] border border-slate-700 p-3 rounded-xl outline-none focus:border-blue-500 text-sm" />
              <input placeholder="Institución (Ej: IPCAS)" value={institucion} onChange={e=>setInstitucion(e.target.value)} className="w-full bg-[#020617] border border-slate-700 p-3 rounded-xl outline-none focus:border-blue-500 text-sm" />
              
              {/* Usamos un botón normal tipo "button" y le pasamos la función al onClick */}
              <button type="button" onClick={enviarSolicitud} disabled={cargando} className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex justify-center items-center">
                {cargando ? <Loader2 className="animate-spin"/> : "Enviar Credenciales"}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <CheckCircle2 className="text-emerald-500 mx-auto mb-4" size={60}/>
            <h2 className="text-2xl font-black uppercase">Solicitud Pendiente</h2>
            <p className="text-slate-400 text-sm mt-2 mb-6">Tus datos están en revisión. Ingresa el código proporcionado por el Administrador para activar tu cuenta.</p>

            {mensaje && (
                <div className="bg-rose-500/10 border border-rose-500/50 text-rose-500 p-3 rounded-xl text-xs text-center mb-4 font-bold flex items-center gap-2 justify-center">
                    <AlertTriangle size={16}/> {mensaje}
                </div>
            )}

            <div className="space-y-4 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Código de Activación</label>
               <input placeholder="PRO-XXXXX" value={codigoActivacion} onChange={e=>setCodigoActivacion(e.target.value)} className="w-full bg-[#020617] border border-slate-700 p-4 rounded-xl text-center font-mono text-xl text-emerald-400 uppercase outline-none focus:border-emerald-500" />
               <button type="button" onClick={activarRango} disabled={cargando} className="w-full bg-emerald-600 py-4 rounded-xl font-black uppercase tracking-widest flex justify-center items-center">
                   {cargando ? <Loader2 className="animate-spin"/> : "Activar Rango"}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}