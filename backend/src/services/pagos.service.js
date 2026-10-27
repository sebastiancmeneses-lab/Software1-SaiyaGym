import { conTransaccion } from "../config/db.js";
import * as repositorio from "../repositories/pagos.repository.js";
import * as usuarios from "../repositories/usuarios.repository.js";
import { AppError, leerId } from "../utils/AppError.js";

// Capa de lógica de negocio de pagos (Sprint 3: E3-HU1 y E3-HU2).

const CONCEPTO_POR_DEFECTO = "Mensualidad";
const VALOR_MAXIMO = 9999999999.99; // NUMERIC(12,2)
const patronPeriodo = /^\d{4}-(0[1-9]|1[0-2])$/;

const vacio = (valor) =>
  valor === undefined || valor === null || String(valor).trim() === "";

/** Período actual en formato AAAA-MM. */
function periodoActual() {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
}

/** Convierte el valor recibido en número con máximo 2 decimales; null si no es válido. */
function leerValor(crudo) {
  const texto = String(crudo ?? "").trim().replace(",", ".");

  if (!/^-?\d+(\.\d{1,2})?$/.test(texto)) return null;

  return Number(texto);
}

/** Usuarios del gimnasio a quienes se les puede registrar un pago. */
export async function listarUsuariosPagables() {
  const lista = await usuarios.listar({ rol: "usuario" });

  return lista.map(({ id, nombre, documento, estado }) => ({
    id,
    nombre,
    documento,
    estado,
  }));
}

// E3-HU1: el administrador registra el pago de un usuario.
export async function registrar(cuerpo, administrador) {
  if (vacio(cuerpo?.usuario_id)) {
    throw new AppError(
      400,
      "USUARIO_NO_SELECCIONADO",
      "Selecciona el usuario que realizó el pago.",
      ["usuario_id"]
    );
  }

  const usuarioId = leerId(cuerpo.usuario_id, "usuario");
  const concepto =
    String(cuerpo?.concepto ?? "").trim().replace(/\s+/g, " ") ||
    CONCEPTO_POR_DEFECTO;
  const periodo = String(cuerpo?.periodo ?? "").trim() || periodoActual();

  if (concepto.length > 80) {
    throw new AppError(
      400,
      "CONCEPTO_INVALIDO",
      "El concepto debe tener máximo 80 caracteres.",
      ["concepto"]
    );
  }

  if (!patronPeriodo.test(periodo)) {
    throw new AppError(
      400,
      "PERIODO_INVALIDO",
      "El período debe tener el formato AAAA-MM (por ejemplo 2026-10).",
      ["periodo"]
    );
  }

  if (vacio(cuerpo?.valor)) {
    throw new AppError(
      400,
      "VALOR_INVALIDO",
      "Ingresa el valor del pago.",
      ["valor"]
    );
  }

  const valor = leerValor(cuerpo.valor);

  if (valor === null || valor <= 0 || valor > VALOR_MAXIMO) {
    throw new AppError(
      400,
      "VALOR_INVALIDO",
      "El valor del pago debe ser un número mayor que cero (máximo 2 decimales).",
      ["valor"]
    );
  }

  const usuario = await usuarios.obtenerPorId(usuarioId);

  if (!usuario) {
    throw new AppError(404, "USUARIO_NO_ENCONTRADO", "El usuario no fue encontrado.", [
      "usuario_id",
    ]);
  }

  if (usuario.rol !== "usuario") {
    throw new AppError(
      409,
      "USUARIO_NO_PAGA",
      "Los pagos solo se registran a usuarios del gimnasio.",
      ["usuario_id"]
    );
  }

  const yaPagada = () =>
    new AppError(
      409,
      "PAGO_DUPLICADO",
      `La obligación "${concepto}" del período ${periodo} ya fue registrada como pagada para ${usuario.nombre}.`,
      ["concepto", "periodo"]
    );

  try {
    const pago = await conTransaccion(async (cliente) => {
      const obligacion = await repositorio.obtenerObligacionBloqueada(
        cliente,
        usuarioId,
        concepto,
        periodo
      );

      let obligacionId;

      if (!obligacion) {
        // No había una obligación previa: se crea ya saldada con este pago.
        ({ id: obligacionId } = await repositorio.crearObligacion(cliente, {
          usuarioId,
          concepto,
          periodo,
          valor,
          estado: "Pagada",
        }));
      } else if (obligacion.estado === "Pagada") {
        throw yaPagada();
      } else {
        obligacionId = obligacion.id;
        await repositorio.marcarObligacionPagada(cliente, obligacionId);
      }

      const { id } = await repositorio.crearPago(cliente, {
        obligacionId,
        usuarioId,
        valor,
        registradoPor: administrador.id,
      });

      return repositorio.obtenerPago(cliente, id);
    });

    return pago;
  } catch (error) {
    // Dos registros simultáneos: la restricción única de la base los detiene.
    if (error.code === "23505") throw yaPagada();
    throw error;
  }
}

/** Últimos pagos registrados (vista del administrador). */
export async function listarRecientes() {
  return repositorio.listarRecientes();
}

// E3-HU2: el usuario consulta SU historial (el id sale de la sesión).
export async function consultarHistorial(usuarioIdCrudo, periodoCrudo) {
  const usuarioId = leerId(usuarioIdCrudo, "id de usuario");
  const periodo = String(periodoCrudo ?? "").trim();

  if (periodo && !patronPeriodo.test(periodo)) {
    throw new AppError(
      400,
      "PERIODO_INVALIDO",
      "El período debe tener el formato AAAA-MM (por ejemplo 2026-10).",
      ["periodo"]
    );
  }

  const pagos = await repositorio.listarPorUsuario(usuarioId, periodo || null);
  const total = pagos.reduce((suma, pago) => suma + pago.valor, 0);

  return {
    pagos,
    resumen: { cantidad: pagos.length, total: Math.round(total * 100) / 100 },
    periodo: periodo || null,
  };
}
