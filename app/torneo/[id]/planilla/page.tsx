"use client";
import React, { useState, useEffect, useRef, use } from 'react';
import { db } from '../../../../lib/motorFirebase';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { Loader2, Printer, Target, BrainCircuit, PenLine, ShieldCheck, AlertTriangle, Camera, X, Settings2, Save, Lock } from 'lucide-react';

export default function DocumentoOficialPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const salaId = resolvedParams.id;
  const [sala, setSala] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  // 🔥 SEGURIDAD Y ROLES 🔥
  const [esProfesor, setEsProfesor] = useState(false);
  const [miNombre, setMiNombre] = useState("");
  const [datosCargados, setDatosCargados] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // --- CONFIGURACIÓN DEL PERFIL DEL ÁRBITRO ---
  const [modalPerfil, setModalPerfil] = useState(false);
  const [nombreArbitro, setNombreArbitro] = useState("");
  const [escuela, setEscuela] = useState("Instituto Politécnico Cardenal Sancha");
  const [colorFirma, setColorFirma] = useState("#b91c1c");
  
  // 🔥 ESTADOS DE LA CÁMARA PARA FIRMA FÍSICA 🔥
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [firmaFisicaBase64, setFirmaFisicaBase64] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- MÉTRICAS Y NOTAS (LOCALES PARA EL PROFESOR) ---
  const [numPartida, setNumPartida] = useState("1");
  const [feedbackTactico, setFeedbackTactico] = useState("");
  const [feedbackComportamiento, setFeedbackComportamiento] = useState("");
  const [notaBlancas, setNotaBlancas] = useState("");
  const [notaNegras, setNotaNegras] = useState("");
  const [movsBlancas, setMovsBlancas] = useState("");
  const [mejoresBlancas, setMejoresBlancas] = useState("");
  const [erroresBlancas, setErroresBlancas] = useState("");
  const [precisionBlancas, setPrecisionBlancas] = useState("");
  const [movsNegras, setMovsNegras] = useState("");
  const [mejoresNegras, setMejoresNegras] = useState("");
  const [erroresNegras, setErroresNegras] = useState("");
  const [precisionNegras, setPrecisionNegras] = useState("");

  useEffect(() => {
    const rol = localStorage.getItem("user_role");
    const esProfe = rol === "profesor";
    setEsProfesor(esProfe);
    setMiNombre(localStorage.getItem("user_name") || "");

    const unsubscribe = onSnapshot(doc(db, "torneos_pvp", salaId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setSala(data);
        
        if (!datosCargados && data.evaluacion) {
           setNumPartida(data.evaluacion.numPartida || "1");
           setNotaBlancas(data.evaluacion.notaBlancas || "");
           setNotaNegras(data.evaluacion.notaNegras || "");
           setFeedbackTactico(data.evaluacion.feedbackTactico || "");
           setFeedbackComportamiento(data.evaluacion.feedbackComportamiento || "");
           setMovsBlancas(data.evaluacion.movsBlancas || "");
           setMejoresBlancas(data.evaluacion.mejoresBlancas || "");
           setErroresBlancas(data.evaluacion.erroresBlancas || "");
           setPrecisionBlancas(data.evaluacion.precisionBlancas || "");
           setMovsNegras(data.evaluacion.movsNegras || "");
           setMejoresNegras(data.evaluacion.mejoresNegras || "");
           setErroresNegras(data.evaluacion.erroresNegras || "");
           setPrecisionNegras(data.evaluacion.precisionNegras || "");
           setDatosCargados(true);
        }
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, [salaId, datosCargados]);

  useEffect(() => {
    if (esProfesor) {
      const profeId = localStorage.getItem("user_name") || "general";
      getDoc(doc(db, "perfiles_arbitros", profeId)).then(snap => {
        if (snap.exists()) {
          const p = snap.data();
          setNombreArbitro(p.nombre);
          setEscuela(p.escuela);
          setColorFirma(p.color || "#b91c1c");
          setFirmaFisicaBase64(p.firmaFisica || null);
        } else {
          setModalPerfil(true); 
        }
      });
    }
  }, [esProfesor]);

  const guardarEvaluacionOficial = async () => {
    if (!esProfesor) return;
    setGuardando(true);
    await updateDoc(doc(db, "torneos_pvp", salaId), {
      evaluacion: {
        numPartida, notaBlancas, notaNegras, feedbackTactico, feedbackComportamiento,
        movsBlancas, mejoresBlancas, erroresBlancas, precisionBlancas,
        movsNegras, mejoresNegras, erroresNegras, precisionNegras
      }
    });
    setGuardando(false);
    alert("¡Reporte Guardado Oficialmente en la Red Neural!");
  };

  const abrirCamara = async () => {
    setMostrarCamara(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Comandante, no se pudo acceder al escáner óptico.");
      setMostrarCamara(false);
    }
  };

  const capturarFirma = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      setFirmaFisicaBase64(canvasRef.current.toDataURL('image/png'));
      cerrarCamara();
    }
  };

  const cerrarCamara = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setMostrarCamara(false);
  };

  const guardarPerfilArbitro = async () => {
    if (!nombreArbitro || !escuela) return alert("Campos obligatorios.");
    const profeId = localStorage.getItem("user_name") || "general";
    await setDoc(doc(db, "perfiles_arbitros", profeId), {
      nombre: nombreArbitro, escuela, color: colorFirma, firmaFisica: firmaFisicaBase64
    });
    setModalPerfil(false);
  };

  const firmarComoArbitro = async () => {
    const firma = {
      nombre: nombreArbitro, escuela, fecha: new Date().toLocaleString(),
      color: colorFirma, firmaFisica: firmaFisicaBase64
    };
    await updateDoc(doc(db, "torneos_pvp", salaId), { firmaDocente: firma });
  };

  const firmarJugador = async (bando: 'w' | 'b') => {
    const jugadorCorrespondiente = bando === 'w' ? sala.jugador_blancas : sala.jugador_negras;
    if (miNombre !== jugadorCorrespondiente) {
      return alert(`Acceso Denegado. Solo el jugador [${jugadorCorrespondiente}] puede firmar esta casilla.`);
    }
    const fecha = new Date().toLocaleString();
    const key = bando === 'w' ? 'firmaBlancas' : 'firmaNegras';
    await updateDoc(doc(db, "torneos_pvp", salaId), {
      [key]: { nombre: miNombre, fecha }
    });
  };

  // 🔥 ESCUDOS PROTECTORES DE RENDERIZADO 🔥
  if (cargando) return <div className="h-screen bg-white flex items-center justify-center text-rose-600 font-black"><Loader2 className="animate-spin mr-2"/> ABRIENDO DOCUMENTO CLASIFICADO...</div>;
  if (!sala) return <div className="h-screen bg-slate-100 flex flex-col items-center justify-center text-rose-600 font-black text-2xl uppercase tracking-widest"><AlertTriangle size={60} className="mb-4"/> ARCHIVO CLASIFICADO NO ENCONTRADO</div>;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-8 print:p-0 print:bg-white relative">
      
      <style dangerouslySetInnerHTML={{__html: `
        aside, nav, header { display: none !important; }
        @media print {
          @page { size: A4; margin: 10mm; }
          .no-print { display: none !important; }
          .hoja-a4 { box-shadow: none !important; margin: 0 !important; width: 100% !important; border: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .firma-blend { mix-blend-mode: multiply; filter: grayscale(100%) contrast(150%); }
        }
      `}} />

      {!esProfesor && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest no-print flex items-center gap-2 backdrop-blur z-50 shadow-xl">
          <Lock size={16}/> MODO SOLO LECTURA (RANGO: ALUMNO)
        </div>
      )}

      {modalPerfil && esProfesor && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-sm flex items-center justify-center p-4 no-print overflow-y-auto">
            <div className="bg-[#0B1121] border border-rose-500/30 p-8 rounded-[2rem] max-w-md w-full shadow-2xl relative my-8">
                <button onClick={() => setModalPerfil(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>
                <PenLine className="text-rose-500 mb-4" size={40}/>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Perfil de Autoridad</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Nombre y Apellidos..." value={nombreArbitro} onChange={e=>setNombreArbitro(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none text-sm" />
                    <input type="text" placeholder="Institución..." value={escuela} onChange={e=>setEscuela(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none text-sm" />
                    <div className="flex items-center gap-4 bg-[#020617] border border-slate-700 p-3 rounded-xl">
                        <label className="text-xs text-slate-400 font-bold uppercase flex-1">Color de Tinta:</label>
                        <input type="color" value={colorFirma} onChange={e=>setColorFirma(e.target.value)} className="h-8 w-16 rounded cursor-pointer bg-transparent border-none" />
                    </div>
                    
                    <div className="border border-dashed border-slate-700 rounded-xl p-4 text-center">
                        {firmaFisicaBase64 ? (
                            <div>
                                <img src={firmaFisicaBase64} alt="Firma Física" className="max-h-24 mx-auto mb-2 rounded bg-white p-1 firma-blend" />
                                <button onClick={() => setFirmaFisicaBase64(null)} className="text-[10px] text-rose-500 font-bold uppercase underline">Eliminar Firma</button>
                            </div>
                        ) : (
                            <div>
                                <Camera className="text-slate-500 mx-auto mb-2" size={24}/>
                                <button onClick={abrirCamara} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors">Abrir Escáner Óptico</button>
                            </div>
                        )}
                    </div>
                    <button onClick={guardarPerfilArbitro} className="w-full bg-rose-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-rose-500 transition-all mt-4">Guardar y Autorizar</button>
                </div>
            </div>
        </div>
      )}

      {mostrarCamara && (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4 no-print">
              <h3 className="text-white font-black uppercase mb-4 tracking-widest">Enfoque la firma en el centro</h3>
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden border-4 border-emerald-500">
                  <video ref={videoRef} autoPlay playsInline className="w-full object-cover" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-4 mt-8">
                  <button onClick={capturarFirma} className="bg-emerald-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:bg-emerald-500"><Camera size={30}/></button>
                  <button onClick={cerrarCamara} className="bg-slate-800 text-white p-4 rounded-full hover:bg-slate-700"><X size={30}/></button>
              </div>
          </div>
      )}

      <div className="fixed top-8 right-8 flex flex-col gap-3 no-print z-50">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-lg font-black flex items-center gap-2 shadow-xl hover:bg-black transition-all border border-slate-700">
              <Printer size={18}/> Imprimir PDF
          </button>
          
          {esProfesor && (
            <>
              <button onClick={guardarEvaluacionOficial} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-black flex items-center gap-2 shadow-xl hover:bg-blue-500 transition-all">
                  {guardando ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>} 
                  {guardando ? 'Guardando...' : 'Guardar Evaluación'}
              </button>
              {!sala?.firmaDocente && (
                <button onClick={firmarComoArbitro} className="bg-rose-600 text-white px-6 py-3 rounded-lg font-black flex items-center gap-2 shadow-xl hover:bg-rose-500 animate-pulse">
                    <ShieldCheck size={18}/> Firmar Partida
                </button>
              )}
              <button onClick={() => setModalPerfil(true)} className="bg-slate-800 text-slate-300 px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-xl hover:bg-slate-700 transition-all text-xs uppercase tracking-widest">
                  <Settings2 size={16}/> Configurar Firma
              </button>
            </>
          )}
      </div>

      <div className="hoja-a4 bg-white text-slate-900 w-full max-w-[800px] min-h-[1122px] p-12 shadow-2xl relative flex flex-col border border-slate-200">
        
        <div className="border-b-2 border-rose-600 pb-4 mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <img src="/logo.png" alt="IPCAS" className="w-16 h-16 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                <div>
                    {/* 🔥 LA MAGIA AQUÍ: Uso de Optional Chaining (?.) para evitar que explote si es nulo 🔥 */}
                    <h1 className="text-xl font-black uppercase tracking-tighter text-rose-700 leading-none">{esProfesor ? escuela : (sala?.firmaDocente?.escuela || "Instituto Evaluador")}</h1>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Reporte Técnico de Competición - Red Neural</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cód. Documento</p>
                <p className="font-mono text-sm font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded border border-rose-100">{salaId.substring(0,8).toUpperCase()}</p>
            </div>
        </div>

        <h3 className="text-[11px] font-black uppercase text-white mb-3 bg-rose-600 p-1.5 px-3 rounded flex items-center gap-2 w-fit">
            <Target size={14}/> 1. Datos Generales del Encuentro
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-6 text-[10px] p-4 bg-slate-50 rounded border border-slate-100">
            <p><span className="font-bold text-slate-500 uppercase">Torneo:</span> <span className="font-bold">{sala?.torneo || "N/A"}</span></p>
            <p><span className="font-bold text-slate-500 uppercase">Categoría:</span> <span className="font-bold">{sala?.liga || "N/A"}</span></p>
            <p className="col-span-2"><span className="font-bold text-slate-500 uppercase">Cursos en Combate:</span> <span className="font-bold">{sala?.cursos_participantes || "N/A"}</span></p>
            <div className="flex items-center gap-2">
                <label className="font-bold text-slate-500 uppercase">Partida N°:</label>
                <input type="text" disabled={!esProfesor} value={esProfesor ? numPartida : (sala?.evaluacion?.numPartida || "1")} onChange={e=>setNumPartida(e.target.value)} className="w-10 border-b border-slate-300 text-center font-bold focus:outline-none bg-transparent" />
            </div>
        </div>

        <h3 className="text-[11px] font-black uppercase text-white mb-3 bg-rose-600 p-1.5 px-3 rounded flex items-center gap-2 w-fit">
            <BrainCircuit size={14}/> 2. Métricas Técnicas
        </h3>
        <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="border border-slate-200 p-3 rounded bg-slate-50">
                <p className="font-bold text-[10px] uppercase tracking-widest text-emerald-600 mb-2 border-b border-slate-200 pb-1 truncate">Blancas: {sala?.jugador_blancas}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2 rounded border border-slate-100">
                        <input type="number" disabled={!esProfesor} value={esProfesor ? movsBlancas : (sala?.evaluacion?.movsBlancas || "")} onChange={e=>setMovsBlancas(e.target.value)} className="w-full text-base font-black text-slate-800 text-center focus:outline-none bg-transparent" placeholder="0" />
                        <p className="text-[8px] text-slate-500 uppercase font-bold mt-1">Movs</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-100">
                        <input type="number" disabled={!esProfesor} value={esProfesor ? mejoresBlancas : (sala?.evaluacion?.mejoresBlancas || "")} onChange={e=>setMejoresBlancas(e.target.value)} className="w-full text-base font-black text-emerald-500 text-center focus:outline-none bg-transparent" placeholder="0" />
                        <p className="text-[8px] text-slate-500 uppercase font-bold mt-1">Mejores</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-100">
                        <input type="number" disabled={!esProfesor} value={esProfesor ? erroresBlancas : (sala?.evaluacion?.erroresBlancas || "")} onChange={e=>setErroresBlancas(e.target.value)} className="w-full text-base font-black text-rose-500 text-center focus:outline-none bg-transparent" placeholder="0" />
                        <p className="text-[8px] text-slate-500 uppercase font-bold mt-1">Errores</p>
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-slate-700 bg-white p-1.5 rounded border border-slate-100">
                    Precisión: <input type="text" disabled={!esProfesor} value={esProfesor ? precisionBlancas : (sala?.evaluacion?.precisionBlancas || "")} onChange={e=>setPrecisionBlancas(e.target.value)} className="w-10 text-emerald-600 text-center focus:outline-none bg-transparent" placeholder="0%" />
                </div>
            </div>
            <div className="border border-slate-200 p-3 rounded bg-slate-50">
                <p className="font-bold text-[10px] uppercase tracking-widest text-rose-600 mb-2 border-b border-slate-200 pb-1 truncate">Negras: {sala?.jugador_negras}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white p-2 rounded border border-slate-100">
                        <input type="number" disabled={!esProfesor} value={esProfesor ? movsNegras : (sala?.evaluacion?.movsNegras || "")} onChange={e=>setMovsNegras(e.target.value)} className="w-full text-base font-black text-slate-800 text-center focus:outline-none bg-transparent" placeholder="0" />
                        <p className="text-[8px] text-slate-500 uppercase font-bold mt-1">Movs</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-100">
                        <input type="number" disabled={!esProfesor} value={esProfesor ? mejoresNegras : (sala?.evaluacion?.mejoresNegras || "")} onChange={e=>setMejoresNegras(e.target.value)} className="w-full text-base font-black text-emerald-500 text-center focus:outline-none bg-transparent" placeholder="0" />
                        <p className="text-[8px] text-slate-500 uppercase font-bold mt-1">Mejores</p>
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-100">
                        <input type="number" disabled={!esProfesor} value={esProfesor ? erroresNegras : (sala?.evaluacion?.erroresNegras || "")} onChange={e=>setErroresNegras(e.target.value)} className="w-full text-base font-black text-rose-500 text-center focus:outline-none bg-transparent" placeholder="0" />
                        <p className="text-[8px] text-slate-500 uppercase font-bold mt-1">Errores</p>
                    </div>
                </div>
                <div className="mt-2 flex items-center justify-center gap-1 text-[10px] font-mono font-bold text-slate-700 bg-white p-1.5 rounded border border-slate-100">
                    Precisión: <input type="text" disabled={!esProfesor} value={esProfesor ? precisionNegras : (sala?.evaluacion?.precisionNegras || "")} onChange={e=>setPrecisionNegras(e.target.value)} className="w-10 text-rose-600 text-center focus:outline-none bg-transparent" placeholder="0%" />
                </div>
            </div>
        </div>

        <h3 className="text-[11px] font-black uppercase text-white mb-3 bg-rose-600 p-1.5 px-3 rounded flex items-center gap-2 w-fit">
            <PenLine size={14}/> 3. Evaluación Docente
        </h3>
        <div className="space-y-4 mb-6 flex-1">
            <div className="grid grid-cols-2 gap-6">
                <div className="p-3 bg-emerald-50 rounded border border-emerald-100 flex items-center justify-between">
                    <label className="font-bold text-[9px] uppercase tracking-widest text-emerald-700">Nota Blancas</label>
                    <input type="number" disabled={!esProfesor} value={esProfesor ? notaBlancas : (sala?.evaluacion?.notaBlancas || "")} onChange={e=>setNotaBlancas(e.target.value)} className="w-16 border-b-2 border-emerald-300 focus:outline-none font-black text-xl text-emerald-700 bg-transparent text-right" placeholder="0" />
                </div>
                <div className="p-3 bg-rose-50 rounded border border-rose-100 flex items-center justify-between">
                    <label className="font-bold text-[9px] uppercase tracking-widest text-rose-700">Nota Negras</label>
                    <input type="number" disabled={!esProfesor} value={esProfesor ? notaNegras : (sala?.evaluacion?.notaNegras || "")} onChange={e=>setNotaNegras(e.target.value)} className="w-16 border-b-2 border-rose-300 focus:outline-none font-black text-xl text-rose-700 bg-transparent text-right" placeholder="0" />
                </div>
            </div>
            <div className="flex flex-col border border-slate-200 rounded p-3 bg-slate-50/50">
                <label className="font-bold text-[9px] uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-100 pb-1">Análisis Técnico-Táctico</label>
                <textarea disabled={!esProfesor} value={esProfesor ? feedbackTactico : (sala?.evaluacion?.feedbackTactico || "El profesor aún no ha emitido su análisis.")} onChange={e=>setFeedbackTactico(e.target.value)} className="w-full focus:outline-none text-[11px] text-slate-800 min-h-[100px] bg-transparent leading-relaxed resize-none" placeholder="Escriba el análisis de la partida..." />
            </div>
            <div className="flex flex-col border border-slate-200 rounded p-3 bg-slate-50/50">
                <label className="font-bold text-[9px] uppercase tracking-widest text-slate-500 mb-2 border-b border-slate-100 pb-1">Observaciones Conductuales</label>
                <textarea disabled={!esProfesor} value={esProfesor ? feedbackComportamiento : (sala?.evaluacion?.feedbackComportamiento || "")} onChange={e=>setFeedbackComportamiento(e.target.value)} className="w-full focus:outline-none text-[11px] text-slate-800 min-h-[60px] bg-transparent leading-relaxed resize-none" placeholder="Comportamiento, respeto y disciplina..." />
            </div>
        </div>

        <div className="mt-auto pt-8 grid grid-cols-3 gap-6 page-break-inside-avoid">
            <div className="flex flex-col items-center justify-end h-28 relative">
                {sala?.firmaDocente ? (
                    <div className="text-center absolute bottom-0 w-full flex flex-col items-center">
                        {sala?.firmaDocente?.firmaFisica ? (
                             <img src={sala.firmaDocente.firmaFisica} alt="Firma" className="max-h-20 firma-blend object-contain mix-blend-multiply grayscale contrast-125 mb-1" />
                        ) : (
                             <p className="font-serif italic font-bold text-lg mb-1" style={{ color: sala?.firmaDocente?.color || '#000' }}>{sala?.firmaDocente?.nombre}</p>
                        )}
                        <div className="w-full border-b border-slate-400 mb-1"></div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Profesor / Árbitro</p>
                        <p className="text-[6px] font-mono mt-1 text-slate-400">{sala?.firmaDocente?.fecha}</p>
                    </div>
                ) : (
                    <div className="w-full h-16 border-b border-slate-300 flex flex-col justify-end items-center pb-1 absolute bottom-0">
                        <p className="text-[8px] text-slate-400">Esperando Firma...</p>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center justify-end h-28 relative">
                {sala?.firmaBlancas ? (
                    <div className="text-center absolute bottom-0 w-full">
                        <p className="font-serif italic font-bold text-sm text-emerald-700 mb-1">{sala?.firmaBlancas?.nombre}</p>
                        <div className="w-full border-b border-slate-400 mb-1"></div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Jugador Blancas</p>
                        <p className="text-[6px] font-mono mt-1 text-slate-400">{sala?.firmaBlancas?.fecha}</p>
                    </div>
                ) : (
                    <div className="w-full h-16 border-b border-slate-300 flex flex-col justify-end items-center pb-1 absolute bottom-0">
                        {miNombre === sala?.jugador_blancas ? (
                            <button onClick={()=>firmarJugador('w')} className="no-print text-[9px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-bold hover:bg-emerald-200">Firma Jugador</button>
                        ) : (
                            <p className="text-[8px] text-slate-400">Esperando Jugador...</p>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center justify-end h-28 relative">
                {sala?.firmaNegras ? (
                    <div className="text-center absolute bottom-0 w-full">
                        <p className="font-serif italic font-bold text-sm text-blue-700 mb-1">{sala?.firmaNegras?.nombre}</p>
                        <div className="w-full border-b border-slate-400 mb-1"></div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase">Jugador Negras</p>
                        <p className="text-[6px] font-mono mt-1 text-slate-400">{sala?.firmaNegras?.fecha}</p>
                    </div>
                ) : (
                    <div className="w-full h-16 border-b border-slate-300 flex flex-col justify-end items-center pb-1 absolute bottom-0">
                        {miNombre === sala?.jugador_negras ? (
                            <button onClick={()=>firmarJugador('b')} className="no-print text-[9px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200">Firma Jugador</button>
                        ) : (
                            <p className="text-[8px] text-slate-400">Esperando Jugador...</p>
                        )}
                    </div>
                )}
            </div>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-200 p-4">
            <div className="flex gap-3">
                <AlertTriangle className="text-slate-400 shrink-0" size={20}/>
                <div className="text-[8px] leading-tight text-slate-500 text-justify">
                    <span className="font-bold text-slate-700 uppercase">Cláusula de Validez Legal:</span> Este documento constituye un registro oficial de evaluación de la plataforma NEURAL. Su validez legal e institucional está sujeta estrictamente a la presencia de la firma (física digitalizada o electrónica) del Árbitro/Profesor autorizado. Conforme a la <strong>Ley No. 126-02 sobre Comercio Electrónico, Documentos y Firmas Digitales</strong> de la República Dominicana, esta planilla posee fuerza probatoria equivalente a un documento escrito. <strong>Descargo de Responsabilidad:</strong> Los desarrolladores de la plataforma NEURAL no asumen responsabilidad legal, académica o administrativa por el contenido de la evaluación, las calificaciones asignadas o el uso de este documento. La veracidad recae exclusivamente sobre el árbitro firmante.
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}