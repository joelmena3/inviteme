import { Vista, metadatos } from "./vista";

export const dynamic = "force-dynamic";
type P = { params: Promise<{ evento: string }> };

export async function generateMetadata({ params }: P) {
  const { evento } = await params;
  return metadatos(evento);
}

export default async function Page({ params }: P) {
  const { evento } = await params;
  return <Vista evento={evento} />;
}
