# Templates de invitaciones

Cada template vive en su propia carpeta. Cambiar un template **solo afecta a las
invitaciones que lo usan**.

```
plantillas/
├── bosque/            ← un template
│   ├── info.ts        ← nombre, descripción, colores de muestra y tipografías
│   ├── plantilla.ts   ← el acomodo: qué secciones van y en qué orden
│   ├── estilos.css    ← colores, letras, tamaños, formas, fondos
│   ├── dibujos.js     ← los dibujos (personajes, adornos, hojas, ramas)
│   └── imagenes/      ← fondos, texturas o marcos propios (opcional)
├── navidad/
├── _comun/            ← lo que comparten todos (no es visual)
│   ├── secciones.ts   ← cada sección ya llena con la información del evento
│   └── motor.js       ← cuenta regresiva, confirmación, música, visor de fotos, copiar
├── catalogo.ts        ← lista de templates que ve el panel
└── index.ts           ← conecta cada template con su acomodo
```

## Crear un template nuevo (ejemplo: "dinosaurios")

1. **Copia una carpeta** parecida a lo que quieres (por ejemplo `bosque/`) y
   renómbrala `dinosaurios/`.
2. En `dinosaurios/info.ts` cambia `id: "dinosaurios"` (igual al nombre de la
   carpeta), el nombre, la descripción y los dos colores de muestra.
3. **Regístralo** en dos lugares:
   - `catalogo.ts`: `import { info as dinosaurios } from "./dinosaurios/info";`
     y agrégalo a la lista `CATALOGO`.
   - `index.ts`: `import dinosaurios from "./dinosaurios/plantilla";` y agrégalo
     a `ACOMODOS`.
4. Personaliza `estilos.css`, `dibujos.js` y, si quieres, el acomodo.
5. Revisa con `npm run validar -- dinosaurios` y mira cómo quedó con
   `npm run vista -- dinosaurios` (abre `.vista/dinosaurios.html`).
6. Sube los cambios a GitHub. Vercel lo publica y aparece en el panel.

## Públicos y privados

Un template **público** sale en la página web (inviteme.mx, sección Diseños); uno
**privado** solo lo ve Joel en el panel y lo puede usar en cualquier evento (diseños a la
medida de un cliente o que todavía no están listos). Eso no se pone en el código: se
cambia con el botón **Publicar en la web / Hacer privado** del panel → Templates.
Todo template nuevo llega como privado.

## Quitar un template

No borres la carpeta: los eventos que ya lo usan se quedarían sin diseño y
caerían al de por defecto. Pon `oculto: true` en su `info.ts`; deja de
aparecer para eventos nuevos y las invitaciones existentes siguen igual.

## Con Claude

Pídele a Claude cosas como "crea un template de dinosaurios" o "oculta navidad":
usa el skill `plantillas` (`.claude/skills/plantillas/`), trabaja en una rama
`plantillas/...` y solo toca esta carpeta. `npm run cambios` lo comprueba.

## El acomodo (plantilla.ts)

Recibe la información del evento y devuelve el HTML. La forma más fácil es usar
las secciones ya armadas y ordenarlas como quieras:

| Sección | Qué es |
|---|---|
| `s.musica` | Botón flotante de música |
| `s.portada` | Foto en arco, personajes, nombre, saludo al invitado y fecha |
| `s.saludo` | "¡Hola, Familia Pérez!" + texto *(ya viene dentro de `s.portada`; úsalo solo si escribes tu propia portada)* |
| `s.mensaje` | Mensaje para los invitados |
| `s.familias` | Padres, padres de los novios, padrinos *(opcional)* |
| `s.cuenta` | Cuenta regresiva |
| `s.lugar` | Ceremonia *(opcional)* y recepción con mapas |
| `s.dresscode` | Código de vestimenta *(opcional)* |
| `s.fotos` | Línea del tiempo o galería |
| `s.regalos` | Mesa de regalos y CLABE *(opcional)* |
| `s.traer` | Qué te toca llevar *(opcional)* |
| `s.confirmacion` | Formulario de asistencia con pases |
| `s.pie` | Firma final |
| `s.visor` | Visor de fotos en grande (déjalo siempre) |
| `s.datos` | Datos para el motor (déjalo siempre, al final) |

Las secciones opcionales que el evento no tenga activas llegan vacías, así que
puedes ponerlas siempre.

También puedes escribir tu propio HTML con los datos directamente:
`d.ev.nombre`, `d.ev.contenido.mensaje`, `d.ev.contenido.padrinos`,
`d.inv.nombre` (el invitado), etc. Usa `esc()` de `_comun/secciones.ts` para
cualquier texto que venga del evento.

**Saludo al invitado:** en los links personalizados la portada trae, debajo del
nombre, `<div class="saludo">` con `<p class="saludo-hola">¡Hola, <b>Invitado</b>!</p>`
y `<p class="saludo-txt">texto</p>`. Dale estilo a esas tres clases en `estilos.css`
(los datos de prueba completos lo muestran con "Familia Pérez"; los mínimos no lo traen,
como el link general).

**Importante:** si escribes tu propio HTML para la cuenta regresiva o la
confirmación, conserva los `id` de los elementos (`cd-d`, `form`, `howMany`…),
porque el motor los usa para funcionar.

## Los dibujos (dibujos.js)

Cada template define seis dibujos, y cada uno tiene un lugar fijo:

| Nombre | Dónde aparece |
|---|---|
| `izquierda` / `derecha` | Personajes junto a la portada y en el pie |
| `centro` | Personaje grande del cierre y del "¡Gracias!" |
| `adorno` | Detalles pequeños: portada, separadores, línea del tiempo |
| `hoja` | Separadores y puntos de la línea del tiempo |
| `rama` | Ramas de las esquinas de la portada |

## Imágenes y tipografías

- Pon imágenes en `imagenes/` y úsalas desde `estilos.css` con
  `url("imagenes/archivo.png")`.
- Para una tipografía nueva, cambia el link de Google Fonts en `info.ts`
  (`fuentes`) y úsala en `estilos.css`.

Los archivos de cada carpeta se copian solos a `public/plantillas/` cada vez que
el sitio se construye; no edites esa copia.


## En el panel

La pestaña **Templates** del administrador (`/admin?tab=plantillas`) lista todos los templates de
`catalogo.ts`, dice en qué eventos se usa cada uno y muestra una vista previa con datos de ejemplo
(Wow o Express). Ahí mismo se publica en la web o se hace privado, y trae los pedidos listos para copiarle
a Claude: crear, editar, ocultar o borrar. Un template nuevo aparece ahí solo en cuanto se publica en `main`, como privado.
