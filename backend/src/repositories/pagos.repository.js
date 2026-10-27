import { pool } from "../config/db.js";

// Capa de acceso a datos de pagos y obligaciones (Sprint 3).
// Solo SQL, siempre con consultas parametrizadas.

const SELECT_PAGO = `
  SELECT p.id, p.usuario_id, u.nombre AS usuario_nombre, u.documento AS usuario_documento,
         o.concepto, o.periodo, p.valor::float8 AS valor,
         to_char(p.fecha_pago, 'YYYY-MM-DD') AS fecha_pago
    FROM pagos p
    JOIN obligaciones o ON o.id = p.obligacion_id
    JOIN usuarios u     ON u.id = p.usuario_id`;

/**
 * Busca la obligación del usuario para ese concepto y período y la bloquea
 * (FOR UPDATE) hasta terminar la transacción, para que dos registros
 * simultáneos del mismo pago no se crucen.
 */
export async function obtenerObligacionBloqueada(cliente, usuarioId, concepto, periodo) {
  const { rows } = await cliente.query(
    `SELECT id, usuario_id, concepto, periodo, valor::float8 AS valor, estado
       FROM obligaciones
      WHERE usuario_id = $1 AND concepto = $2 AND periodo = $3
        FOR UPDATE`,
    [usuarioId, concepto, periodo]
  );

  return rows[0] ?? null;
}

/** Crea una obligación (ya pagada, cuando el pago se registra sin una pendiente previa). */
export async function crearObligacion(cliente, { usuarioId, concepto, periodo, valor, estado }) {
  const { rows } = await cliente.query(
    `INSERT INTO obligaciones (usuario_id, concepto, periodo, valor, estado)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [usuarioId, concepto, periodo, valor, estado]
  );

  return rows[0];
}

export async function marcarObligacionPagada(cliente, obligacionId) {
  await cliente.query(`UPDATE obligaciones SET estado = 'Pagada' WHERE id = $1`, [
    obligacionId,
  ]);
}

export async function crearPago(cliente, { obligacionId, usuarioId, valor, registradoPor }) {
  const { rows } = await cliente.query(
    `INSERT INTO pagos (obligacion_id, usuario_id, valor, registrado_por)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [obligacionId, usuarioId, valor, registradoPor]
  );

  return rows[0];
}

export async function obtenerPago(cliente, id) {
  const { rows } = await cliente.query(`${SELECT_PAGO} WHERE p.id = $1`, [id]);
  return rows[0] ?? null;
}

/** Pagos de un usuario, del más reciente al más antiguo; opcionalmente de un período. */
export async function listarPorUsuario(usuarioId, periodo) {
  const valores = [usuarioId];
  let filtro = "";

  if (periodo) {
    valores.push(periodo);
    filtro = "AND o.periodo = $2";
  }

  const { rows } = await pool.query(
    `${SELECT_PAGO}
      WHERE p.usuario_id = $1 ${filtro}
      ORDER BY p.fecha_pago DESC, p.id DESC`,
    valores
  );

  return rows;
}

/** Últimos pagos registrados (vista del administrador). */
export async function listarRecientes(limite = 50) {
  const { rows } = await pool.query(
    `${SELECT_PAGO} ORDER BY p.fecha_pago DESC, p.id DESC LIMIT $1`,
    [limite]
  );

  return rows;
}
