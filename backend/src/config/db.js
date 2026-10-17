import pg from "pg";
import { config } from "./env.js";

export const pool = new pg.Pool({
  ...config.db,
  max: 10,
  idleTimeoutMillis: 30000,
});

// Evita que un error de una conexión inactiva tumbe el servidor.
pool.on("error", (error) => {
  console.error("Error inesperado en el pool de PostgreSQL:", error.message);
});

/**
 * Ejecuta varias consultas dentro de una transacción.
 * Si algo falla, se hace ROLLBACK y no queda nada a medias.
 */
export async function conTransaccion(operacion) {
  const cliente = await pool.connect();

  try {
    await cliente.query("BEGIN");
    const resultado = await operacion(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}
