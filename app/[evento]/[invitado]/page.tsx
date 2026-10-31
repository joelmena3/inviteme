import { Vista, metadatos } from "../vista";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ evento: string; invitado: string }> };

export async function generateMetadata({ params }: P) {
  const { evento, invitado } = await params;
  return metadatos(evento, invitado);
}

export default async function Page({ params }: P) {
  const { evento, invitado } = await params;
  return <Vista evento={evento} invitado={invitado} />;
}
