"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sword } from 'lucide-react';

export default function UnirseTorneoPage() {
  const [id, setId] = useState("");
  const router = useRouter();

  const entrar = () => {
    if (id.trim()) {
      // 🔥 LA CORRECCIÓN TÁCTICA: Ahora el transporte va directo a la base (Lobby) 🔥
      router.push(`/lobby/${id.trim()}`);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-[#0B1121] border border-slate-800 p-8 rounded-3xl text-center shadow-2xl">
        <Sword className="text-blue-500 mx-auto mb-6" size={48} />
        <h2 className="text-2xl font-black mb-2 uppercase tracking-tight">Entrar a Combate</h2>
        <p className="text-slate-400 text-sm mb-8">Ingresa el ID de sala proporcionado por tu profesor.</p>
        
        <input 
          type="text" 
          value={id} 
          onChange={(e) => setId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && entrar()} // Permite dar Enter en el teclado
          placeholder="ID de la Sala..." 
          className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-4 text-white mb-4 focus:outline-none focus:border-blue-500 transition-colors font-mono"
        />
        
        <button onClick={entrar} className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]">
          Unirse al Torneo
        </button>
      </div>
    </div>
  );
}