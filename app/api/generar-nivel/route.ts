import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, modulo } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) return NextResponse.json({ error: "Falta la llave GEMINI_API_KEY" }, { status: 500 });

    // 1. SISTEMA DE ESCANEO DE MODELOS (TU CÓDIGO)
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const peticionModelos = await fetch(url);
    const dataModelos = await peticionModelos.json();

    const modelosDisponibles = dataModelos.models
        .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m: any) => m.name.replace("models/", ""));
        
    let modeloElegido = "gemini-pro"; 
    const preferidos = ["gemini-3.1-pro-preview", "gemini-2.5-pro", "gemini-3.1-flash-lite-preview", "gemini-2.5-flash"];
    
    for (const pref of preferidos) {
      if (modelosDisponibles.includes(pref)) { modeloElegido = pref; break; }
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modeloElegido }); 

    // 2. SEPARACIÓN DE CEREBROS SEGÚN EL MÓDULO
    let instruccionSistema = "";

    if (modulo === 'Partidas Épicas' || modulo === 'epicas') {
      instruccionSistema = `
      Eres un Gran Maestro de Ajedrez e Historiador. Tu misión es generar los datos de una partida legendaria basándote en esta petición: "${prompt}".
      
      Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta:
      {
        "titulo": "El nombre épico de la partida (Ej: Kasparov vs Topalov, Wijk aan Zee 1999)",
        "historia": "Un párrafo narrando el contexto histórico, por qué es famosa y qué la hace brillante.",
        "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "pgn": "El PGN completo y oficial de la partida. Solo los movimientos limpios (ej: 1. e4 e5 2. Nf3...)",
        "comentarios": {
          "12": "¡Aquí empieza la magia! Las blancas sacrifican la torre...",
          "24": "Un movimiento letal que destruye la defensa de las negras."
        }
      }
      
      REGLAS PARA LOS COMENTARIOS: El objeto "comentarios" debe tener como 'clave' el número del movimiento en el que se hizo la jugada (del 1 en adelante) y como 'valor' tu explicación táctica. No comentes cada jugada, solo comenta de 4 a 6 jugadas que sean críticas, errores graves o sacrificios brillantes.
      `;
    } else {
      instruccionSistema = `
      Eres un Gran Maestro de Ajedrez creando contenido para: ${modulo}.
      Petición: "${prompt}"

      Devuelve ÚNICAMENTE un JSON válido con estas claves:
      {
        "titulo": "Título corto",
        "instruccion": "Teoría breve del concepto",
        "fen": "Código FEN válido (si aplica, si no déjalo vacío '')",
        "pregunta": "Pregunta directa",
        "opcionA": "Opcion 1",
        "opcionB": "Opcion 2",
        "opcionC": "Opcion 3",
        "correcta": "A, B o C",
        "feedback": "Explicación de por qué la correcta gana",
        "jugada_correcta": "La jugada exacta en el tablero en formato origenDestino (ejemplo: d5f6, o e4e5). SOLO letras minúsculas y números. Si es Entrenamiento Ciego o Matemático déjalo vacío ''."
      }
      `;
    }

    // 3. EJECUCIÓN Y LIMPIEZA DE DATOS (TU CÓDIGO)
    const result = await model.generateContent(instruccionSistema);
    const response = await result.response;
    let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    
    return NextResponse.json(JSON.parse(text));

  } catch (error: any) {
    console.error("Fallo de conexión neural:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}