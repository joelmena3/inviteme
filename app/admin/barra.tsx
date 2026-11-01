import Link from "next/link";
import { salir } from "./acciones";

export function Barra({ children }: { children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <Link href="/admin" className="brand">
        <span className="seal" aria-hidden="true">iM</span>
        <span><b>InviteMe</b><small>Administrador</small></span>
      </Link>
      <nav>
        {children}
        <form action={salir}><button className="btn ghost sm" type="submit">Salir</button></form>
      </nav>
    </header>
  );
}

export function Aviso({ msg, error }: { msg?: string; error?: string }) {
  if (!msg) return null;
  return <p className={`flash${error ? " error" : ""}`} role="status">{msg}</p>;
}
