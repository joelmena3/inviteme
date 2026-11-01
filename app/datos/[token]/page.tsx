import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/supabase";
import type { Contenido } from "@/lib/tipos";
import { fotosPorPaquete, MI_WHATSAPP, partesFecha, waLink } from "@/lib/util";
import { Formulario } from "./formulario";

// Formulario para que el cliente capture los datos de su invitación.
// Se abre con el link que le mandas por WhatsApp desde el panel de administrador.
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Datos de tu invitación · InviteMe", robots: { index: false, follow: false } };

export default async function Datos({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f]{32}$/.test(token)) notFound();
  const { data: ev } = await db().from("eventos").select("*").eq("admin_key", token).maybeSingle();
  if (!ev) notFound();
  const c = ev.contenido as Contenido;
  const { count } = await db().from("invitados").select("id", { count: "exact", head: true }).eq("evento_id", ev.id);
  const ayuda = waLink(MI_WHATSAPP, `Hola, tengo una duda con el formulario de mi invitación (${ev.folio || ev.slug}).`);

  if (c.formulario?.cerrado) {
    return (
      <div className="adm">
        <link rel="stylesheet" href="/motor/admin.css" />
        <main className="login">
          <div className="card" style={{ textAlign: "center" }}>
            <span className="seal" aria-hidden="true">iM</span>
            <h1>¡Gracias, {ev.nombre}!</h1>
            <p className="soft">Ya tenemos todos tus datos y estamos terminando tu invitación. Si necesitas cambiar algo, escríbenos.</p>
            <div className="btns" style={{ justifyContent: "center" }}>
              <a className="btn" href={ayuda} target="_blank" rel="noopener">Escribir por WhatsApp</a>
              <a className="btn ghost" href={`/${ev.slug}`}>Ver mi invitación</a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { dia, hora } = partesFecha(ev.fecha);
  const esBoda = ev.tipo === "boda";
  return (
    <div className="adm">
      <link rel="stylesheet" href="/motor/admin.css" />
      <Formulario
        token={token}
        ayuda={ayuda}
        linkInvitacion={`/${ev.slug}`}
        config={{
          esBoda,
          folio: ev.folio || "",
          maxFotos: c.formulario?.maxFotos ?? fotosPorPaquete(ev.paquete),
          invitadosActuales: count || 0,
          yaEnviado: !!c.formulario?.recibido,
          titulos: {
            padres: c.padres?.titulo, padresNovia: c.padresNovia?.titulo, padresNovio: c.padresNovio?.titulo, padrinos: c.padrinos?.titulo,
            ceremonia: c.ceremonia?.titulo,
          },
        }}
        inicial={{
          nombre: ev.nombre,
          dia,
          hora,
          lugarNombre: c.lugar?.nombre || "",
          lugarDireccion: c.lugar?.direccion || "",
          mensaje: c.mensaje || "",
          portada: c.portada?.src ? { src: c.portada.src, w: c.portada.w, h: c.portada.h } : null,
          fotos: (c.linea || []).filter((m) => m.fotos[0]).map((m) => ({ ...m.fotos[0], titulo: m.label, cuando: m.when })),
          ...(c.padres ? { padres: c.padres.nombres } : {}),
          ...(c.padresNovia ? { padresNovia: c.padresNovia.nombres } : {}),
          ...(c.padresNovio ? { padresNovio: c.padresNovio.nombres } : {}),
          ...(c.padrinos ? { padrinos: c.padrinos.nombres } : {}),
          ...(c.ceremonia ? { ceremonia: { nombre: c.ceremonia.nombre, direccion: c.ceremonia.direccion, hora: c.ceremonia.hora } } : {}),
          ...(c.dresscode ? { dresscode: { titulo: c.dresscode.titulo, texto: c.dresscode.texto } } : {}),
          ...(c.regalos ? { regalos: c.regalos.tiendas.length ? c.regalos.tiendas : [{ nombre: "", numero: "", url: "" }] } : {}),
          ...(c.clabe ? { clabe: { clabe: c.clabe.clabe, banco: c.clabe.banco, titular: c.clabe.titular } } : {}),
          ...(c.traer ? { traer: c.traer.texto } : {}),
          invitados: "",
          cancion: c.formulario?.cancion || "",
          comentarios: c.formulario?.comentarios || "",
        }}
      />
    </div>
  );
}
