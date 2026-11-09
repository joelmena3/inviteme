-- InviteMe · templates públicos y privados
-- Pégalo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- Público  = aparece en la página web (inviteme.mx, sección Diseños) y se puede usar en eventos.
-- Privado  = solo lo ves tú en el panel; se puede usar en eventos, pero no sale en la web.
--            Sirve para diseños hechos a la medida de un cliente o que todavía estás terminando.
-- Un template que no tiene renglón aquí es PRIVADO: así uno nuevo nunca sale en la web
-- hasta que tú lo publiques desde el panel (pestaña Templates).

create table if not exists plantillas (
  id          text primary key,                 -- nombre de la carpeta: plantillas/<id>
  publica     boolean not null default false,
  actualizado timestamptz not null default now()
);

alter table plantillas enable row level security;   -- solo la app (en Vercel) puede leer y escribir

-- Los que hoy se ven en la web siguen públicos (si ya existen, no se tocan)
insert into plantillas (id, publica) values
  ('bosque', true), ('navidad', true), ('confeti', true)
on conflict (id) do nothing;

-- Que la API de Supabase vea la tabla nueva de inmediato
notify pgrst, 'reload schema';

select id, case when publica then 'Público' else 'Privado' end as visibilidad from plantillas order by id;
