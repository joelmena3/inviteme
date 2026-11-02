import { esAdmin } from "@/lib/admin";
import { CATALOGO } from "@/plantillas/catalogo";
import { plantillaDe } from "@/plantillas";
import type { DatosPlantilla } from "@/plantillas/_comun/secciones";
import completo from "@/scripts/pruebas/evento-completo.json";
import minimo from "@/scripts/pruebas/evento-minimo.json";

// Vista previa de un template con datos de ejemplo, solo para el administrador.
// La pestaña "Templates" del panel la muestra dentro de un marco de celular.
//   /admin/plantillas/<id>/vista               → evento completo (paquete Wow)
//   /admin/plantillas/<id>/vista?datos=minimo  → evento con lo mínimo (Express)
// No toca la base de datos: la confirmación de asistencia se simula.

export const dynamic = "force-dynamic";

const escAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) return new Response("Necesitas entrar al panel de administrador.", { status: 401 });

  const { id } = await params;
  if (!CATALOGO.some((p) => p.id === id)) return new Response("Ese template no existe.", { status: 404 });

  const conMinimo = new URL(req.url).searchParams.get("datos") === "minimo";
  const base = (conMinimo ? minimo : completo) as unknown as DatosPlantilla;
  const datos: DatosPlantilla = { ...base, ev: { ...base.ev, diseno: id } };

  const { render, info } = plantillaDe(id);
  let cuerpo: string;
  try {
    cuerpo = render(datos);
  } catch (e) {
    cuerpo = `<p style="padding:24px;font-family:system-ui">Este template falla al armarse: ${escAttr(String((e as Error).message))}</p>`;
  }
  const dir = `/plantillas/${info.id}`;

  // En la vista previa nadie confirma de verdad: respondemos como si se hubiera guardado.
  const simulador = `(function(){var f=window.fetch;window.fetch=function(u,o){if(String(u).indexOf("/api/")===0){return Promise.resolve(new Response(JSON.stringify({ok:true}),{status:200,headers:{"Content-Type":"application/json"}}));}return f.apply(this,arguments);};})();`;

  const pagina = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Vista previa · ${escAttr(info.nombre)}</title>
${info.fuentes ? `<link rel="stylesheet" href="${escAttr(info.fuentes)}">` : ""}
<link rel="stylesheet" href="${dir}/estilos.css">
<script>${simulador}</script>
</head>
<body data-design="${escAttr(info.id)}"><div data-design="${escAttr(info.id)}" class="invitacion">${cuerpo}</div>
<script src="${dir}/dibujos.js" defer></script>
<script src="/plantillas/_comun/motor.js" defer></script>
</body></html>`;

  return new Response(pagina, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
