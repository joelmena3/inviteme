import "server-only";
import { db } from "./supabase";
import type { Confirmacion, Evento, Invitado } from "./tipos";

export async function getEvento(slug: string): Promise<Evento | null> {
  const { data, error } = await db()
    .from("eventos")
    .select("id, slug, nombre, fecha, diseno, contenido")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return (data as Evento) ?? null;
}

const GENERAL = (): Invitado => ({ id: null, codigo: "", nombre: "Querida familia", pases: null });

export async function getInvitado(eventoId: string, codigo?: string): Promise<Invitado> {
  if (!codigo) return GENERAL();
  const { data, error } = await db()
    .from("invitados")
    .select("id, codigo, nombre, pases")
    .eq("evento_id", eventoId)
    .eq("codigo", codigo.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return (data as Invitado) ?? GENERAL();
}

export async function getUltimaConfirmacion(invitadoId: string | null): Promise<Confirmacion | null> {
  if (!invitadoId) return null;
  const { data, error } = await db()
    .from("confirmaciones")
    .select("asiste, personas, mensaje")
    .eq("invitado_id", invitadoId)
    .order("creado", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Confirmacion) ?? null;
}
