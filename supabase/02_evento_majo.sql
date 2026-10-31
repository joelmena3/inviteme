-- InviteMe · primer evento: el primer año de Majo
-- Pégalo completo en Supabase → SQL Editor → New query → Run
-- (después de 01_tablas.sql). Al final te muestra la clave de tu panel.

insert into eventos (slug, nombre, tipo, fecha, diseno, contenido)
values ('majo', 'Majo', 'primer-ano', '2026-11-28 12:00:00-06', 'bosque', $json${
  "eyebrow": "Una fiesta en el bosque",
  "kicker": "Mi primer añito",
  "mensaje": "Te invitamos a compartir con nosotros este momento tan especial en el que Majo está cumpliendo su primer año",
  "fecha": {
    "dia": "Sábado",
    "numero": "28",
    "mes": "Nov",
    "hora": "12:00 pm",
    "larga": "Sábado 28 de noviembre de 2026"
  },
  "lugar": {
    "nombre": "Fraccionamiento La Toscana",
    "direccion": "Cerrada Prato, Lerma, Estado de México, C.P. 52005",
    "busqueda": "Cerrada Prato, Fraccionamiento La Toscana, Lerma, Estado de México, 52005"
  },
  "portada": {
    "src": "/eventos/majo/fotos/09.jpg",
    "w": 675,
    "h": 900,
    "alt": "Majo con vestido rosa de lunares"
  },
  "lineaTitulo": "Así he crecido",
  "lineaIntro": "Doce meses de abrazos, siestas y primeras veces. Toca cualquier foto para verla en grande.",
  "linea": [
    {
      "label": "Recién nacida",
      "when": "Noviembre 2025",
      "cap": "El día que llegaste a llenarlo todo de amor.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/01.jpg",
          "w": 675,
          "h": 900
        }
      ]
    },
    {
      "label": "1 mes",
      "when": "Diciembre 2025",
      "cap": "Corona, suéter y mi primer pastelito.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/03.jpg",
          "w": 675,
          "h": 900
        }
      ]
    },
    {
      "label": "2 meses",
      "when": "Enero 2026",
      "cap": "Con mamá y papá.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/04.jpg",
          "w": 675,
          "h": 900
        }
      ]
    },
    {
      "label": "3 meses",
      "when": "Febrero 2026",
      "cap": "Lista para jugar.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/05.jpg",
          "w": 675,
          "h": 900
        }
      ]
    },
    {
      "label": "4 meses",
      "when": "Marzo 2026",
      "cap": "Entre pollitos y huevitos.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/06.jpg",
          "w": 900,
          "h": 675
        }
      ]
    },
    {
      "label": "5 meses",
      "when": "Abril 2026",
      "cap": "Mi primer día de alberca.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/07.jpg",
          "w": 675,
          "h": 900
        }
      ]
    },
    {
      "label": "6 meses",
      "when": "Mayo 2026",
      "cap": "Medio añito y un montón de peluches.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/08.jpg",
          "w": 675,
          "h": 900
        },
        {
          "src": "/eventos/majo/fotos/09.jpg",
          "w": 675,
          "h": 900
        }
      ]
    },
    {
      "label": "7 meses",
      "when": "Junio 2026",
      "cap": "Chef por un día.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/10.jpg",
          "w": 675,
          "h": 900
        }
      ]
    },
    {
      "label": "8 meses",
      "when": "Julio 2026",
      "cap": "Descubriendo nuevos sabores.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/11.jpg",
          "w": 675,
          "h": 900
        }
      ]
    },
    {
      "label": "9 meses",
      "when": "Agosto 2026",
      "cap": "Princesa de cuento.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/12.jpg",
          "w": 675,
          "h": 900
        }
      ]
    },
    {
      "label": "10 meses",
      "when": "Septiembre 2026",
      "cap": "¡Viva México!",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/13.jpg",
          "w": 900,
          "h": 675
        }
      ]
    },
    {
      "label": "11 meses",
      "when": "Octubre 2026",
      "cap": "Mi primer Halloween de calabacita.",
      "fotos": [
        {
          "src": "/eventos/majo/fotos/14.jpg",
          "w": 675,
          "h": 900
        }
      ]
    }
  ],
  "cierre": {
    "label": "1 año",
    "when": "28 de noviembre 2026",
    "titulo": "¡Y ahora a celebrar!",
    "texto": "Este capítulo lo escribimos juntos."
  },
  "musica": [
    "/eventos/majo/musica/mariposita.mp3"
  ],
  "pie": "Mi primer añito · 28 · 11 · 2026"
}$json$::jsonb)
on conflict (slug) do update set
  nombre = excluded.nombre, fecha = excluded.fecha, diseno = excluded.diseno, contenido = excluded.contenido;

insert into invitados (evento_id, codigo, nombre, pases)
select e.id, v.codigo, v.nombre, v.pases
from eventos e, (values
  ('abuelitos-indi-y-vicente', 'Abuelitos Indi y Vicente', null),
  ('tia-sam-y-gussy', 'Tía Sam y Gussy', 4),
  ('familia-torres-giles', 'Familia Torres Giles', null),
  ('abuelita-lulu', 'Abuelita Lulu', null),
  ('tia-ale', 'Tía Ale', null),
  ('prima-cami', 'Prima Cami', null)
) as v(codigo, nombre, pases)
where e.slug = 'majo'
on conflict (evento_id, codigo) do update set nombre = excluded.nombre, pases = excluded.pases;

-- Copia este resultado: es la clave de tu panel de invitados.
select slug, admin_key from eventos where slug = 'majo';
