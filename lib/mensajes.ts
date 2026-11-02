// Mensajes de WhatsApp que se copian o envían desde el panel de administrador.

export const MSG_NUEVO_CLIENTE = `¡Hola! 👋 Gracias por escribir a InviteMe 💌

Hacemos invitaciones digitales, listas en menos de 48 horas ⏱️

✨ *Express* · $500
Posadas, reuniones y fiestas sencillas. Foto de portada, mapa, cuenta regresiva y confirmación de asistencia.

🌟 *Wow* · $999
Bodas, XV años, bautizos, primer año e infantiles. Hasta 15 fotos, música, links por invitado, mesa de regalos y más.

👀 Mira ejemplos y paga aquí:
https://inviteme.mx/pagos

En cuanto me mandes tu comprobante 🧾, te comparto un formulario muy sencillo para los datos de tu evento 📝`;

// Cuando el cliente confirma su pago: link a su formulario y que avise al enviarlo
export function msgPagoConfirmado(o: { nombre?: string | null; link: string; paquete?: string }) {
  const saludo = o.nombre ? `, ${o.nombre.trim().split(/\s+/)[0]}` : "";
  const horas = o.paquete === "express" ? 24 : 48;
  return `¡Gracias por tu pago${saludo}! 🙌 Ya quedó confirmado ✅

Ahora llena este formulario con los datos de tu evento, te toma unos 10 minutos 📝
👉 ${o.link}

📸 Ten a la mano tus fotos favoritas
📋 Y tu lista de invitados, si ya la tienes

Cuando lo envíes, avísame por aquí 📲 y empiezo con tu invitación. Estará lista en menos de ${horas} horas ⏱️`;
}
