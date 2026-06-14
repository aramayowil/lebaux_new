-- ════════════════════════════════════════════════════════════════════════
--  Módulo de Usuarios, Roles y Permisos
--  Esquema separado "seguridad" — vinculado a auth.users de Supabase
-- ════════════════════════════════════════════════════════════════════════

CREATE SCHEMA IF NOT EXISTS seguridad;

-- ─── Tabla: roles ──────────────────────────────────────────────────────
CREATE TABLE seguridad.roles (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre character varying NOT NULL UNIQUE,
  descripcion character varying,
  bloqueado boolean NOT NULL DEFAULT false
);

-- ─── Tabla: usuarios ───────────────────────────────────────────────────
-- id = mismo UUID que auth.users (1 a 1). Guarda metadata + rol asignado.
CREATE TABLE seguridad.usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre character varying NOT NULL,
  email character varying NOT NULL,
  id_rol integer NOT NULL REFERENCES seguridad.roles(id),
  activo boolean NOT NULL DEFAULT true,
  ultimo_acceso timestamptz,
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- ─── Tabla: permisos ───────────────────────────────────────────────────
-- Una fila por (rol, sección) con las 4 acciones disponibles.
CREATE TABLE seguridad.permisos (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_rol integer NOT NULL REFERENCES seguridad.roles(id) ON DELETE CASCADE,
  seccion character varying NOT NULL, -- inicio | obras | productos | catalogos | opciones | usuarios
  ver boolean NOT NULL DEFAULT false,
  crear boolean NOT NULL DEFAULT false,
  editar boolean NOT NULL DEFAULT false,
  del boolean NOT NULL DEFAULT false,
  CONSTRAINT permisos_rol_seccion_uq UNIQUE (id_rol, seccion)
);

-- ════════════════════════════════════════════════════════════════════════
--  Seed: roles sugeridos + permisos según matriz del modelo
-- ════════════════════════════════════════════════════════════════════════

INSERT INTO seguridad.roles (nombre, descripcion, bloqueado) VALUES
  ('Administrador', 'Acceso total al sistema', true),
  ('Vendedor',       'Carga y gestión de obras, lectura de catálogos', false),
  ('Producción',     'Gestión de productos y obras en proceso', false),
  ('Solo lectura',   'Acceso de consulta únicamente', false),
  ('Pendiente',      'Usuario recién registrado, sin acceso asignado', true);

-- Administrador (id 1): acceso total
INSERT INTO seguridad.permisos (id_rol, seccion, ver, crear, editar, del) VALUES
  (1, 'inicio',    true, false, false, false),
  (1, 'obras',     true, true,  true,  true),
  (1, 'productos', true, true,  true,  true),
  (1, 'catalogos', true, true,  true,  true),
  (1, 'opciones',  true, false, true,  false),
  (1, 'usuarios',  true, true,  true,  true),

-- Vendedor (id 2)
  (2, 'inicio',    true, false, false, false),
  (2, 'obras',     true, true,  true,  false),
  (2, 'productos', true, false, false, false),
  (2, 'catalogos', true, false, false, false),
  (2, 'opciones',  false, false, false, false),
  (2, 'usuarios',  false, false, false, false),

-- Producción (id 3)
  (3, 'inicio',    true, false, false, false),
  (3, 'obras',     true, false, true,  false),
  (3, 'productos', true, false, true,  false),
  (3, 'catalogos', true, false, false, false),
  (3, 'opciones',  false, false, false, false),
  (3, 'usuarios',  false, false, false, false),

-- Solo lectura (id 4)
  (4, 'inicio',    true, false, false, false),
  (4, 'obras',     true, false, false, false),
  (4, 'productos', true, false, false, false),
  (4, 'catalogos', true, false, false, false),
  (4, 'opciones',  false, false, false, false),
  (4, 'usuarios',  false, false, false, false);

-- Pendiente (id 5): sin permisos -> queda sin filas (ver = false por defecto en cualquier sección)

-- ════════════════════════════════════════════════════════════════════════
--  Helper: ¿el usuario actual es Administrador activo?
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION seguridad.es_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = seguridad, public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM seguridad.usuarios u
    JOIN seguridad.roles r ON r.id = u.id_rol
    WHERE u.id = auth.uid()
      AND u.activo
      AND r.nombre = 'Administrador'
  );
$$;

-- ════════════════════════════════════════════════════════════════════════
--  Trigger: al crear un usuario en auth.users, crear su perfil
--  en seguridad.usuarios con el rol "Pendiente" (inactivo)
-- ════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION seguridad.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = seguridad, public
AS $$
DECLARE
  rol_pendiente_id integer;
BEGIN
  SELECT id INTO rol_pendiente_id FROM seguridad.roles WHERE nombre = 'Pendiente';

  INSERT INTO seguridad.usuarios (id, nombre, email, id_rol, activo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    rol_pendiente_id,
    false
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION seguridad.handle_new_user();

-- ════════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ════════════════════════════════════════════════════════════════════════

ALTER TABLE seguridad.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguridad.roles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE seguridad.permisos ENABLE ROW LEVEL SECURITY;

-- usuarios: cada uno ve su propia fila; el admin ve y administra todas
CREATE POLICY usuarios_select ON seguridad.usuarios
  FOR SELECT USING (id = auth.uid() OR seguridad.es_admin());

CREATE POLICY usuarios_update_admin ON seguridad.usuarios
  FOR UPDATE USING (seguridad.es_admin());

CREATE POLICY usuarios_delete_admin ON seguridad.usuarios
  FOR DELETE USING (seguridad.es_admin());

-- roles: todos los autenticados pueden leer (necesario para validar permisos
-- y armar el menú); solo el admin puede escribir
CREATE POLICY roles_select_auth ON seguridad.roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY roles_write_admin ON seguridad.roles
  FOR ALL USING (seguridad.es_admin()) WITH CHECK (seguridad.es_admin());

-- permisos: todos los autenticados pueden leer; solo el admin escribe
CREATE POLICY permisos_select_auth ON seguridad.permisos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY permisos_write_admin ON seguridad.permisos
  FOR ALL USING (seguridad.es_admin()) WITH CHECK (seguridad.es_admin());

-- ════════════════════════════════════════════════════════════════════════
--  Permisos a nivel de Postgres + exponer el esquema vía API
-- ════════════════════════════════════════════════════════════════════════

GRANT USAGE ON SCHEMA seguridad TO authenticated, anon, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA seguridad TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA seguridad TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA seguridad TO authenticated, service_role;

-- ════════════════════════════════════════════════════════════════════════
--  IMPORTANTE (manual, fuera de este script):
--  En Supabase Dashboard -> Project Settings -> API -> "Exposed schemas"
--  agregar "seguridad" a la lista (junto a "public" y "opendata") para que
--  supabase.schema("seguridad") funcione desde el frontend.
-- ════════════════════════════════════════════════════════════════════════

-- ════════════════════════════════════════════════════════════════════════
--  Primer administrador (ejecutar manualmente una vez):
--  1. Registrate normalmente desde /register (esto crea auth.users +
--     seguridad.usuarios con rol "Pendiente").
--  2. Ejecutá lo siguiente reemplazando el email:
--
--  UPDATE seguridad.usuarios
--  SET id_rol = (SELECT id FROM seguridad.roles WHERE nombre = 'Administrador'),
--      activo = true
--  WHERE email = 'tu-email@dominio.com';
-- ════════════════════════════════════════════════════════════════════════
