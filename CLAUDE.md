# InviteMe

Invitaciones digitales personalizadas (inviteme.mx). Next.js 15 + Supabase, publicado en Vercel desde `main`.

## Cómo está armado

- **Datos del evento**: `lib/tipos.ts` (`Evento`, `Contenido`, `Invitado`). Se capturan en el panel de
  administrador (`app/admin/`) y en el formulario del cliente (`app/datos/`), y viven en Supabase
  (tabla `eventos`, columna `contenido` como JSON). `diseno` dice qué template usa cada evento.
- **Templates**: `plantillas/<id>/` (ver `plantillas/README.md`). Solo deciden cómo se ve la invitación;
  nunca qué datos existen.
- **Partes comunes**: `plantillas/_comun/secciones.ts` (cada sección ya llena con los datos) y
  `plantillas/_comun/motor.js` (cuenta regresiva, confirmación, música, visor). Los usan todos los templates.
- **Saludo al invitado**: en los links personalizados (`/evento/invitado`) la portada muestra
  "¡Hola, <invitado>!" y un texto debajo del nombre del festejado (`contenido.saludo`, se edita en el panel).
- **Públicos y privados**: si un template sale en la página web (portada y `/ejemplo/<id>`) vive en Supabase
  (tabla `plantillas`, `supabase/05_plantillas_publicas.sql`) y se cambia con un botón en el panel → Templates.
  Lo lee `lib/visibilidad.ts`. Sin renglón en la tabla = privado: un template nuevo nunca sale solo en la web.
  Los privados se usan en eventos igual que los públicos. No es lo mismo que `oculto` (retirado).

## Trabajo con templates (crear, editar, quitar diseños)

Para cualquier tarea de diseño de invitaciones usa el skill **`plantillas`** y sigue sus pasos.
Reglas que no cambian:

1. En modo plantillas solo se edita `plantillas/<id>/`, `plantillas/catalogo.ts`, `plantillas/index.ts`
   y `plantillas/README.md`. Nada en `lib/`, `app/`, `supabase/`, `public/`, `plantillas/_comun/`
   ni `plantillas/tipos.ts`. Si un diseño necesita un dato que no existe, **no lo inventes**: dilo y
   propón cómo agregarlo como tarea aparte.
2. Los datos se leen solo de lo que ya existe en `lib/tipos.ts` (vía `secciones(d)` o `d.ev`, `d.inv`),
   siempre pasando textos por `esc()`.
3. Antes de terminar: `npm run validar` y `npm run cambios` deben pasar.
4. Un template nunca se borra si pudo haberse usado en un evento: se marca `oculto: true` en su `info.ts`.

Comandos: `npm run validar [-- id]`, `npm run vista -- <id>` (genera `.vista/<id>.html`),
`npm run cambios` (candado de archivos permitidos).

## Convenciones

- Todo el texto visible y los comentarios en español de México.
- No subir secretos: `.env*` nunca se lee ni se versiona.
