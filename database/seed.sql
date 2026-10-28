-- =====================================================================
-- SAIYAGYM - Datos de ejemplo (OPCIONAL, solo para demostración)
-- Se ejecuta con:  npm run db:seed   (dentro de la carpeta backend)
-- Se puede ejecutar varias veces: no duplica registros.
--
-- La contraseña de estas personas la asigna el script db:seed
-- (las contraseñas nunca se escriben en texto plano en la base de datos).
--
-- Cada persona se guarda en "personas" y también en la tabla de su rol
-- (administradores, entrenadores o usuarios).
-- =====================================================================

INSERT INTO personas (nombre, documento, telefono, correo, rol, estado) VALUES
    ('Administrador Demo', '10000001', '3000000001', 'admin@saiyagym.test',      'administrador', 'Activo'),
    ('Entrenador Demo',    '10000002', '3000000002', 'entrenador@saiyagym.test', 'entrenador',    'Activo'),
    ('Camila Pérez',       '10000003', '3000000003', 'camila@saiyagym.test',     'usuario',       'Activo'),
    ('Andrés Gómez',       '10000004', '3000000004', 'andres@saiyagym.test',     'usuario',       'Inactivo')
ON CONFLICT (documento) DO NOTHING;

INSERT INTO administradores (persona_id)
SELECT id FROM personas WHERE rol = 'administrador'
ON CONFLICT (persona_id) DO NOTHING;

INSERT INTO entrenadores (persona_id)
SELECT id FROM personas WHERE rol = 'entrenador'
ON CONFLICT (persona_id) DO NOTHING;

INSERT INTO usuarios (persona_id)
SELECT id FROM personas WHERE rol = 'usuario'
ON CONFLICT (persona_id) DO NOTHING;