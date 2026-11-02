import "server-only";
import { plantillaDe } from "@/plantillas";
import type { DatosPlantilla } from "@/plantillas/_comun/secciones";

// Arma la página completa de una invitación con datos de ejemplo (sin base de datos).
// La usan la vista previa del administrador y los ejemplos públicos de la portada.
// La confirmación de asistencia se simula: nadie confirma de verdad.

const escAttr = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function paginaDeEjemplo(id: string, datos: DatosPlantilla, titulo: string): string {
  const { render, info } = plantillaDe(id);
  let cuerpo: string;
  try {
    cuerpo = render({ ...datos, ev: { ...datos.ev, diseno: info.id } });
  } catch (e) {
    cuerpo = `<p style="padding:24px;font-family:system-ui">Este template falla al armarse: ${escAttr(String((e as Error).message))}</p>`;
  }
  const dir = `/plantillas/${info.id}`;

  const simulador = `(function(){var f=window.fetch;window.fetch=function(u,o){if(String(u).indexOf("/api/")===0){return Promise.resolve(new Response(JSON.stringify({ok:true}),{status:200,headers:{"Content-Type":"application/json"}}));}return f.apply(this,arguments);};})();`;

  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>${escAttr(titulo)}</title>
${info.fuentes ? `<link rel="stylesheet" href="${escAttr(info.fuentes)}">` : ""}
<link rel="stylesheet" href="${dir}/estilos.css">
<script>${simulador}</script>
</head>
<body data-design="${escAttr(info.id)}"><div data-design="${escAttr(info.id)}" class="invitacion">${cuerpo}</div>
<script src="${dir}/dibujos.js" defer></script>
<script src="/plantillas/_comun/motor.js" defer></script>
</body></html>`;
}
