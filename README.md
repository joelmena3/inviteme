# InviteMe

Invitaciones digitales personalizadas con confirmación de asistencia.

**Cómo está armado**
- `public/motor/` — estilos del panel de administrador (los diseños de las invitaciones viven en `plantillas/`).
- `lib/plantilla.ts` — convierte los datos de un evento en la página.
- `app/[evento]` y `app/[evento]/[invitado]` — la invitación (`/majo`, `/majo/tia-ale`).
- `app/[evento]/panel` — panel privado del festejado (`/majo/panel?key=…`).
- `app/api/rsvp` — guarda confirmaciones en Supabase.
- `supabase/` — SQL para crear las tablas y el primer evento.

**Variables en Vercel:** `SUPABASE_URL` y `SUPABASE_SECRET_KEY` (ver `.env.example`).

**Nuevo evento:** subir fotos a `public/eventos/<slug>/`, copiar `supabase/02_evento_majo.sql` con los datos nuevos y correrlo en Supabase.
