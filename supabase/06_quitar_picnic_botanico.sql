-- Quita los templates Picnic y Botánico de la tabla de visibilidad (públicos/privados).
-- Sus carpetas ya se borraron de plantillas/. Córrelo una vez en Supabase → SQL Editor.

-- 1) Revisión: debe salir vacío (ningún evento usa estos diseños).
select slug, diseno from eventos where diseno in ('picnic', 'botanico');

-- 2) Borra sus renglones de la tabla de templates públicos/privados.
delete from plantillas where id in ('picnic', 'botanico');

select id, case when publica then 'Público' else 'Privado' end as visibilidad from plantillas order by id;
