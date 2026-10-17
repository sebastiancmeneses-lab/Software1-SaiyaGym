import { pool } from "../config/db.js";

// Capa de acceso a datos: aquí solo hay SQL (siempre con consultas
// parametrizadas: los valores van en $1, $2... nunca pegados al texto).
// IMPORTANTE: COLUMNAS no incluye contrasena_hash, así que el hash
// nunca sale en las respuestas de la API.

const COLUMNAS =
  "id, nombre, documento, telefono, correo, rol, estado, creado_en, actualizado_en";

// Escapa los comodines de LIKE para que "%" o "_" se busquen como texto normal.
const escaparLike = (texto) => texto.replace(/[\\%_]/g, "\\$&");

export async function crear({ nombre, documento, telefono, correo, rol, contrasenaHash }) {
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, documento, telefono, correo, rol, contrasena_hash)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNAS}`,
    [nombre, documento, telefono, correo, rol, contrasenaHash]
  );

  return rows[0];
}

export async function listar({ buscar, rol, estado } = {}) {
  const condiciones = [];
  const valores = [];

  if (buscar) {
    valores.push(`%${escaparLike(buscar)}%`);
    condiciones.push(
      `(nombre ILIKE $${valores.length} OR documento ILIKE $${valores.length})`
    );
  }

  if (rol) {
    valores.push(rol);
    condiciones.push(`rol = $${valores.length}`);
  }

  if (estado) {
    valores.push(estado);
    condiciones.push(`estado = $${valores.length}`);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";

  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM usuarios ${where} ORDER BY id ASC`,
    valores
  );

  return rows;
}

export async function resumen() {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE estado = 'Activo')::int AS activos,
            COUNT(*) FILTER (WHERE estado = 'Inactivo')::int AS inactivos
       FROM usuarios`
  );

  return rows[0];
}

export async function obtenerPorId(id) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNAS} FROM usuarios WHERE id = $1`,
    [id]
  );

  return rows[0] ?? null;
}

/** Busca un usuario con ese documento (se puede excluir un id al editar). */
export async function buscarPorDocumento(documento, excluirId = null) {
  const { rows } = await pool.query(
    `SELECT id FROM usuarios
      WHERE documento = $1 AND ($2::int IS NULL OR id <> $2::int)`,
    [documento, excluirId]
  );

  return rows[0] ?? null;
}

/**
 * Actualiza los datos del usuario. Si contrasenaHash es null,
 * la contraseña actual se conserva.
 */
export async function actualizar(
  id,
  { nombre, documento, telefono, correo, rol, contrasenaHash = null }
) {
  const { rows } = await pool.query(
    `UPDATE usuarios
        SET nombre = $2, documento = $3, telefono = $4, correo = $5,
            rol = $6, contrasena_hash = COALESCE($7, contrasena_hash),
            actualizado_en = now()
      WHERE id = $1
      RETURNING ${COLUMNAS}`,
    [id, nombre, documento, telefono, correo, rol, contrasenaHash]
  );

  return rows[0] ?? null;
}

export async function cambiarEstado(id, estado) {
  const { rows } = await pool.query(
    `UPDATE usuarios SET estado = $2, actualizado_en = now()
      WHERE id = $1
      RETURNING ${COLUMNAS}`,
    [id, estado]
  );

  return rows[0] ?? null;
}

/** Datos necesarios para iniciar sesión (incluye el hash). Uso interno. */
export async function obtenerCredenciales(documento) {
  const { rows } = await pool.query(
    `SELECT id, nombre, rol, estado, contrasena_hash
       FROM usuarios WHERE documento = $1`,
    [documento]
  );

  return rows[0] ?? null;
}

/** Datos mínimos del usuario autenticado, leídos en cada petición. */
export async function obtenerParaSesion(id) {
  const { rows } = await pool.query(
    "SELECT id, nombre, documento, rol, estado FROM usuarios WHERE id = $1",
    [id]
  );

  return rows[0] ?? null;
}
