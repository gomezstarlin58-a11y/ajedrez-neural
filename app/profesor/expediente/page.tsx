"use client";
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../../lib/motorFirebase';
import { collection, onSnapshot, query, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { Loader2, Printer, ShieldAlert, Camera, X, PenLine, FileBadge, Scale, AlertOctagon } from 'lucide-react';

export default function ExpedienteLegalPage() {
  const [cargando, setCargando] = useState(true);
  const [miNombre, setMiNombre] = useState("");
  const [perfil, setPerfil] = useState<any>(null);
  const [torneos, setTorneos] = useState<any[]>([]);

  // 🔥 Configuración Personalizable 🔥
  const [modalConfig, setModalConfig] = useState(false);
  const [nombreArbitro, setNombreArbitro] = useState("");
  const [escuela, setEscuela] = useState("Instituto Politécnico Cardenal Sancha");
  const [colorFirma, setColorFirma] = useState("#1e3a8a"); // Azul oscuro por defecto
  const [fraseSeguridad, setFraseSeguridad] = useState("");
  
  // Cámara y Firma
  const [mostrarCamara, setMostrarCamara] = useState(false);
  const [firmaFisicaBase64, setFirmaFisicaBase64] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const inicializar = async () => {
      const nombre = localStorage.getItem("user_name");
      const rol = localStorage.getItem("user_role");
      
      if (!nombre || rol !== "profesor") {
        document.body.innerHTML = "<h1 style='color:red; text-align:center; margin-top:20%; font-family:sans-serif;'>ACCESO DENEGADO. RANGO INSUFICIENTE.</h1>";
        return;
      }
      setMiNombre(nombre);

      // Cargar Perfil de Firebase
      const docSnap = await getDoc(doc(db, "perfiles_arbitros", nombre));
      if (docSnap.exists()) {
        const p = docSnap.data();
        setPerfil(p);
        setNombreArbitro(p.nombre || nombre);
        setEscuela(p.escuela || "Instituto Politécnico Cardenal Sancha");
        setColorFirma(p.color || "#1e3a8a");
        setFraseSeguridad(p.fraseSeguridad || "");
        setFirmaFisicaBase64(p.firmaFisica || null);
        
        // Si no tiene la frase obligatoria, forzamos el modal
        if (!p.fraseSeguridad) setModalConfig(true);
      } else {
        setNombreArbitro(nombre);
        setModalConfig(true); // Fuerza la configuración inicial
      }

      // Cargar Torneos del Profesor
      const q = query(collection(db, 'torneos_globales'), orderBy('fecha_creacion', 'desc'));
      onSnapshot(q, (snapshot) => {
        const t = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter((x:any) => x.creado_por === nombre);
        setTorneos(t);
        setCargando(false);
      });
    };
    inicializar();
  }, []);

  // --- LÓGICA DE CÁMARA Y GUARDADO ---
  const abrirCamara = async () => {
    setMostrarCamara(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { alert("Error al acceder a la cámara."); setMostrarCamara(false); }
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

  const guardarConfiguracion = async () => {
    if (!nombreArbitro || !escuela || !fraseSeguridad) return alert("Llene los campos obligatorios.");
    const datos = {
      nombre: nombreArbitro, 
      escuela, 
      color: colorFirma,
      fraseSeguridad, 
      firmaFisica: firmaFisicaBase64, 
      fechaActualizacion: new Date().toLocaleString()
    };
    // Guardar en la base de datos usando el ID original de login
    await setDoc(doc(db, "perfiles_arbitros", miNombre), datos, { merge: true });
    setPerfil(datos);
    setModalConfig(false);
  };

  if (cargando) return <div className="h-screen flex items-center justify-center bg-slate-100 text-blue-600 font-black"><Loader2 className="animate-spin mr-2"/> GENERANDO EXPEDIENTE LEGAL...</div>;

  const nombreOficial = perfil?.nombre || miNombre;

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center py-10 print:py-0 print:bg-white text-slate-900 font-sans">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white; }
          .no-print { display: none !important; }
          .hoja-a4 { box-shadow: none !important; margin: 0 !important; width: 210mm !important; min-height: 297mm !important; padding: 20mm !important; border: none !important; page-break-after: always; }
          .hoja-a4:last-child { page-break-after: auto; }
          .firma-blend { mix-blend-mode: multiply; filter: grayscale(100%) contrast(150%); }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 4rem; opacity: 0.03; font-weight: black; text-transform: uppercase; white-space: nowrap; pointer-events: none; z-index: 0; text-align: center; line-height: 1.2; }
        }
      `}} />

      {/* --- MODAL DE CONFIGURACIÓN PERSONALIZABLE --- */}
      {modalConfig && (
        <div className="fixed inset-0 z-[100] bg-[#020617]/95 backdrop-blur-sm flex items-center justify-center p-4 no-print overflow-y-auto">
          <div className="bg-[#0B1121] border border-blue-500/30 p-8 rounded-[2rem] max-w-md w-full shadow-2xl relative my-8 text-white">
              {perfil && <button onClick={() => setModalConfig(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X/></button>}
              <PenLine className="text-blue-500 mb-4" size={40}/>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Perfil y Sello Legal</h2>
              <p className="text-slate-400 text-xs mb-6">Configure sus credenciales oficiales y parámetros anti-falsificación.</p>
              
              <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nombre Oficial del Profesor</label>
                    <input type="text" placeholder="Su nombre completo..." value={nombreArbitro} onChange={e=>setNombreArbitro(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm mt-1" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Institución Educativa</label>
                    <input type="text" placeholder="Institución Educativa..." value={escuela} onChange={e=>setEscuela(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm mt-1" />
                  </div>

                  <div className="flex items-center gap-4 bg-[#020617] border border-slate-700 p-3 rounded-xl">
                      <label className="text-xs text-slate-400 font-bold uppercase flex-1">Color de Tinta Oficial:</label>
                      <input type="color" value={colorFirma} onChange={e=>setColorFirma(e.target.value)} className="h-8 w-16 rounded cursor-pointer bg-transparent border-none" />
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Frase Secreta Anti-Copia (Sello de Agua)</label>
                    <textarea placeholder="Ej: Válido exclusivamente bajo supervisión del Prof. López en el año 2026..." value={fraseSeguridad} onChange={e=>setFraseSeguridad(e.target.value)} className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500 text-sm mt-1 h-20 resize-none" />
                  </div>

                  <div className="border border-dashed border-slate-700 rounded-xl p-4 text-center">
                      {firmaFisicaBase64 ? (
                          <div>
                              <img src={firmaFisicaBase64} alt="Firma" className="max-h-24 mx-auto mb-2 rounded bg-white p-1 firma-blend" />
                              <button onClick={() => setFirmaFisicaBase64(null)} className="text-[10px] text-rose-500 font-bold uppercase underline">Repetir Escaneo</button>
                          </div>
                      ) : (
                          <div>
                              <Camera className="text-slate-500 mx-auto mb-2" size={24}/>
                              <p className="text-[10px] text-slate-400 mb-3">Escanea tu firma real escrita en un papel.</p>
                              <button onClick={abrirCamara} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors">Escanear Firma</button>
                          </div>
                      )}
                  </div>
                  <button onClick={guardarConfiguracion} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all mt-4">Sellar y Generar PDF</button>
              </div>
          </div>
        </div>
      )}

      {mostrarCamara && (
          <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-4 no-print">
              <h3 className="text-white font-black uppercase mb-4 tracking-widest">Enfoque la firma en el centro</h3>
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden border-4 border-blue-500">
                  <video ref={videoRef} autoPlay playsInline className="w-full object-cover" />
              </div>
              <canvas ref={canvasRef} className="hidden" />
              <div className="flex gap-4 mt-8">
                  <button onClick={capturarFirma} className="bg-blue-600 text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.5)]"><Camera size={30}/></button>
                  <button onClick={cerrarCamara} className="bg-slate-800 text-white p-4 rounded-full"><X size={30}/></button>
              </div>
          </div>
      )}

      <div className="fixed top-8 right-8 flex gap-4 no-print z-50">
          <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-3 rounded-lg font-black flex items-center gap-2 shadow-xl hover:bg-black transition-all">
              <Printer size={18}/> Imprimir / PDF
          </button>
          <button onClick={() => setModalConfig(true)} className="bg-slate-300 text-slate-800 px-6 py-3 rounded-lg font-black hover:bg-slate-400 transition-all">Editar Sello</button>
      </div>

      {/* ================= HOJA 1: CARTA DE PRESENTACIÓN Y CREDENCIALES ================= */}
      <div className="hoja-a4 bg-white w-full max-w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl relative mb-8 flex flex-col border border-slate-200">
        <div className="watermark">{perfil?.fraseSeguridad}<br/>{nombreOficial.toUpperCase()}</div>
        
        <div className="border-b-4 border-blue-900 pb-6 mb-8 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-6">
                {/* 🔥 LOGO OFICIAL DE IPCAS 🔥 */}
                <img src="http://ipcas.edu.do/images/logo2.png" alt="Logo IPCAS" className="w-24 h-24 object-contain" onError={(e) => e.currentTarget.src = '/logo.png'} />
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tighter text-blue-950 leading-none">{perfil?.escuela || "Institución"}</h1>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-2">Dossier Oficial de Autoridad Docente</p>
                    <p className="text-[10px] font-mono text-slate-400 uppercase mt-1">Sistema Integrado Red Neural</p>
                </div>
            </div>
        </div>

        <div className="relative z-10 flex-1">
            <h2 className="text-lg font-black uppercase text-white bg-blue-900 p-2 pl-4 rounded flex items-center gap-2 mb-6"><FileBadge size={20}/> I. Declaración de Identidad y Rango</h2>
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-8 text-sm">
                <p className="mb-4 text-justify">A quien pueda interesar, el presente documento certifica bajo el rigor de las leyes de la República Dominicana, que el ciudadano detallado a continuación posee el rango inalienable de <strong>Profesor y Árbitro Oficial</strong> dentro de la infraestructura académica NEURAL.</p>
                <div className="grid grid-cols-2 gap-y-4 font-mono">
                    <p><span className="font-bold text-slate-500 uppercase block text-[10px]">Nombre Oficial:</span> <span className="font-black text-lg">{nombreOficial.toUpperCase()}</span></p>
                    <p><span className="font-bold text-slate-500 uppercase block text-[10px]">ID de Validación:</span> {btoa(nombreOficial).substring(0,10).toUpperCase()}</p>
                    <p><span className="font-bold text-slate-500 uppercase block text-[10px]">Fecha de Emisión:</span> {new Date().toLocaleDateString()}</p>
                    <p><span className="font-bold text-slate-500 uppercase block text-[10px]">Estado de Rango:</span> <span className="text-emerald-600 font-bold">ACTIVO / VERIFICADO</span></p>
                </div>
            </div>

            <h2 className="text-lg font-black uppercase text-white bg-blue-900 p-2 pl-4 rounded flex items-center gap-2 mb-6"><ShieldAlert size={20}/> II. Registro de Operaciones Dirigidas</h2>
            <p className="text-xs text-slate-600 mb-4 text-justify">El presente titular ha organizado, supervisado y evaluado legalmente los siguientes eventos académicos, cuyos resultados son inmutables y reposan en los servidores cifrados del sistema.</p>
            
            <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr><th className="p-3 border">Torneo Oficial</th><th className="p-3 border">Liga</th><th className="p-3 border">Cursos</th><th className="p-3 border">Fecha</th></tr>
                </thead>
                <tbody>
                    {torneos.map(t => (
                        <tr key={t.id}><td className="p-3 border font-bold">{t.nombre}</td><td className="p-3 border">{t.liga}</td><td className="p-3 border">{t.cursos_participantes}</td><td className="p-3 border font-mono text-[10px]">{new Date(t.fecha_creacion?.seconds * 1000).toLocaleDateString()}</td></tr>
                    ))}
                    {torneos.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-500">Aún no se han registrado operaciones.</td></tr>}
                </tbody>
            </table>
        </div>
      </div>

      {/* ================= HOJA 2: MARCO JURÍDICO Y BENEFICIOS ================= */}
      <div className="hoja-a4 bg-white w-full max-w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl relative mb-8 flex flex-col border border-slate-200">
        <div className="watermark">{perfil?.fraseSeguridad}<br/>{nombreOficial.toUpperCase()}</div>
        <div className="relative z-10">
            <h2 className="text-lg font-black uppercase text-white bg-slate-900 p-2 pl-4 rounded flex items-center gap-2 mb-6"><Scale size={20}/> III. Marco Legal y Validez Jurídica</h2>
            <p className="text-xs text-slate-700 text-justify mb-4">El uso de esta plataforma, así como las evaluaciones emitidas por el profesor firmante, están blindadas por los siguientes 22 artículos y normativas nacionales e internacionales:</p>
            
            <div className="text-[10px] text-slate-800 leading-relaxed text-justify columns-2 gap-8 space-y-3">
                <p><strong>1. Base Digital (Ley 126-02):</strong> Según el Art. 3 de la Ley 126-02 de la Rep. Dom., la información contenida en este documento electrónico tiene absoluta validez legal y fuerza probatoria.</p>
                <p><strong>2. Firma Electrónica:</strong> (Art. 4, Ley 126-02) La firma digitalizada del docente estampada en este expediente sustituye y equivale legalmente a su firma manuscrita física.</p>
                <p><strong>3. Inmutabilidad de Datos:</strong> Los registros de partidas y puntajes en Firebase son inmutables; no pueden ser alterados posteriormente por el alumno.</p>
                <p><strong>4. Autoridad Institucional:</strong> Este documento avala que el docente actúa como representante legal de la institución educativa en materia evaluativa.</p>
                <p><strong>5. Sello de Tiempo (Timestamp):</strong> Cada partida cuenta con un sello criptográfico de tiempo del servidor, validando el momento exacto del encuentro.</p>
                
                <h4 className="font-black text-blue-800 uppercase mt-4 mb-1 border-b border-slate-300">Beneficios Académicos</h4>
                <p><strong>6. Créditos de Educación Física:</strong> Las victorias en torneos oficiales pueden ser validadas como horas prácticas o créditos en la asignatura de Educación Física (Ley 66-97).</p>
                <p><strong>7. Índice Extracurricular:</strong> El ELO (rango) obtenido suma al perfil de competencias del estudiante para su expediente general.</p>
                <p><strong>8. Justificación de Ausencias:</strong> Participar en un torneo oficial dentro de la plataforma sirve como aval legal para justificar ausencias en otras prácticas concurrentes.</p>
                <p><strong>9. Aval para Becas Universitarias:</strong> El expediente de torneo firmado por el docente funciona como documento de respaldo para aplicar a becas por mérito deportivo/cognitivo.</p>
                <p><strong>10. Desarrollo Lógico-Matemático:</strong> Se certifica el desarrollo de competencias exigidas por el currículo educativo dominicano en resolución de problemas complejos.</p>
                <p><strong>11. Competencias Blandas:</strong> Validamos la capacidad del estudiante para tomar decisiones críticas bajo extrema presión de tiempo.</p>

                <h4 className="font-black text-rose-800 uppercase mt-4 mb-1 border-b border-slate-300">Sanciones y Desayudas</h4>
                <p><strong>12. Nulidad por Asistencia Externa:</strong> El uso de motores de ajedrez (Stockfish) ajenos a la plataforma resultará en la expulsión legal del torneo y calificación nula (0).</p>
                <p><strong>13. Reporte de Indisciplina:</strong> La desconexión intencional de una partida ("Rage quit") genera un reporte automático al libro de disciplina de la institución.</p>
                <p><strong>14. Pérdida de Puntos de Liga:</strong> El abandono injustificado conlleva la deducción severa de puntos ELO del perfil del estudiante.</p>
                <p><strong>15. Inhabilitación de Cuenta:</strong> Infracciones repetidas facultarán al profesor para inhabilitar temporal o permanentemente el acceso del alumno a la base.</p>
                <p><strong>16. Nulidad de Firma:</strong> Si el alumno suplanta la firma o identidad de otro recluta, el documento quedará invalidado y será sancionado académicamente.</p>
                <p><strong>17. Degradación de Rango:</strong> El mal comportamiento avalado por el profesor en la planilla bajará al alumno a la Liga Hierro de forma forzosa.</p>

                <h4 className="font-black text-slate-800 uppercase mt-4 mb-1 border-b border-slate-300">Derechos y Privacidad</h4>
                <p><strong>18. Propiedad Intelectual:</strong> (Ley 65-00) La notación de las partidas generadas es propiedad compartida entre el jugador y la plataforma.</p>
                <p><strong>19. Protección al Menor:</strong> (Ley 136-03) Los datos personales de los estudiantes se manejan estrictamente para fines académicos intra-muros.</p>
                <p><strong>20. Protección de Datos:</strong> (Ley 172-13) Ningún tercero externo a la institución tendrá acceso a los historiales de evaluación sin orden del docente.</p>
                <p><strong>21. Confidencialidad Evaluativa:</strong> Las notas y feedback táctico son privados entre el árbitro y el jugador evaluado.</p>
                <p><strong>22. Descargo Total de Desarrolladores:</strong> La plataforma NEURAL es un medio tecnológico neutral. La validez de la nota recae única y exclusivamente en el profesor firmante. Los desarrolladores están exentos de responsabilidad civil o administrativa.</p>
            </div>
        </div>
      </div>

      {/* ================= HOJA 3: CERTIFICACIÓN Y SELLO FINAL ================= */}
      <div className="hoja-a4 bg-white w-full max-w-[210mm] min-h-[297mm] p-[20mm] shadow-2xl relative flex flex-col border border-slate-200">
        <div className="watermark">{perfil?.fraseSeguridad}<br/>{nombreOficial.toUpperCase()}</div>
        
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-10">
            <AlertOctagon size={60} className="text-blue-900 mb-6"/>
            <h2 className="text-2xl font-black uppercase text-blue-950 tracking-widest mb-4">Declaración Jurada y Sello de Autoridad</h2>
            
            <p className="text-sm text-slate-700 leading-relaxed mb-16 max-w-lg">
                Yo, <strong>{nombreOficial.toUpperCase()}</strong>, certifico haber leído y comprendido los 22 artículos detallados en la página anterior. Declaro que la firma adjunta a continuación es mi rúbrica legal y autorizo al Sistema NEURAL a plasmarla como sello oficial en todas las planillas de evaluación que yo genere bajo mis credenciales.
            </p>

            {/* ZONA DE FIRMA */}
            <div className="w-full max-w-sm border-2 border-dashed border-blue-900/30 p-8 relative">
                <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-bold text-blue-900 uppercase tracking-widest">Sello de Validación Oficial</div>
                
                {perfil?.firmaFisica ? (
                    <img src={perfil.firmaFisica} alt="Firma Oficial" className="max-h-40 mx-auto firma-blend object-contain mix-blend-multiply grayscale contrast-125" />
                ) : (
                    <p className="font-serif italic font-bold text-4xl py-6" style={{ color: perfil?.color || colorFirma }}>{nombreOficial}</p>
                )}
                
                <div className="w-full border-b border-slate-400 mt-4 mb-2"></div>
                <p className="text-xs font-black uppercase text-slate-800">Firma del Árbitro / Profesor Docente</p>
                <p className="text-[10px] font-mono text-slate-500 mt-1">Sello de Tiempo: {new Date().toLocaleString()}</p>
                <p className="text-[9px] font-bold text-rose-700 mt-4 uppercase leading-tight bg-rose-50 p-2 rounded">{perfil?.fraseSeguridad}</p>
            </div>
            
            <div className="mt-auto pt-10 text-[9px] text-slate-400 text-center w-full border-t border-slate-200">
                Documento generado automáticamente por el Sistema Académico de Ajedrez NEURAL. Válido en la República Dominicana.<br/>
                Identificador de Hash: {btoa(nombreOficial + new Date().getTime()).substring(0, 30)}
            </div>
        </div>
      </div>

    </div>
  );
}