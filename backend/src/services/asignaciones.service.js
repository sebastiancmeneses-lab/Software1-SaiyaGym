import { conTransaccion } from "../config/db.js";
import * as asignaciones from "../repositories/asignaciones.repository.js";
import * as rutinas from "../repositories/rutinas.repository.js";
import * as usuarios from "../repositories/usuarios.repository.js";
import { AppError, leerId } from "../utils/AppError.js";

// Capa de lógica de negocio de asignaciones (Sprint 2: E2-HU2 y E2-HU4).

const vacio = (valor) =>
  valor === undefined || valor === null || String(valor).trim() === "";

// E2-HU2: asignar una rutina a un usuario.
export async function asignar(cuerpo) {
  if (vacio(cuerpo?.usuario_id)) {
    throw new AppError(
      400,
      "USUARIO_NO_SELECCIONADO",
      "Selecciona un usuario para asignarle la rutina.",
      ["usuario_id"]
    );
  }

  if (vacio(cuerpo?.rutina_id)) {
    throw new AppError(
      400,
      "RUTINA_NO_SELECCIONADA",
      "Selecciona una rutina para asignar.",
      ["rutina_id"]
    );
  }

  const usuarioId = leerId(cuerpo.usuario_id, "usuario");
  const rutinaId = leerId(cuerpo.rutina_id, "rutina");

  const usuario = await usuarios.obtenerPorId(usuarioId);

  if (!usuario) {
    throw new AppError(404, "USUARIO_NO_ENCONTRADO", "El usuario no existe.");
  }

  if (usuario.estado !== "Activo") {
    throw new AppError(
      409,
      "USUARIO_NO_DISPONIBLE",
      "El usuario seleccionado está inactivo y no está disponible para asignarle una rutina."
    );
  }

  const rutina = await rutinas.obtenerPorId(rutinaId);

  if (!rutina) {
    throw new AppError(404, "RUTINA_NO_ENCONTRADA", "La rutina no fue encontrada.");
  }

  if (rutina.estado !== "Activa") {
    throw new AppError(
      409,
      "RUTINA_NO_DISPONIBLE",
      "La rutina seleccionada no está disponible."
    );
  }

  const asignacion = await conTransaccion((cliente) =>
    asignaciones.asignar(cliente, usuarioId, rutinaId)
  );

  return { asignacion, usuario, rutina };
}

// E2-HU4: consultar la rutina asignada a un usuario.
export async function consultarRutinaDeUsuario(idUsuarioCrudo) {
  const usuarioId = leerId(idUsuarioCrudo, "id de usuario");
  const usuario = await usuarios.obtenerPorId(usuarioId);

  if (!usuario) {
    throw new AppError(404, "USUARIO_NO_ENCONTRADO", "El usuario no existe.");
  }

  const asignacion = await asignaciones.obtenerVigentePorUsuario(usuarioId);

  if (!asignacion) {
    throw new AppError(
      404,
      "SIN_RUTINA",
      "El usuario no tiene una rutina asignada."
    );
  }

  const rutina = await rutinas.obtenerPorId(asignacion.rutina_id);

  if (!rutina || rutina.estado !== "Activa") {
    throw new AppError(
      409,
      "RUTINA_NO_DISPONIBLE",
      "La rutina asignada no está disponible."
    );
  }

  return {
    usuario: { id: usuario.id, nombre: usuario.nombre },
    fecha_asignacion: asignacion.fecha_asignacion,
    rutina,
  };
}
