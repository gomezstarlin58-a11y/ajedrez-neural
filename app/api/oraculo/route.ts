import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fen, jugadaUsuario } = body;

    // 1. Buscamos los modelos
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const peticionModelos = await fetch(url);
    const dataModelos = await peticionModelos.json();

    const modelosDisponibles = dataModelos.models
        .filter((m: any) => m.supportedGenerationMethods.includes("generateContent"))
        .map((m: any) => m.name.replace("models/", ""));
        
    // 2. ELEGIMOS A LA ÉLITE (Gemini 3.1 Pro Preview)
    let modeloElegido = "gemini-pro"; 
    const preferidos = [
      "gemini-3.1-pro-preview", 
      "gemini-2.5-pro",
      "gemini-3.1-flash-lite-preview",
      "gemini-2.5-flash"
    ];
    
    for (const pref of preferidos) {
      if (modelosDisponibles.includes(pref)) {
        modeloElegido = pref;
        break;
      }
    }
    
    console.log("⚡ EJECUTANDO IA:", modeloElegido);

    // 3. Forzamos a la IA a que nos responda ÚNICAMENTE con datos JSON
    const model = genAI.getGenerativeModel({ 
        model: modeloElegido,
        generationConfig: {
            responseMimeType: "application/json", // Esto ahorra tokens y evita texto basura
        }
    });

    const prompt = `
      Eres una IA de ajedrez cyberpunk. Analiza la jugada: ${jugadaUsuario} en el FEN: ${fen}.
      REGLAS ESTRICTAS PARA AHORRAR TOKENS Y API:
      1. Sé extremadamente breve (máximo 15 palabras).
      2. Devuelve un objeto JSON estricto con dos propiedades:
         - "mensaje": Tu texto corto advirtiendo o felicitando.
         - "casillas_peligro": Un arreglo de strings con las casillas que quedaron vulnerables o atacadas (ej: ["e4", "f7"]). Si no hay peligro, devuelve [].
      
      Ejemplo de salida:
      {"mensaje": "[ALERTA] El caballo en c3 quedó sin protección.", "casillas_peligro": ["c3"]}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textoRespuesta = response.text();
    
    // Convertimos la respuesta de la IA en datos usables para el tablero
    const datos = JSON.parse(textoRespuesta);

    return NextResponse.json({ 
        respuesta: datos.mensaje || "[SISTEMA] Análisis completado.",
        casillasPeligro: datos.casillas_peligro || []
    });

  } catch (error: any) {
    console.error("Error crítico en Oráculo:", error);
    return NextResponse.json(
      { respuesta: "[ANOMALÍA] Servidores neurales ocupados.", casillasPeligro: [] },
      { status: 500 }
    );
  }
}