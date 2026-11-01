import { redirect } from "next/navigation";
import { adminConfigurado, esAdmin } from "@/lib/admin";
import { Enviar } from "@/app/[evento]/panel/botones";
import { entrar } from "../acciones";

export const dynamic = "force-dynamic";

export default async function Entrar({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await esAdmin()) redirect("/admin");
  const { e } = await searchParams;
  const listo = adminConfigurado();
  return (
    <main className="login">
      <form action={entrar} className="card">
        <span className="seal" aria-hidden="true">iM</span>
        <div>
          <p className="eyebrow" style={{ textAlign: "center" }}>InviteMe</p>
          <h1>Administrador</h1>
        </div>
        {!listo && (
          <p className="notice">
            Falta la contraseña. En Vercel, agrega la variable <code>ADMIN_PASSWORD</code> (mínimo 8 caracteres) y vuelve a publicar.
          </p>
        )}
        {e && <p className="flash error" role="alert">Contraseña incorrecta.</p>}
        <div className="field">
          <label htmlFor="pw">Contraseña</label>
          <input id="pw" name="password" type="password" autoComplete="current-password" required autoFocus disabled={!listo} />
        </div>
        <Enviar ocupado="Entrando…" className="btn">Entrar</Enviar>
      </form>
    </main>
  );
}
