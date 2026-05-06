"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, FileText, ShieldAlert, ChevronRight, BrainCircuit, Loader2, 
  User, Lock, GraduationCap, Shield, UserPlus, Info, X, Award, 
  Code, Palette, Database, BookOpen 
} from 'lucide-react';

import { db, auth } from '../lib/motorFirebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function LandingPage() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  
  const [modo, setModo] = useState<'inicio' | 'seleccion_rol' | 'login_alumno' | 'registro_alumno'>('inicio');
  const [mostrarProyecto, setMostrarProyecto] = useState(false);

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");

  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  // ⚡ LÓGICA BLINDADA: REGISTRO DE NUEVO ALUMNO ⚡
  const registrarAlumno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !password.trim() || !correo.trim()) return;
    setCargando(true); setError("");

    try {
      const credenciales = await createUserWithEmailAndPassword(auth, correo.trim(), password);
      const usuarioFirebase = credenciales.user;

      const userRef = doc(db, "usuarios", usuarioFirebase.uid);
      await setDoc(userRef, {
        id: usuarioFirebase.uid,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        rol: 'alumno',
        xp: 0,
        niveles_completados: [],
        baneado: false,
        fecha_registro: new Date().toISOString()
      });

      localStorage.setItem("user_id", usuarioFirebase.uid);
      localStorage.setItem("user_name", nombre.trim());
      localStorage.setItem("user_role", "alumno");
      
      alert("¡Registro Exitoso! Viajando al Hub...");
      router.push('/hub');

    } catch (err: any) {
      console.error(err);
      alert("🚨 FALLO EN REGISTRO: " + err.message); 
      if (err.code === 'auth/email-already-in-use') setError("Este correo ya pertenece a un recluta.");
      else if (err.code === 'auth/weak-password') setError("La contraseña debe tener al menos 6 caracteres.");
      else setError("Fallo en la conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  // ⚡ LÓGICA BLINDADA: INICIO DE SESIÓN ALUMNO ⚡
  const loginAlumno = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!correo.trim() || !password.trim()) return;
    setCargando(true); setError("");

    try {
      const credenciales = await signInWithEmailAndPassword(auth, correo.trim(), password);
      const usuarioFirebase = credenciales.user;

      const userRef = doc(db, "usuarios", usuarioFirebase.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        alert("🚨 ERROR: El perfil existe en Firebase Auth, pero no hay datos en Firestore.");
        setError("Error de sincronización: Perfil no encontrado en la base.");
        setCargando(false);
        return;
      }

      const userData = docSnap.data();

      localStorage.setItem("user_id", usuarioFirebase.uid);
      localStorage.setItem("user_name", userData.nombre);
      localStorage.setItem("user_role", userData.rol || "alumno");
      
      if (userData.rol === "profesor") {
          router.push('/profesor');
      } else {
          router.push('/hub');
      }

    } catch (err: any) {
      console.error(err);
      alert("🚨 FALLO DE CONEXIÓN: " + err.message); 
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Credenciales incorrectas. Acceso denegado.");
      } else {
        setError("Error al contactar con el cuartel general.");
      }
    } finally {
      setCargando(false);
    }
  };

  if (!isClient) return <div className="min-h-screen bg-[#020617]" />;

  return (
    <div className="min-h-screen flex flex-col w-full relative overflow-x-hidden bg-[#020617] font-sans">
      
      {/* FONDOS NEURALES */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/20 blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* NAVEGACIÓN SUPERIOR Y BOTÓN DE CRÉDITOS */}
      <nav className="w-full p-6 flex justify-between items-center z-20">
        <div className="font-extrabold text-2xl tracking-tighter text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.6)]">A</div>
          CHESS
        </div>
        <button 
          onClick={() => setMostrarProyecto(true)} 
          className="flex items-center gap-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all backdrop-blur-sm shadow-[0_0_15px_rgba(79,70,229,0.3)]"
        >
          <Info size={16} /> Proyecto Técnico
        </button>
      </nav>

      {/* ================= MODAL DEL PROYECTO (CRÉDITOS Y PRESENTACIÓN) ================= */}
      {mostrarProyecto && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/90 backdrop-blur-md flex items-center justify-center p-4 lg:p-8">
          <div className="bg-[#0B1121] border border-blue-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(59,130,246,0.15)] relative custom-scrollbar">
            
            {/* Cabecera del Modal */}
            <div className="sticky top-0 bg-[#0B1121]/95 backdrop-blur z-10 border-b border-slate-800 p-6 flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-xl h-16 w-16 flex items-center justify-center shadow-lg">
                  <img src="http://ipcas.edu.do/images/logo2.png" alt="Logo IPCAS" className="max-h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight leading-none mb-1">Instituto Politécnico Cardenal Sancha</h2>
                  <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Distrito Educativo 15-02</p>
                </div>
              </div>
              <button onClick={() => setMostrarProyecto(false)} className="text-slate-500 hover:text-rose-500 transition-colors bg-slate-800/50 p-2 rounded-full">
                <X size={24} />
              </button>
            </div>

            {/* Contenido del Proyecto */}
            <div className="p-6 lg:p-10 space-y-10">
              
              {/* 🔥 PRESENTACIÓN FORMAL MEJORADA 🔥 */}
              <section>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-blue-500"/> 📄 Memoria Descriptiva y Propuesta de Implementación
                </h3>
                <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-2xl text-slate-300 text-sm leading-relaxed text-justify space-y-6">
                  
                  <div>
                    <h4 className="text-white font-bold text-base mb-2">1. Introducción al Proyecto</h4>
                    <p>En la era digital actual, el sistema educativo se enfrenta al reto de desarrollar herramientas que no solo transmitan información, sino que forjen el pensamiento crítico, la memoria espacial y la resolución de problemas complejos. <strong>"Chess & Academy" (Red Neural)</strong> nace como una respuesta tecnológica a esta necesidad. No es simplemente una plataforma para jugar ajedrez; es un <strong>Sistema Integrado de Evaluación Cognitiva</strong>, diseñado específicamente para integrarse en el currículo escolar de instituciones educativas modernas.</p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-base mb-2">2. La Visión Pedagógica</h4>
                    <p>El objetivo principal de implementar esta plataforma en las escuelas es transformar el ajedrez escolar de una simple actividad recreativa a un <strong>instrumento de medición académica estandarizado</strong>. A través de nuestra plataforma, buscamos que las instituciones puedan evaluar competencias blandas y analíticas que son difíciles de medir en un examen tradicional de papel y lápiz, tales como la toma de decisiones bajo extrema presión, la gestión del tiempo y el pensamiento anticipatorio.</p>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-base mb-2">3. Pilares Tecnológicos y Académicos</h4>
                    <p className="mb-2">Para lograr esta evolución cognitiva en las aulas, el proyecto se sostiene en cuatro pilares fundamentales:</p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-400">
                      <li><strong className="text-blue-400">Laboratorio de Entrenamiento (La Forja Neural):</strong> Los estudiantes estudian a través de módulos interactivos. Esto incluye táctica, estructura posicional y el innovador "Entrenamiento Ciego" (privación sensorial), el cual fuerza al cerebro a expandir su memoria de trabajo y retención visual.</li>
                      <li><strong className="text-blue-400">Auditoría y Evaluación Automatizada:</strong> A diferencia del ajedrez físico, la plataforma rastrea cada jugada en tiempo real. El motor integrado evalúa la precisión, cuenta los errores graves y las jugadas brillantes, entregando al docente una radiografía técnica instantánea del desempeño del alumno.</li>
                      <li><strong className="text-blue-400">Marco Institucional y Expedientes Legales:</strong> El sistema cuenta con un panel exclusivo de "Autoridad Docente". Los profesores actúan como árbitros digitales con la capacidad de generar un <strong>Documento Oficial en PDF</strong> al finalizar un combate, dándole validez institucional a la nota.</li>
                      <li><strong className="text-blue-400">Trazabilidad y Disciplina:</strong> La plataforma monitorea el comportamiento, registrando desconexiones intencionales y participación, fomentando un entorno de respeto, constancia y sana competencia.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-base mb-2">4. Impacto Esperado en el Entorno Escolar</h4>
                    <p>La implementación proporciona a los centros educativos un laboratorio de datos en tiempo real. Los docentes de Educación Física o Matemáticas podrán justificar calificaciones basándose en reportes técnicos inviolables. Al mismo tiempo, los estudiantes se verán inmersos en un entorno gamificado que habla su mismo idioma tecnológico, motivándolos a mejorar su lógica matemática de forma natural y voluntaria.</p>
                  </div>

                </div>
              </section>

              {/* Equipo de Desarrollo */}
              <section>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2 mb-6 flex items-center gap-2">
                  <GraduationCap size={16} className="text-emerald-500"/> Escuadrón de Desarrollo (4to DAAI)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Tarjeta del Lider (TÚ) */}
                  <div className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/50 p-6 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10"><Award size={120} /></div>
                    <div className="bg-blue-500 text-white w-14 h-14 rounded-full flex items-center justify-center font-black text-xl shrink-0 shadow-lg">16</div>
                    <div className="text-center sm:text-left z-10">
                      <div className="inline-block bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">Líder & Creador de la Idea</div>
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight">Starlin Alexander Gomez Lopez</h4>
                      <p className="text-blue-300 text-sm font-bold flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <Code size={16}/> Desarrollo de Arquitectura y Lógica Estructural
                      </p>
                    </div>
                  </div>

                  {/* Resto del Equipo */}
                  <div className="bg-[#020617] border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-600 transition-colors">
                    <div className="bg-slate-800 text-slate-400 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0">01</div>
                    <div>
                      <h4 className="text-lg font-bold text-white uppercase">Ailish</h4>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-1"><Palette size={14}/> Diseño de UI/UX (Experiencia de Usuario)</p>
                    </div>
                  </div>

                  <div className="bg-[#020617] border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-600 transition-colors">
                    <div className="bg-slate-800 text-slate-400 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0">05</div>
                    <div>
                      <h4 className="text-lg font-bold text-white uppercase">Dilan</h4>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-1"><ShieldAlert size={14}/> Tester de Calidad (QA) y Pruebas</p>
                    </div>
                  </div>

                  <div className="bg-[#020617] border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-600 transition-colors">
                    <div className="bg-slate-800 text-slate-400 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0">22</div>
                    <div>
                      <h4 className="text-lg font-bold text-white uppercase">Perla</h4>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-1"><Database size={14}/> Estructuración y Gestión de Entorno</p>
                    </div>
                  </div>

                  <div className="bg-[#020617] border border-slate-800 p-5 rounded-2xl flex items-center gap-4 hover:border-slate-600 transition-colors">
                    <div className="bg-slate-800 text-slate-400 w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0">12</div>
                    <div>
                      <h4 className="text-lg font-bold text-white uppercase">Jhosmeidy</h4>
                      <p className="text-slate-400 text-xs flex items-center gap-1 mt-1"><BookOpen size={14}/> Documentación y Recopilación Teórica</p>
                    </div>
                  </div>

                </div>
              </section>

            </div>
          </div>
        </div>
      )}

      {/* ================= CUERPO PRINCIPAL ================= */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-8 lg:px-24 z-10 mt-4 lg:mt-10">
        
        <div className="flex-1 text-left">
          <div className="inline-block border border-blue-500/30 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-6">
            Chess.academy.2.00
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-white leading-[1.1]">
            Aprende como  <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              nadie
            </span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
            Abandona la teoría aburrida. Entrena tu mente con el primer simulador de ajedrez que analiza tus debilidades y te forja con visión de Gran Maestro.
          </p>

          {error && (
            <p className="text-red-400 font-bold mb-4 bg-red-500/10 border border-red-500/20 py-2 px-4 rounded-lg inline-block">
              {error}
            </p>
          )}

          <div className="flex flex-col items-start gap-4 w-full max-w-md">
            
            {modo === 'inicio' && (
              <button onClick={() => setModo('seleccion_rol')} className="inline-flex group bg-white text-[#020617] font-bold text-lg px-8 py-4 rounded-full items-center gap-3 hover:bg-blue-50 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Iniciar Entrenamiento <ChevronRight size={22} />
              </button>
            )}

            {modo === 'seleccion_rol' && (
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                 <button onClick={() => setModo('login_alumno')} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white p-6 rounded-2xl font-black uppercase tracking-widest flex flex-col items-center gap-3 transition-all shadow-lg hover:-translate-y-1">
                    <GraduationCap size={40}/>
                    Soy Alumno
                 </button>
                 <button onClick={() => router.push('/solicitar-rango')} className="flex-1 bg-slate-800 border border-slate-700 hover:border-emerald-500 hover:bg-slate-700 text-white p-6 rounded-2xl font-black uppercase tracking-widest flex flex-col items-center gap-3 transition-all shadow-lg hover:-translate-y-1">
                    <Shield size={40} className="text-emerald-500"/>
                    Soy Profesor
                 </button>
              </div>
            )}

            {modo === 'login_alumno' && (
              <form onSubmit={loginAlumno} className="flex flex-col gap-4 w-full bg-[#0B1121] p-6 rounded-3xl border border-slate-800 shadow-2xl">
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2"><Lock size={20} className="text-blue-500"/> Acceso de Recluta</h3>
                
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input required autoFocus type="email" placeholder="Correo Electrónico..." className="w-full bg-[#020617] border border-slate-700 p-4 pl-12 rounded-xl outline-none focus:border-blue-500 text-white transition-all text-sm" value={correo} onChange={(e) => setCorreo(e.target.value)} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input required type="password" placeholder="Contraseña..." className="w-full bg-[#020617] border border-slate-700 p-4 pl-12 rounded-xl outline-none focus:border-blue-500 text-white transition-all text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                
                <button type="submit" disabled={cargando} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black uppercase tracking-widest transition-all mt-2 disabled:opacity-50 flex justify-center">
                  {cargando ? <Loader2 className="animate-spin" /> : "Entrar a la Base"}
                </button>

                <p className="text-slate-400 text-xs text-center mt-2">
                  ¿Es tu primera vez? <button type="button" onClick={() => setModo('registro_alumno')} className="text-blue-400 font-bold hover:underline">Regístrate aquí</button>
                </p>
              </form>
            )}

            {modo === 'registro_alumno' && (
              <form onSubmit={registrarAlumno} className="flex flex-col gap-4 w-full bg-[#0B1121] p-6 rounded-3xl border border-slate-800 shadow-2xl">
                <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2"><UserPlus size={20} className="text-emerald-500"/> Nuevo Recluta</h3>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="relative">
                     <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                     <input required autoFocus type="text" placeholder="Nombre" className="w-full bg-[#020617] border border-slate-700 p-3 pl-10 rounded-xl outline-none focus:border-emerald-500 text-white text-sm" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                   </div>
                   <input required type="text" placeholder="Apellido" className="w-full bg-[#020617] border border-slate-700 p-3 rounded-xl outline-none focus:border-emerald-500 text-white text-sm" value={apellido} onChange={(e) => setApellido(e.target.value)} />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required type="email" placeholder="Correo Electrónico" className="w-full bg-[#020617] border border-slate-700 p-3 pl-12 rounded-xl outline-none focus:border-emerald-500 text-white text-sm" value={correo} onChange={(e) => setCorreo(e.target.value)} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input required type="password" placeholder="Crea una Contraseña (mínimo 6)" className="w-full bg-[#020617] border border-slate-700 p-3 pl-12 rounded-xl outline-none focus:border-emerald-500 text-white text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                
                <button type="submit" disabled={cargando} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl font-black uppercase tracking-widest transition-all mt-2 disabled:opacity-50 flex justify-center">
                  {cargando ? <Loader2 className="animate-spin" /> : "Crear Perfil"}
                </button>

                <p className="text-slate-400 text-xs text-center mt-2">
                  ¿Ya tienes cuenta? <button type="button" onClick={() => setModo('login_alumno')} className="text-emerald-400 font-bold hover:underline">Inicia Sesión</button>
                </p>
              </form>
            )}

          </div>
        </div>

        <div className="flex-1 relative w-full max-w-lg hidden md:block">
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800 animate-[bounce_4s_infinite]">
            <img src="https://th.bing.com/th/id/OIP.DIIiTobBpYFKbx5FuryVpAHaEB?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3" alt="Ajedrez de Alta Gama" className="w-full h-[400px] object-cover opacity-90 hover:opacity-100 transition-opacity" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-[#0B1121] p-6 rounded-2xl border border-slate-800 shadow-xl z-20 animate-[pulse_3s_infinite]">
            <div className="items-center gap-4 flex">
              <BrainCircuit className="text-blue-400 w-10 h-10" />
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Análisis en curso</p>
                <p className="text-white font-bold">Patrones Tácticos +85%</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full mt-24 py-10 border-t border-slate-800 bg-[#0B1121]/50 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4 flex-col md:flex-row">
            <img 
              src="http://ipcas.edu.do/images/logo2.png" 
              alt="Logo IPCAS" 
              className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" 
            />
            <div className="text-slate-500 text-sm font-medium text-center md:text-left">
              © 2026 chess & academy. Hecho y distribuido por STARLIN.
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <Link href="/terminos" className="text-slate-400 hover:text-blue-400 flex items-center gap-2 text-sm transition-colors font-medium">
              <FileText size={16} /> Términos y Condiciones
            </Link>
            <Link href="/privacidad" className="text-slate-400 hover:text-blue-400 flex items-center gap-2 text-sm transition-colors font-medium">
              <ShieldAlert size={16} /> Política de Privacidad
            </Link>
            <a href="mailto:gomezstarlin58@gmail.com" className="text-white bg-blue-600/20 border border-blue-500/30 px-5 py-2 rounded-lg hover:bg-blue-600 hover:text-white flex items-center gap-2 text-sm transition-all font-bold">
              <Mail size={16} /> gomezstarlin58@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}