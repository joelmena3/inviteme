"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

// Botón de envío que muestra "Guardando…" mientras trabaja.
export function Enviar({ children, className = "btn", ocupado = "Guardando…" }: { children: React.ReactNode; className?: string; ocupado?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? ocupado : children}
    </button>
  );
}

// Botón de dos toques para acciones que no se pueden deshacer:
// el primer toque pide confirmar y el segundo ejecuta.
export function Confirmar({ children, pregunta, className = "btn danger" }: { children: React.ReactNode; pregunta: string; className?: string }) {
  const [armado, setArmado] = useState(false);
  const { pending } = useFormStatus();
  if (pending) return <button type="button" className={className} disabled>Procesando…</button>;
  if (!armado) {
    return (
      <button type="button" className={className} onClick={() => setArmado(true)}>
        {children}
      </button>
    );
  }
  return (
    <span className="confirm">
      <span className="confirm-q">{pregunta}</span>
      <button type="submit" className="btn danger solid">Sí, hazlo</button>
      <button type="button" className="btn ghost" onClick={() => setArmado(false)}>Cancelar</button>
    </span>
  );
}

// Copia un texto con el botón; si el navegador no deja, selecciona el texto.
export function Copiar({ texto }: { texto: string }) {
  const [hecho, setHecho] = useState(false);
  return (
    <button
      type="button"
      className="btn ghost sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setHecho(true);
          setTimeout(() => setHecho(false), 2000);
        } catch {
          prompt("Copia el link:", texto);
        }
      }}
    >
      {hecho ? "¡Copiado!" : "Copiar link"}
    </button>
  );
}
