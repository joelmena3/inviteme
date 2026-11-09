-- InviteMe · estructura de la base de datos
-- Pégalo completo en Supabase → SQL Editor → New query → Run

create table if not exists eventos (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,             -- parte del link: tudominio/majo
  nombre     text not null,                    -- "Majo"
  tipo       text not null default 'cumpleanos',
  fecha      timestamptz not null,
  diseno     text not null default 'bosque',   -- id del template (carpeta en plantillas/)
  contenido  jsonb not null,                   -- textos, fotos, música, línea del tiempo
  admin_key  text not null default replace(gen_random_uuid()::text, '-', ''),  -- clave del panel
  creado     timestamptz not null default now()
);

create table if not exists invitados (
  id         uuid primary key default gen_random_uuid(),
  evento_id  uuid not null references eventos(id) on delete cascade,
  codigo     text not null,                    -- parte del link: tudominio/majo/tia-ale
  nombre     text not null,
  pases      int check (pases is null or pases > 0),  -- null = ilimitados
  creado     timestamptz not null default now(),
  unique (evento_id, codigo)
);

create table if not exists confirmaciones (
  id          uuid primary key default gen_random_uuid(),
  evento_id   uuid not null references eventos(id) on delete cascade,
  invitado_id uuid references invitados(id) on delete set null,  -- null = link general
  nombre      text not null,
  asiste      boolean not null,
  personas    int not null default 0 check (personas between 0 and 30),
  mensaje     text,
  creado      timestamptz not null default now()
);

create index if not exists confirmaciones_evento_idx on confirmaciones (evento_id, creado desc);
create index if not exists confirmaciones_invitado_idx on confirmaciones (invitado_id, creado desc);

-- Seguridad: nadie desde internet puede leer ni escribir directo en las tablas.
-- Solo la app (en Vercel, con la llave secreta) tiene acceso.
alter table eventos        enable row level security;
alter table invitados      enable row level security;
alter table confirmaciones enable row level security;
