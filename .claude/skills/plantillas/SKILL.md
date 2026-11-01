---
name: plantillas
description: Crear, editar, ocultar o listar templates (diseños) de invitaciones de InviteMe en plantillas/, sin tocar los datos del sistema. Úsalo para cualquier pedido de diseño de invitación, aunque no diga "template".
---

# Agente de templates de InviteMe

Tu único trabajo aquí es el **diseño** de las invitaciones. Los datos (qué se captura, cómo se guarda,
el motor de confirmación) ya existen y no se tocan.

## Límites

- **Puedes editar**: `plantillas/<id>/**`, `plantillas/catalogo.ts`, `plantillas/index.ts`, `plantillas/README.md`.
- **No edites**: `lib/`, `app/`, `supabase/`, `public/`, `plantillas/_comun/`, `plantillas/tipos.ts`, `scripts/`,
  `CLAUDE.md`, `.claude/`, `.github/`, `package.json`.
- Si el diseño pide un dato que no existe en `lib/tipos.ts` (p. ej. "nombre de la mascota"), no lo inventes
  ni lo pongas fijo en el HTML. Termina el diseño sin ese dato y dile a Joel qué campo haría falta, como tarea aparte.
- Textos del cliente siempre con `esc()`. Nada de textos de ejemplo fijos ("Majo", fechas) dentro del template.

## Antes de empezar (siempre)

1. Lee `plantillas/README.md` y el template más parecido a lo que piden (`info.ts`, `plantilla.ts`,
   `estilos.css`, `dibujos.js`).
2. Crea una rama: `git checkout -b plantillas/<id>-<cambio>` (ej. `plantillas/dinosaurios-nuevo`).
   Vercel publica cada rama en una URL de vista previa, así Joel lo ve antes de que salga a clientes.

## Crear un template

1. `cp -r plantillas/<parecido> plantillas/<id>` — `id` en minúsculas con guiones (`fiesta-mexicana`).
2. `info.ts`: `id` igual a la carpeta, `nombre`, `descripcion` corta, `muestra` (2 colores hex), `fuentes`
   (link de Google Fonts, solo las familias que uses).
3. Regístralo en `catalogo.ts` (import + lista `CATALOGO`) y en `index.ts` (import + `ACOMODOS`).
4. Diseña:
   - `estilos.css`: define la paleta en variables al inicio y úsalas en todo el archivo; conserva los
     selectores de clases que usan las secciones (revisa las clases en `_comun/secciones.ts`).
   - `dibujos.js`: los seis dibujos (`izquierda`, `derecha`, `centro`, `adorno`, `hoja`, `rama`) como SVG
     inline que tomen colores de las variables CSS.
   - `plantilla.ts`: orden de secciones. Mantén siempre `s.confirmacion`, `s.cuenta`, `s.visor` y `s.datos` (al final).
     Si escribes HTML propio, conserva todos los `id` de la sección que reemplazas.
   - Imágenes propias en `imagenes/` (ligeras: webp/png optimizados, < 300 KB cada una).
5. Debe verse bien en celular (360–430 px de ancho) antes que en escritorio.

## Editar un template

- Cambia solo lo pedido. Recuerda que **afecta a todas las invitaciones que ya lo usan**, incluidas las
  publicadas. Si el cambio es grande (otro estilo), propone mejor un template nuevo (`<id>-2`) y dilo.

## Quitar un template

- **Nunca borres la carpeta** ni lo saques de `index.ts`: los eventos que lo usan caerían al diseño por
  defecto sin aviso. Pon `oculto: true` en su `info.ts`. Deja de aparecer para eventos nuevos y las
  invitaciones existentes siguen igual.
- Borrar de verdad solo si Joel confirma que ningún evento lo usa (él lo revisa en el panel o en Supabase:
  `select slug from eventos where diseno = '<id>'`). Entonces: carpeta + `catalogo.ts` + `index.ts`.
- No ocultes ni borres el que está en `PLANTILLA_DEFAULT`.

## Listar

- Lee `catalogo.ts` y cada `info.ts`; reporta id, nombre, descripción y si está oculto.

## Revisar y entregar (siempre, en este orden)

1. `npm run validar -- <id>` — corrige hasta que salga ✓. Si un error no tiene que ver con tu cambio, avísalo.
2. `npm run cambios` — debe decir que todo está dentro de `plantillas/`. Si no, deshaz lo que esté fuera.
3. `npm run vista -- <id>` y revisa `.vista/<id>.html` (con los datos de prueba de Majo). Si tienes la
   herramienta de Artifacts, publícalo para que Joel lo vea desde el celular.
4. `git add plantillas/ && git commit -m "Template <id>: <qué cambió>"` y `git push -u origin <rama>`.
5. Cuéntale a Joel en 2–3 líneas qué hiciste, el nombre de la rama y que puede verlo en la vista previa
   de Vercel. Solo cuando él diga que se publique, haz merge a `main` (o abre el PR y dile).
