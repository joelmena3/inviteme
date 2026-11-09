import { NextResponse } from "next/server";
import { plantillasPublicas } from "@/lib/portada";

// Lista de templates para el selector de la portada (public/inicio.html).
// Ver lib/portada.ts para el orden y cuáles se muestran (solo los públicos).
// Se guarda en caché un minuto: al publicar o hacer privado un template, la web cambia en ≤ 1 min.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await plantillasPublicas(), {
      headers: { "Cache-Control": "public, max-age=0, s-maxage=60" },
    });
  } catch {
    return NextResponse.json([], { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
