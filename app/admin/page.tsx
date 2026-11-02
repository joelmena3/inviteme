import Link from "next/link";
import { Copiar } from "@/app/[evento]/panel/botones";
import { exigirAdmin } from "@/lib/admin";
import { MSG_NUEVO_CLIENTE, msgPagoConfirmado } from "@/lib/mensajes";
import { db } from "@/lib/supabase";
import { DISENOS, estadoPago, nombreDe, PAQUETES, partesFecha, pesos, TIPOS, ZONA } from "@/lib/util";
import { Aviso, Barra } from "./barra";
import { Plantillas } from "./plantillas";

export const dynamic = "force-dynamic";

type Fila = {
  id: string; folio: string | null; slug: string; nombre: string; tipo: string; fecha: string; diseno: string;
  paquete: string; precio: number; cliente_nombre: string | null;
  pagos: { monto: number; fecha: string }[]; invitados: { count: number }[]; contenido: { formulario?: { fechaPendiente?: boolean } };
};

const fechaBonita = (iso: string) =>
  new Intl.DateTimeFormat("es-MX", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: ZONA }).format(new Date(iso));

export default async function Admin({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string; tab?: string; p?: string; datos?: string }> }) {
  await exigirAdmin();
  const { msg, error: esError, tab, p: plantilla, datos } = await searchParams;
  const enMensajes = tab === "mensajes";
  const enPlantillas = tab === "plantillas";
  const enEventos = !enMensajes && !enPlantillas;
  const { data, error } = await db()
    .from("eventos")
    .select("id, folio, slug, nombre, tipo, fecha, diseno, paquete, precio, cliente_nombre, contenido, pagos(monto, fecha), invitados(count)")
    .order("fecha", { ascending: true });

  if (error) {
    return (
      <main className="adm-wrap">
        <Barra />
        <p className="notice">
          No pude leer los eventos. Si es la primera vez que entras, corre el archivo <code>supabase/03_admin_storage.sql</code> en
          Supabase → SQL Editor y recarga esta página.
        </p>
      </main>
    );
  }

  const filas = (data || []) as unknown as Fila[];
  const ahora = Date.now();
  const hoy = partesFecha(new Date().toISOString()).dia;
  const mesActual = hoy.slice(0, 7);
  const pagado = (f: Fila) => f.pagos.reduce((s, p) => s + Number(p.monto), 0);

  const proximos = filas.filter((f) => new Date(f.fecha).getTime() >= ahora - 12 * 3600e3);
  const pasados = filas.filter((f) => !proximos.includes(f)).reverse();
  const cobradoTotal = filas.reduce((s, f) => s + pagado(f), 0);
  const cobradoMes = filas.flatMap((f) => f.pagos).filter((p) => p.fecha.startsWith(mesActual)).reduce((s, p) => s + Number(p.monto), 0);
  const porCobrar = filas.reduce((s, f) => s + Math.max(Number(f.precio) - pagado(f), 0), 0);

  const lista = (items: Fila[]) => (
    <ul className="rows">
      {items.map((f) => {
        const p = pagado(f);
        const est = estadoPago(Number(f.precio), p);
        return (
          <li key={f.id}>
            <Link href={`/admin/evento/${f.id}`} className="ev-row">
              <span className="folio">{f.folio || "—"}</span>
              <span style={{ minWidth: 0 }}>
                <span className="name">{f.nombre} · {nombreDe(TIPOS, f.tipo)}</span>
                <span className="meta">
                  <span>{f.contenido?.formulario?.fechaPendiente ? "Fecha por definir" : fechaBonita(f.fecha)}</span>
                  <span>/{f.slug}</span>
                  <span>{nombreDe(DISENOS, f.diseno)}</span>
                  <span>{f.invitados?.[0]?.count ?? 0} invitados</span>
                  {f.cliente_nombre && <span>Cliente: {f.cliente_nombre}</span>}
                </span>
              </span>
              <span className="right">
                <span className={`chip ${est.c}`}>{est.t}</span>
                <span className="money">
                  {nombreDe(PAQUETES, f.paquete)}
                  {Number(f.precio) > 0 && ` · ${pesos(p)} de ${pesos(Number(f.precio))}`}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <main className="adm-wrap">
      <Barra>
        <Link className="btn sm" href="/admin/nuevo">+ Nuevo evento</Link>
      </Barra>
      <Aviso msg={msg} error={esError} />

      <div>
        <p className="eyebrow">Tu negocio</p>
        <h1>{enMensajes ? "Mensajes" : enPlantillas ? "Templates" : "Eventos"}</h1>
      </div>

      <nav className="tabs" aria-label="Secciones del panel">
        <Link href="/admin" className={enEventos ? "on" : ""} aria-current={enEventos ? "page" : undefined}>Próximos eventos</Link>
        <Link href="/admin?tab=mensajes" className={enMensajes ? "on" : ""} aria-current={enMensajes ? "page" : undefined}>Mensajes de WhatsApp</Link>
        <Link href="/admin?tab=plantillas" className={enPlantillas ? "on" : ""} aria-current={enPlantillas ? "page" : undefined}>Templates</Link>
      </nav>

      {enPlantillas ? (
        <Plantillas eventos={filas} elegido={plantilla} datos={datos} />
      ) : enMensajes ? (
        <>
          <section className="card" aria-labelledby="h-m1">
            <div className="card-head"><h2 id="h-m1">1 · Nuevo cliente</h2><Copiar texto={MSG_NUEVO_CLIENTE} etiqueta="Copiar mensaje" /></div>
            <p className="soft sm" style={{ margin: 0 }}>Cuando alguien te escriba por primera vez. Tip: en WhatsApp Business guárdalo como respuesta rápida “/info”.</p>
            <pre className="wa-msg">{MSG_NUEVO_CLIENTE}</pre>
          </section>
          <section className="card" aria-labelledby="h-m2">
            <div className="card-head"><h2 id="h-m2">2 · Pago confirmado</h2></div>
            <p className="soft sm" style={{ margin: 0 }}>
              Cuando el cliente te mande su comprobante. Créale su evento y, en la tarjeta “Formulario del cliente”, toca <b>Enviar por WhatsApp</b>:
              el mensaje sale con su nombre y el link de su formulario.
            </p>
            <pre className="wa-msg">{msgPagoConfirmado({ nombre: "NOMBRE", link: "[link de su formulario]" })}</pre>
          </section>
        </>
      ) : (
        <>

      <section className="tiles" aria-label="Resumen">
        <div className="tile"><span className="lbl">Próximos</span><b className="n">{proximos.length}</b><small>eventos por venir</small></div>
        <div className="tile"><span className="lbl">Cobrado este mes</span><b className="n">{pesos(cobradoMes)}</b><small>pagos registrados</small></div>
        <div className="tile"><span className="lbl">Por cobrar</span><b className="n">{pesos(porCobrar)}</b><small>saldos pendientes</small></div>
        <div className="tile"><span className="lbl">Cobrado total</span><b className="n">{pesos(cobradoTotal)}</b><small>desde el inicio</small></div>
      </section>

      <section className="card flush" aria-labelledby="h-prox">
        <div className="card-head"><h2 id="h-prox">Próximos ({proximos.length})</h2></div>
        {proximos.length ? lista(proximos) : <p className="empty">No hay eventos próximos. Crea el primero con “Nuevo evento”.</p>}
      </section>

      {pasados.length > 0 && (
        <section className="card flush" aria-labelledby="h-past">
          <div className="card-head"><h2 id="h-past">Pasados ({pasados.length})</h2></div>
          {lista(pasados)}
        </section>
      )}
        </>
      )}
    </main>
  );
}
