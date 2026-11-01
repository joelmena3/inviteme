import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEvento, getInvitado, getUltimaConfirmacion } from "@/lib/datos";
import { renderInvitacion } from "@/lib/plantilla";

// Página compartida por /[evento] y /[evento]/[invitado]
export async function Vista({ evento, invitado }: { evento: string; invitado?: string }) {
  const ev = await getEvento(evento);
  if (!ev) notFound();
  const inv = await getInvitado(ev.id, invitado);
  const previa = await getUltimaConfirmacion(inv.id);
  const html = renderInvitacion(ev, inv, previa);
  return (
    <>
      <link rel="stylesheet" href="/motor/invitacion.css" />
      <div data-design={ev.diseno} className="invitacion" dangerouslySetInnerHTML={{ __html: html }} />
      <script dangerouslySetInnerHTML={{ __html: `document.body.dataset.design=${JSON.stringify(ev.diseno)};` }} />
      <script src="/motor/invitacion.js" defer />
    </>
  );
}

export async function metadatos(evento: string, invitado?: string): Promise<Metadata> {
  const ev = await getEvento(evento);
  if (!ev) return { title: "Invitación no encontrada" };
  const inv = invitado ? await getInvitado(ev.id, invitado) : null;
  const c = ev.contenido;
  const titulo = `${c.kicker} · ${ev.nombre}`;
  const desc = `${inv && inv.id ? inv.nombre + ", te" : "Te"} invitamos: ${c.fecha.larga}, ${c.fecha.hora}.`;
  return {
    title: titulo,
    description: desc,
    openGraph: { title: titulo, description: desc, images: c.portada?.src ? [{ url: c.portada.src }] : [] },
    robots: { index: false, follow: false },
  };
}
