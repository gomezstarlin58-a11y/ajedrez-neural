// @ts-nocheck
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { respuestasCorrectas, tiempoTotal } = await req.json();
  
  // Algoritmo de nivelación automática
  let nivelAsignado = 1;
  let rango = "Novato de Red";

  if (respuestasCorrectas === 5 && tiempoTotal < 60) {
    nivelAsignado = 15;
    rango = "Hacker de Aperturas";
  } else if (respuestasCorrectas >= 3) {
    nivelAsignado = 5;
    rango = "Aprendiz de Datos";
  }

  return NextResponse.json({ 
    nivel: nivelAsignado, 
    rango: rango,
    mensaje: "Calibración completa. Acceso a la Academia concedido."
  });
}