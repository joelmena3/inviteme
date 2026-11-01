-- InviteMe · panel de administrador + almacenamiento de fotos y música
-- Pégalo completo en Supabase → SQL Editor → New query → Run
-- (después de 01 y 02). Se puede correr más de una vez sin romper nada.

-- 1) Folio interno para cada evento: INV-0001, INV-0002…
create sequence if not exists folio_seq;

alter table eventos add column if not exists folio text unique
  default ('INV-' || lpad(nextval('folio_seq')::text, 4, '0'));

-- 2) Datos comerciales del evento
alter table eventos add column if not exists paquete text not null default 'wow';        -- express | wow | fotos | cortesia | otro
alter table eventos add column if not exists precio numeric(10,2) not null default 0;     -- lo que se cobra, en MXN
alter table eventos add column if not exists cliente_nombre text;
alter table eventos add column if not exists cliente_whatsapp text;
alter table eventos add column if not exists notas text;
alter table eventos add column if not exists carpeta text unique;                         -- carpeta del evento en Storage
alter table eventos add column if not exists actualizado timestamptz not null default now();

-- La fiesta de Majo queda como cortesía (sin costo)
update eventos set paquete = 'cortesia' where slug = 'majo' and precio = 0;

-- 3) Pagos registrados a mano (Mercado Pago, transferencia, efectivo)
create table if not exists pagos (
  id          uuid primary key default gen_random_uuid(),
  evento_id   uuid not null references eventos(id) on delete cascade,
  monto       numeric(10,2) not null check (monto > 0),
  metodo      text not null check (metodo in ('mercadopago', 'transferencia', 'efectivo', 'otro')),
  referencia  text,                                   -- número de operación o clave de rastreo
  fecha       date not null default (now() at time zone 'America/Mexico_City')::date,
  notas       text,
  creado      timestamptz not null default now()
);
create index if not exists pagos_evento_idx on pagos (evento_id, fecha desc);
alter table pagos enable row level security;           -- solo la app (en Vercel) puede leer y escribir

-- 4) Carpeta de archivos en Supabase Storage.
--    Es pública para LEER por link (los invitados tienen que ver las fotos),
--    pero nadie puede listar su contenido ni subir archivos sin pasar por el panel.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitaciones', 'invitaciones', true, 20971520,   -- 20 MB por archivo
  array['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/ogg', 'audio/wav']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Resultado: tus eventos con su folio
select folio, slug, nombre, paquete, precio from eventos order by folio;
