import { NextResponse } from "next/server";
import { plantillasPublicas } from "@/lib/portada";

// Lista de templates para el selector de la portada (public/inicio.html).
// Ver lib/portada.ts para el orden y cuáles se muestran.
export function GET() {
  return NextResponse.json(plantillasPublicas(), {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
