-- InviteMe · contraseña por evento para el panel del festejado
-- Pégalo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
-- Solo se guarda una huella de la contraseña (no la contraseña en sí).
alter table eventos add column if not exists panel_hash text;

-- Que la API de Supabase vea la columna nueva de inmediato
notify pgrst, 'reload schema';
