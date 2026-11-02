import { esAdmin } from "@/lib/admin";
import { CATALOGO } from "@/plantillas/catalogo";
import { plantillaDe } from "@/plantillas";
import type { DatosPlantilla } from "@/plantillas/_comun/secciones";
import { paginaDeEjemplo } from "@/lib/vista-plantilla";
import completo from "@/scripts/pruebas/evento-completo.json";
import minimo from "@/scripts/pruebas/evento-minimo.json";

// Vista previa de un template con datos de ejemplo, solo para el administrador.
// La pestaña "Templates" del panel la muestra dentro de un marco de celular.
//   /admin/plantillas/<id>/vista               → evento completo (paquete Wow)
//   /admin/plantillas/<id>/vista?datos=minimo  → evento con lo mínimo (Express)
// No toca la base de datos: la confirmación de asistencia se simula.

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) return new Response("Necesitas entrar al panel de administrador.", { status: 401 });

  const { id } = await params;
  if (!CATALOGO.some((p) => p.id === id)) return new Response("Ese template no existe.", { status: 404 });

  const conMinimo = new URL(req.url).searchParams.get("datos") === "minimo";
  const base = (conMinimo ? minimo : completo) as unknown as DatosPlantilla;
  const datos: DatosPlantilla = { ...base, ev: { ...base.ev, diseno: id } };

  const { info } = plantillaDe(id);
  const pagina = paginaDeEjemplo(id, datos, `Vista previa · ${info.nombre}`);

  return new Response(pagina, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
