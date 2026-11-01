import Link from "next/link";
import { headers } from "next/headers";
import { exigirAdmin } from "@/lib/admin";
import { Enviar } from "@/app/[evento]/panel/botones";
import { DISENOS, PAQUETES, pesos, TIPOS } from "@/lib/util";
import { crearEvento } from "../acciones";
import { Aviso, Barra } from "../barra";

export const dynamic = "force-dynamic";

export default async function Nuevo({ searchParams }: { searchParams: Promise<{ msg?: string; error?: string }> }) {
  await exigirAdmin();
  const { msg, error } = await searchParams;
  const host = (await headers()).get("host") || "inviteme.mx";

  return (
    <main className="adm-wrap">
      <Barra>
        <Link className="btn ghost sm" href="/admin">← Eventos</Link>
      </Barra>
      <Aviso msg={msg} error={error} />

      <div>
        <p className="eyebrow">Paso 1 de 2</p>
        <h1>Nuevo evento</h1>
        <p className="soft">Con estos datos se crea el evento y su folio. Después agregas fotos, textos, música e invitados.</p>
      </div>

      <form action={crearEvento} style={{ display: "contents" }}>
        <section className="card">
          <h2>El evento</h2>
          <div className="grid">
            <div className="field">
              <label htmlFor="nombre">Nombre del festejado o pareja</label>
              <input id="nombre" name="nombre" required maxLength={80} placeholder="Ej. Majo · Ana y Luis" />
            </div>
            <div className="field">
              <label htmlFor="tipo">Tipo de evento</label>
              <select id="tipo" name="tipo" defaultValue="cumpleanos-nina">
                {TIPOS.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
            <div className="field span-all">
              <label htmlFor="slug">Link de la invitación</label>
              <div className="prefix"><span>{host}/</span><input id="slug" name="slug" maxLength={40} placeholder="se crea del nombre si lo dejas vacío" /></div>
              <small>Solo minúsculas, números y guiones. Ej. ana-y-luis</small>
            </div>
            <div className="field">
              <label htmlFor="dia">Fecha</label>
              <input id="dia" name="dia" type="date" required />
            </div>
            <div className="field">
              <label htmlFor="hora">Hora</label>
              <input id="hora" name="hora" type="time" required defaultValue="14:00" />
            </div>
            <div className="field">
              <label htmlFor="lugar_nombre">Lugar</label>
              <input id="lugar_nombre" name="lugar_nombre" maxLength={120} placeholder="Ej. Jardín Los Olivos" />
            </div>
            <div className="field">
              <label htmlFor="lugar_direccion">Dirección</label>
              <input id="lugar_direccion" name="lugar_direccion" maxLength={200} placeholder="Calle, colonia, ciudad" />
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Diseño (template)</h2>
          <div className="picks">
            {DISENOS.map((d, i) => (
              <label key={d.id} className="pick">
                <input type="radio" name="diseno" value={d.id} defaultChecked={i === 0} />
                <span className={`sw ${d.id}`} aria-hidden="true" />
                <span><b>{d.nombre}</b><small>{d.desc}</small></span>
              </label>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>Paquete y cliente</h2>
          <div className="picks">
            {PAQUETES.map((p) => (
              <label key={p.id} className="pick">
                <input type="radio" name="paquete" value={p.id} defaultChecked={p.id === "wow"} />
                <span><b>{p.nombre}</b><small>{p.precio ? pesos(p.precio) : "Precio libre"}</small></span>
              </label>
            ))}
          </div>
          <div className="grid">
            <div className="field">
              <label htmlFor="precio">Precio cobrado (MXN)</label>
              <input id="precio" name="precio" type="number" min="0" step="1" inputMode="numeric" placeholder="Vacío = precio del paquete" />
            </div>
            <div className="field">
              <label htmlFor="cliente_nombre">Nombre del cliente</label>
              <input id="cliente_nombre" name="cliente_nombre" maxLength={80} placeholder="Quien te contrató" />
            </div>
            <div className="field">
              <label htmlFor="cliente_whatsapp">WhatsApp del cliente</label>
              <input id="cliente_whatsapp" name="cliente_whatsapp" type="tel" maxLength={20} placeholder="55 1234 5678" />
            </div>
            <div className="field">
              <label htmlFor="notas">Notas internas</label>
              <input id="notas" name="notas" maxLength={500} placeholder="Solo las ves tú" />
            </div>
          </div>
          <p className="soft sm">Al crear el evento se genera su folio (INV-0002, INV-0003…). Compártelo con tu cliente para identificar su pago.</p>
        </section>

        <div className="btns">
          <Enviar ocupado="Creando…" className="btn">Crear evento</Enviar>
          <Link href="/admin" className="btn ghost">Cancelar</Link>
        </div>
      </form>
    </main>
  );
}
