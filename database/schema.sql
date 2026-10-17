-- =====================================================================
-- SAIYAGYM - Esquema de base de datos (PostgreSQL)
-- Cubre: Sprint 1 (usuarios) y Sprint 2 (rutinas y su asignación).
-- Es idempotente: se puede ejecutar varias veces sin borrar datos.
-- =====================================================================

-- ---------------------------------------------------------------------
-- USUARIOS (E1)
-- Una sola tabla para administradores, entrenadores y usuarios del
-- gimnasio; el campo "rol" los diferencia (E1-HU1: "datos personales y su rol").
-- El estado permite inactivar sin eliminar el registro (E1-HU4).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    documento       VARCHAR(20)  NOT NULL,
    telefono        VARCHAR(20)  NOT NULL,
    correo          VARCHAR(120) NOT NULL,
    rol             VARCHAR(15)  NOT NULL DEFAULT 'usuario',
    estado          VARCHAR(10)  NOT NULL DEFAULT 'Activo',
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT usuarios_documento_uk UNIQUE (documento),
    CONSTRAINT usuarios_nombre_ck    CHECK (length(btrim(nombre)) > 0),
    CONSTRAINT usuarios_telefono_ck  CHECK (length(btrim(telefono)) > 0),
    CONSTRAINT usuarios_correo_ck    CHECK (length(btrim(correo)) > 0),
    CONSTRAINT usuarios_rol_ck       CHECK (rol IN ('administrador', 'entrenador', 'usuario')),
    CONSTRAINT usuarios_estado_ck    CHECK (estado IN ('Activo', 'Inactivo'))
);

-- ---------------------------------------------------------------------
-- RUTINAS (E2-HU1, E2-HU3)
-- Cada rutina la crea un entrenador (usuario con rol "entrenador").
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rutinas (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(120) NOT NULL,
    objetivo        VARCHAR(255) NOT NULL,
    entrenador_id   INTEGER      NOT NULL REFERENCES usuarios (id),
    estado          VARCHAR(10)  NOT NULL DEFAULT 'Activa',
    creado_en       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    actualizado_en  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT rutinas_nombre_ck   CHECK (length(btrim(nombre)) > 0),
    CONSTRAINT rutinas_objetivo_ck CHECK (length(btrim(objetivo)) > 0),
    CONSTRAINT rutinas_estado_ck   CHECK (estado IN ('Activa', 'Inactiva'))
);

-- Ejercicios que componen una rutina (una rutina debe tener al menos uno;
-- esa regla se valida en el backend).
CREATE TABLE IF NOT EXISTS rutina_ejercicios (
    id            SERIAL PRIMARY KEY,
    rutina_id     INTEGER      NOT NULL REFERENCES rutinas (id) ON DELETE CASCADE,
    orden         SMALLINT     NOT NULL,
    nombre        VARCHAR(120) NOT NULL,
    series        SMALLINT     NOT NULL,
    repeticiones  SMALLINT     NOT NULL,
    CONSTRAINT rutina_ejercicios_orden_uk UNIQUE (rutina_id, orden),
    CONSTRAINT rutina_ejercicios_nombre_ck CHECK (length(btrim(nombre)) > 0),
    CONSTRAINT rutina_ejercicios_series_ck CHECK (series BETWEEN 1 AND 20),
    CONSTRAINT rutina_ejercicios_reps_ck   CHECK (repeticiones BETWEEN 1 AND 200)
);

-- ---------------------------------------------------------------------
-- ASIGNACIONES DE RUTINA (E2-HU2, E2-HU4)
-- Historial de asignaciones; solo una puede estar vigente por usuario.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS asignaciones_rutina (
    id                SERIAL PRIMARY KEY,
    usuario_id        INTEGER NOT NULL REFERENCES usuarios (id),
    rutina_id         INTEGER NOT NULL REFERENCES rutinas (id),
    fecha_asignacion  DATE    NOT NULL DEFAULT CURRENT_DATE,
    vigente           BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS asignaciones_una_vigente_por_usuario
    ON asignaciones_rutina (usuario_id) WHERE vigente;

CREATE INDEX IF NOT EXISTS rutina_ejercicios_rutina_idx ON rutina_ejercicios (rutina_id);
CREATE INDEX IF NOT EXISTS asignaciones_rutina_rutina_idx ON asignaciones_rutina (rutina_id);
CREATE INDEX IF NOT EXISTS rutinas_entrenador_idx ON rutinas (entrenador_id);
