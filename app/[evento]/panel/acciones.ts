"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/supabase";
import { codigoDesde } from "@/lib/util";
import { abrirSesionPanel, cerrarSesionPanel, claveCorrecta, puedeEntrar } from "@/lib/panel";

// Acciones del panel. Cada una vuelve a comprobar la clave del evento
// y solo toca filas que pertenecen a ese evento.

type Ev = { id: string; slug: string };

async function autorizar(fd: FormData): Promise<{ ev: Ev; key: string }> {
  const slug = String(fd.get("evento") || "");
  const key = String(fd.get("key") || "");
  const { data } = await db().from("eventos").select("*").eq("slug", slug).maybeSingle();
  if (!data || !(await puedeEntrar(data, key))) throw new Error("No autorizado");
  return { ev: { id: data.id, slug: data.slug }, key };
}

function volver(ev: Ev, key: string, msg: string, ancla = ""): never {
  redirect(`/${ev.slug}/panel?${key ? `key=${encodeURIComponent(key)}&` : ""}msg=${encodeURIComponent(msg)}${ancla ? "#" + ancla : ""}`);
}

// Entrada con contraseña (eventos que la tienen)
export async function entrarPanel(fd: FormData) {
  const slug = String(fd.get("evento") || "");
  const { data } = await db().from("eventos").select("*").eq("slug", slug).maybeSingle();
  if (!data?.panel_hash) redirect(`/${slug}/panel`);
  if (!claveCorrecta(String(fd.get("password") || ""), data.panel_hash)) {
    await new Promise((r) => setTimeout(r, 900)); // frena a quien intente adivinar
    redirect(`/${slug}/panel?e=1`);
  }
  await abrirSesionPanel(data.id, data.panel_hash);
  redirect(`/${slug}/panel`);
}

export async function salirPanel(fd: FormData) {
  const slug = String(fd.get("evento") || "");
  const { data } = await db().from("eventos").select("id").eq("slug", slug).maybeSingle();
  if (data) await cerrarSesionPanel(data.id);
  redirect(`/${slug}/panel`);
}

const leerPases = (v: FormDataEntryValue | null): number | null => {
  const n = Math.floor(Number(v));
  return v === null || v === "" || v === "ilimitados" || !Number.isFinite(n) || n < 1 ? null : Math.min(n, 30);
};

export async function agregarInvitado(fd: FormData) {
  const { ev, key } = await autorizar(fd);
  const nombre = String(fd.get("nombre") || "").trim().slice(0, 80);
  if (!nombre) volver(ev, key, "Escribe el nombre del invitado.", "agregar");
  const pases = leerPases(fd.get("pases"));

  const base = codigoDesde(nombre);
  const { data: usados } = await db().from("invitados").select("codigo").eq("evento_id", ev.id).like("codigo", `${base}%`);
  const set = new Set((usados || []).map((u) => u.codigo));
  let codigo = base;
  for (let i = 2; set.has(codigo); i++) codigo = `${base}-${i}`;

  const { error } = await db().from("invitados").insert({ evento_id: ev.id, codigo, nombre, pases });
  volver(ev, key, error ? "No se pudo agregar. Inténtalo de nuevo." : `Agregaste a ${nombre}.`, error ? "agregar" : `inv-${codigo}`);
}

export async function editarInvitado(fd: FormData) {
  const { ev, key } = await autorizar(fd);
  const id = String(fd.get("id") || "");
  const nombre = String(fd.get("nombre") || "").trim().slice(0, 80);
  const pases = leerPases(fd.get("pases"));
  if (!nombre) volver(ev, key, "El nombre no puede quedar vacío.");
  const { data, error } = await db()
    .from("invitados")
    .update({ nombre, pases })
    .eq("id", id)
    .eq("evento_id", ev.id)
    .select("codigo")
    .maybeSingle();
  volver(ev, key, error || !data ? "No se pudo guardar el cambio." : `Guardaste los cambios de ${nombre}.`, data ? `inv-${data.codigo}` : "");
}

export async function reiniciarRespuesta(fd: FormData) {
  const { ev, key } = await autorizar(fd);
  const id = String(fd.get("id") || "");
  const nombre = String(fd.get("nombre") || "el invitado");
  const { error } = await db().from("confirmaciones").delete().eq("evento_id", ev.id).eq("invitado_id", id);
  volver(ev, key, error ? "No se pudo reiniciar la respuesta." : `${nombre} puede volver a confirmar.`);
}

export async function eliminarInvitado(fd: FormData) {
  const { ev, key } = await autorizar(fd);
  const id = String(fd.get("id") || "");
  const nombre = String(fd.get("nombre") || "el invitado");
  const sb = db();
  const r1 = await sb.from("confirmaciones").delete().eq("evento_id", ev.id).eq("invitado_id", id);
  const r2 = r1.error ? r1 : await sb.from("invitados").delete().eq("evento_id", ev.id).eq("id", id);
  volver(ev, key, r2.error ? "No se pudo eliminar." : `Eliminaste a ${nombre} y sus respuestas.`);
}

export async function eliminarRespuesta(fd: FormData) {
  const { ev, key } = await autorizar(fd);
  const id = String(fd.get("id") || "");
  const { error } = await db().from("confirmaciones").delete().eq("evento_id", ev.id).eq("id", id);
  volver(ev, key, error ? "No se pudo eliminar la respuesta." : "Respuesta eliminada.", "respuestas");
}
