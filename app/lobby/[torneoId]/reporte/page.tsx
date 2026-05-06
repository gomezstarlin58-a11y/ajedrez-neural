"use client";
import React, { useState, useEffect, use } from 'react';
import { db } from '../../../../lib/motorFirebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Loader2, Printer, Trophy, Scale, ShieldAlert, Award, FileText, CheckCircle2, Crown } from 'lucide-react';

export default function ReporteTorneoPage({ params }: { params: Promise<{ torneoId: string }> }) {
  const resolvedParams = use(params);
  const torneoId = resolvedParams.torneoId;

  const [cargando, setCargando] = useState(true);
  const [torneo, setTorneo] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [profesor, setProfesor] = useState<any>(null);
  const [esProfesor, setEsProfesor] = useState(false);

  // Modal y Textos del Profesor
  const [modalAbierto, setModalAbierto] = useState(false);
  const [premios, setPremios] = useState("Ej: El ganador obtiene 15 puntos extra en el registro de Educación Física y medalla de honor.");
  const [beneficios, setBeneficios] = useState("Ej: Los 3 primeros lugares evaden la práctica escrita del mes.");
  const [reglasExtras, setReglasExtras] = useState("Modo de Torneo: Puntuación Acumulativa por Evaluación Docente.");

  useEffect(() => {
    const cargarDatos = async () => {
      // 1. Verificamos el rol
      const rol = localStorage.getItem("user_role");
      setEsProfesor(rol === "profesor");

      // 2. Cargar Torneo
      const torSnap = await getDoc(doc(db, "torneos_globales", torneoId));
      if (!torSnap.exists()) return;
      const torData = torSnap.data();
      setTorneo(torData);

      // Si el torneo ya está clausurado, cargamos los textos de la BD y cerramos el modal
      if (torData.estado === 'clausurado' && torData.actaFinal) {
          setReglasExtras(torData.actaFinal.reglasExtras);
          setPremios(torData.actaFinal.premios);
          setBeneficios(torData.actaFinal.beneficios);
          setModalAbierto(false);
      } else if (rol === "profesor") {
          // Si no está clausurado y es profesor, abrimos el modal para que lo llene
          setModalAbierto(true);
      }

      // 3. Cargar Perfil del Profesor Creador
      const profId = torData.creado_por || localStorage.getItem("user_name");
      const profSnap = await getDoc(doc(db, "perfiles_arbitros", profId));
      if (profSnap.exists()) setProfesor(profSnap.data());

      // 4. Cargar Partidas y Calcular Ranking
      const q = query(collection(db, "torneos_pvp"), where("torneoId", "==", torneoId));
      const partsSnap = await getDocs(q);
      const jugadoresMap: any = {};
      
      partsSnap.docs.forEach(d => {
          const p = d.data();
          if (p.jugador_blancas && p.jugador_blancas !== 'Esperando...') {
              if (!jugadoresMap[p.jugador_blancas]) jugadoresMap[p.jugador_blancas] = { nombre: p.jugador_blancas, puntos: 0, partidas: 0 };
              if (p.estado === 'finalizado' && p.evaluacion?.notaBlancas) {
                  jugadoresMap[p.jugador_blancas].puntos += Number(p.evaluacion.notaBlancas);
                  jugadoresMap[p.jugador_blancas].partidas += 1;
              }
          }
          if (p.jugador_negras && p.jugador_negras !== 'Esperando...') {
              if (!jugadoresMap[p.jugador_negras]) jugadoresMap[p.jugador_negras] = { nombre: p.jugador_negras, puntos: 0, partidas: 0 };
              if (p.estado === 'finalizado' && p.evaluacion?.notaNegras) {
                  jugadoresMap[p.jugador_negras].puntos += Number(p.evaluacion.notaNegras);
                  jugadoresMap[p.jugador_negras].partidas += 1;
              }
          }
      });

      const rankingArray = Object.values(jugadoresMap).sort((a: any, b: any) => b.puntos - a.puntos);
      setRanking(rankingArray);
      setCargando(false);
    };
    cargarDatos();
  }, [torneoId]);

  // 🔥 LÓGICA DE CLAUSURA EN FIREBASE 🔥
  const sellarTorneoEnBD = async () => {
    setCargando(true);
    try {
      await updateDoc(doc(db, "torneos_globales", torneoId), {
          estado: 'clausurado',
          actaFinal: { reglasExtras, premios, beneficios },
          fecha_clausura: new Date().toLocaleString()
      });
      setModalAbierto(false);
    } catch (error) {
      alert("Comandante, hubo un error al clausurar en la base de datos.");
    }
    setCargando(false);
  };

  if (cargando) return <div className="h-screen flex items-center justify-center text-red-600 font-black"><Loader2 className="animate-spin mr-2"/> PREPARANDO ACTA DE CLAUSURA...</div>;

  const ganador = ranking.length > 0 ? ranking[0] : { nombre: "N/A", puntos: 0 };

  return (
    <div className="min-h-screen bg-slate-200 flex flex-col items-center py-10 print:py-0 print:bg-white text-slate-900 font-sans">
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { background: white; }
          .no-print { display: none !important; }
          .hoja-a4 { box-shadow: none !important; margin: 0 !important; width: 210mm !important; min-height: 297mm !important; padding: 20mm !important; border: none !important; page-break-after: always; position: relative; overflow: hidden; }
          .hoja-a4:last-child { page-break-after: auto; }
          .firma-blend { mix-blend-mode: multiply; filter: grayscale(100%) contrast(150%); }
          .bg-brand { background-color: #b91c1c !important; color: white !important; -webkit-print-color-adjust: exact; }
          .text-brand { color: #b91c1c !important; -webkit-print-color-adjust: exact; }
        }
      `}} />

      {/* MODAL DEL PROFESOR PARA LLENAR DATOS */}
      {modalAbierto && esProfesor && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 no-print overflow-y-auto">
          <div className="bg-white border-t-8 border-red-700 p-8 rounded-xl max-w-xl w-full shadow-2xl relative my-8">
              <Trophy className="text-red-700 mb-4" size={40}/>
              <h2 className="text-2xl font-black uppercase text-red-900 mb-2">Clausura del Torneo</h2>
              <p className="text-slate-500 text-sm mb-6">Profesor, redacte las condiciones y premios finales antes de imprimir el acta oficial.</p>
              
              <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-red-700 font-bold uppercase tracking-widest">Modalidad / Reglas del Torneo</label>
                    <textarea value={reglasExtras} onChange={e=>setReglasExtras(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded p-3 outline-none focus:border-red-500 text-sm mt-1 h-16 resize-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-red-700 font-bold uppercase tracking-widest">Premios al Ganador ({ganador.nombre})</label>
                    <textarea value={premios} onChange={e=>setPremios(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded p-3 outline-none focus:border-red-500 text-sm mt-1 h-20 resize-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-red-700 font-bold uppercase tracking-widest">Beneficios Académicos para Participantes</label>
                    <textarea value={beneficios} onChange={e=>setBeneficios(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded p-3 outline-none focus:border-red-500 text-sm mt-1 h-20 resize-none" />
                  </div>
                  {/* 🔥 BOTÓN QUE AHORA GUARDA EN FIREBASE 🔥 */}
                  <button onClick={sellarTorneoEnBD} className="w-full bg-red-700 text-white py-4 rounded font-black uppercase tracking-widest hover:bg-red-800 transition-all mt-4">Sellar en la Base de Datos</button>
              </div>
          </div>
        </div>
      )}

      <div className="fixed top-8 right-8 flex gap-4 no-print z-50">
          <button onClick={() => window.print()} className="bg-red-700 text-white px-6 py-3 rounded shadow-2xl font-black flex items-center gap-2 hover:bg-red-800 transition-all">
              <Printer size={18}/> Imprimir 5 Páginas
          </button>
      </div>

      {/* ================= HOJA 1: PORTADA ÉPICA ================= */}
      <div className="hoja-a4 flex flex-col items-center justify-center text-center bg-white border border-slate-200 mb-8 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-8 bg-brand"></div>
          <div className="absolute bottom-0 left-0 w-full h-8 bg-brand"></div>
          
          <img src="http://ipcas.edu.do/images/logo2.png" alt="Logo IPCAS" className="w-48 h-48 object-contain mb-10" onError={(e) => e.currentTarget.src = '/logo.png'} />
          
          <h2 className="text-red-700 font-bold tracking-[0.4em] uppercase text-sm mb-4">Acta Oficial de Clausura</h2>
          <h1 className="text-6xl font-black uppercase text-slate-900 leading-none tracking-tighter mb-8 max-w-2xl">{torneo?.nombre}</h1>
          
          <div className="bg-red-50 border border-red-100 p-8 rounded-xl w-full max-w-md mb-12">
             <Crown size={50} className="text-red-600 mx-auto mb-4"/>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Campeón Absoluto</p>
             <h3 className="text-4xl font-black text-red-700 uppercase">{ganador.nombre}</h3>
             <p className="text-slate-700 font-mono mt-2 font-bold">{ganador.puntos} Puntos Obtenidos</p>
          </div>

          <div className="text-xs text-slate-500 uppercase tracking-widest font-bold space-y-2">
              <p>Liga: <span className="text-slate-900">{torneo?.liga}</span></p>
              <p>Cursos: <span className="text-slate-900">{torneo?.cursos_participantes}</span></p>
              <p>Fecha de Clausura: <span className="text-slate-900">{torneo?.fecha_clausura || new Date().toLocaleDateString()}</span></p>
              <p>Autoridad: <span className="text-slate-900">{profesor?.nombre || "Profesor Titular"}</span></p>
          </div>
      </div>

      {/* ================= HOJA 2: RANKING OFICIAL ================= */}
      <div className="hoja-a4 bg-white border border-slate-200 mb-8 shadow-2xl flex flex-col">
          <div className="border-b-4 border-red-700 pb-4 mb-8 flex justify-between items-end">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Ranking de Honor</h2>
              <img src="http://ipcas.edu.do/images/logo2.png" className="h-12 object-contain" onError={(e) => e.currentTarget.style.display = 'none'}/>
          </div>
          
          <p className="text-sm text-slate-600 mb-6 text-justify">El siguiente listado constituye la jerarquía oficial y definitiva de los reclutas participantes en el torneo, evaluados bajo la estricta supervisión docente.</p>

          <table className="w-full text-sm text-left border-collapse mt-4">
              <thead className="bg-red-700 text-white font-bold uppercase text-xs">
                  <tr><th className="p-4 border border-red-800">Posición</th><th className="p-4 border border-red-800">Nombre del Recluta</th><th className="p-4 border border-red-800 text-center">Partidas</th><th className="p-4 border border-red-800 text-right">Puntaje Oficial</th></tr>
              </thead>
              <tbody>
                  {ranking.map((j, index) => (
                      <tr key={index} className={index === 0 ? "bg-red-50" : index % 2 === 0 ? "bg-slate-50" : "bg-white"}>
                          <td className="p-4 border border-slate-200 font-black text-center text-slate-400">#{index + 1}</td>
                          <td className={`p-4 border border-slate-200 font-bold uppercase ${index===0 ? 'text-red-700' : 'text-slate-800'}`}>
                             {index === 0 && <Crown size={14} className="inline mr-2 text-red-600"/>} {j.nombre}
                          </td>
                          <td className="p-4 border border-slate-200 text-center font-mono">{j.partidas}</td>
                          <td className="p-4 border border-slate-200 text-right font-black text-red-700">{j.puntos} PTS</td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* ================= HOJA 3: PREMIOS Y BENEFICIOS ================= */}
      <div className="hoja-a4 bg-white border border-slate-200 mb-8 shadow-2xl flex flex-col">
          <div className="border-b-4 border-red-700 pb-4 mb-8 flex justify-between items-end">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Dictamen de Recompensas</h2>
              <Award size={40} className="text-red-700"/>
          </div>

          <div className="space-y-8">
              <div className="p-6 bg-red-50 border-l-8 border-red-700 rounded-r-lg">
                 <h3 className="text-xl font-black text-red-900 uppercase mb-3">I. Modalidad Ejecutada</h3>
                 <p className="text-slate-800 text-sm whitespace-pre-wrap">{reglasExtras}</p>
              </div>

              <div className="p-6 bg-amber-50 border-l-8 border-amber-500 rounded-r-lg">
                 <h3 className="text-xl font-black text-amber-900 uppercase mb-3 flex items-center gap-2"><Crown size={24}/> II. Premiación al Campeón</h3>
                 <p className="text-slate-800 text-sm font-bold uppercase mb-2">Recluta Reconocido: {ganador.nombre}</p>
                 <p className="text-slate-700 text-sm whitespace-pre-wrap">{premios}</p>
              </div>

              <div className="p-6 bg-blue-50 border-l-8 border-blue-700 rounded-r-lg">
                 <h3 className="text-xl font-black text-blue-900 uppercase mb-3">III. Beneficios Académicos Generales</h3>
                 <p className="text-slate-800 text-sm whitespace-pre-wrap">{beneficios}</p>
              </div>
          </div>
      </div>

      {/* ================= HOJA 4: MARCO JURÍDICO ================= */}
      <div className="hoja-a4 bg-white border border-slate-200 mb-8 shadow-2xl flex flex-col">
          <div className="border-b-4 border-red-700 pb-4 mb-8 flex justify-between items-end">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Validez Legal (Ley 126-02)</h2>
              <Scale size={40} className="text-red-700"/>
          </div>

          <div className="text-xs text-slate-800 leading-relaxed text-justify columns-2 gap-8 space-y-4">
              <p><strong>1. Fuerza Probatoria:</strong> El presente documento, impreso desde el Sistema NEURAL, posee carácter oficial y validez jurídica según la Ley 126-02 de la Rep. Dom. sobre documentos electrónicos.</p>
              <p><strong>2. Inmutabilidad:</strong> Los puntajes presentados en el Ranking Oficial han sido auditados criptográficamente y no pueden ser alterados por agentes externos ni reclutas.</p>
              <p><strong>3. Mérito Académico:</strong> Los beneficios estipulados en la página anterior (Hoja 3) son de carácter obligatorio para el área correspondiente, al ser una evaluación avalada por la firma del docente titular.</p>
              <p><strong>4. Uso de Software:</strong> La plataforma exime a sus desarrolladores de cualquier fallo institucional; la autoridad de los puntajes recae unilateralmente en el Profesor.</p>
              <p><strong>5. Penalización:</strong> Cualquier intento de falsificación de esta acta será reportado al departamento de disciplina para anulación inmediata de créditos.</p>
              <p><strong>6. Privacidad:</strong> La información contenida en el ranking es pública dentro de la institución para garantizar la transparencia competitiva entre los reclutas.</p>
          </div>
      </div>

      {/* ================= HOJA 5: FIRMAS ================= */}
      <div className="hoja-a4 bg-white border border-slate-200 shadow-2xl flex flex-col justify-center items-center text-center">
          <div className="absolute top-0 left-0 w-full h-8 bg-brand"></div>
          
          <ShieldAlert size={80} className="text-red-700 mb-8"/>
          <h2 className="text-3xl font-black uppercase text-slate-900 tracking-widest mb-6">Certificación Final</h2>
          
          <p className="text-sm text-slate-600 leading-relaxed mb-20 max-w-xl">
              Damos fe y testimonio de que el torneo <strong>"{torneo?.nombre}"</strong> ha concluido de manera justa, transparente y bajo las normativas académicas vigentes. Firmamos la presente acta de clausura para su ejecución y archivo.
          </p>

          <div className="flex justify-between w-full max-w-2xl px-8 mt-12 gap-10">
              {/* Firma Docente */}
              <div className="flex-1 flex flex-col items-center">
                  <div className="h-24 w-full flex items-end justify-center mb-2">
                     {profesor?.firmaFisica ? (
                         <img src={profesor.firmaFisica} className="max-h-24 firma-blend object-contain" />
                     ) : (
                         <p className="font-serif italic font-bold text-2xl" style={{ color: profesor?.color || '#b91c1c' }}>{profesor?.nombre || "Docente Titular"}</p>
                     )}
                  </div>
                  <div className="w-full border-b-2 border-slate-800 mb-2"></div>
                  <p className="text-xs font-black uppercase text-slate-800">Sello del Profesor Autorizado</p>
                  <p className="text-[10px] font-mono mt-1 text-slate-500">ID: {btoa(profesor?.nombre || "0").substring(0,15)}</p>
              </div>

              {/* Firma Dirección (Opcional papel) */}
              <div className="flex-1 flex flex-col items-center">
                  <div className="h-24 w-full mb-2"></div>
                  <div className="w-full border-b-2 border-slate-800 mb-2"></div>
                  <p className="text-xs font-black uppercase text-slate-800">Sello de Dirección Académica</p>
                  <p className="text-[10px] font-mono mt-1 text-slate-500">Visto Bueno Institucional</p>
              </div>
          </div>
      </div>

    </div>
  );
}