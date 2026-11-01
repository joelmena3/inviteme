import type { Metadata } from "next";

// Todo lo que vive en /admin comparte la hoja de estilos del panel
// y queda fuera de los buscadores.
export const metadata: Metadata = {
  title: "Administrador · InviteMe",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <link rel="stylesheet" href="/motor/admin.css" />
      {children}
    </div>
  );
}
