# Diseñar templates para InviteMe

Guía para diseñadoras y diseñadores externos. Trabajas en tu propia copia del repo (fork);
nada de lo que hagas llega a la app hasta que Joel lo revise y lo apruebe.

## Lo que necesitas (una sola vez)

1. Una cuenta de GitHub.
2. Una cuenta de Claude con Claude Code, conectada a tu GitHub.
3. Tu copia del repo: entra a https://github.com/joelmena3/inviteme y da clic en **Fork** → **Create fork**.

## Cómo diseñar un template

1. Abre Claude Code sobre **tu fork** (`<tu-usuario>/inviteme`).
2. Pídele el diseño con `/plantillas`, por ejemplo:
   > /plantillas crea un template "Fiesta Mexicana" para el paquete Wow, rosa mexicano y papel picado
3. Claude trae lo último del repo de Joel, crea una rama, diseña, revisa que todo funcione
   (confirmación, cuenta regresiva, celular) y te genera una vista previa.
4. Cuando te guste, pídele que abra el Pull Request hacia `joelmena3/inviteme`.
5. Mándale a Joel el link del Pull Request.

## Reglas

- Solo se tocan archivos dentro de `plantillas/`. La revisión automática rechaza cualquier otro cambio.
- Usa imágenes propias o de libre uso (Unsplash, Pexels, etc.), nunca fotos de clientes.
- Si el diseño necesita un dato que la invitación no tiene (por ejemplo "nombre de la mascota"),
  no lo inventes: avísale a Joel.
- Para cambiar un template existente, mejor propón uno nuevo: los cambios afectan invitaciones ya enviadas.
