import * as repositorio from "../repositories/usuarios.repository.js";
import { AppError, leerId } from "../utils/AppError.js";

// Capa de lógica de negocio del módulo de usuarios (Sprint 1).

const ETIQUETAS = {
  nombre: "Nombre completo",
  documento: "Número de documento",
  telefono: "Teléfono",
  correo: "Correo electrónico",
};

export const ROLES = ["administrador", "entrenador", "usuario"];
export const ESTADOS = ["Activo", "Inactivo"];

const patronDocumento = /^[A-Za-z0-9]{4,20}$/;
const patronTelefono = /^\+?[0-9\s-]{7,20}$/;
const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const comoTexto = (valor) =>
  typeof valor === "string" || typeof valor === "number"
    ? String(valor).trim()
    : "";

/** Valida y limpia los datos de un usuario. Lanza AppError si algo falla. */
function validarUsuario(cuerpo) {
  const datos = {
    nombre: comoTexto(cuerpo?.nombre).replace(/\s+/g, " "),
    documento: comoTexto(cuerpo?.documento).toUpperCase(),
    telefono: comoTexto(cuerpo?.telefono),
    correo: comoTexto(cuerpo?.correo).toLowerCase(),
    rol: comoTexto(cuerpo?.rol).toLowerCase() || "usuario",
  };

  const faltantes = Object.keys(ETIQUETAS).filter((campo) => !datos[campo]);

  if (faltantes.length > 0) {
    throw new AppError(
      400,
      "DATOS_INCOMPLETOS",
      `Faltan campos obligatorios: ${faltantes
        .map((campo) => ETIQUETAS[campo])
        .join(", ")}.`,
      faltantes
    );
  }

  const problemas = [];

  if (datos.nombre.length > 120) {
    problemas.push(["nombre", "El nombre debe tener máximo 120 caracteres."]);
  }

  if (!patronDocumento.test(datos.documento)) {
    problemas.push([
      "documento",
      "El documento debe tener entre 4 y 20 letras o números, sin espacios.",
    ]);
  }

  if (!patronTelefono.test(datos.telefono)) {
    problemas.push([
      "telefono",
      "El teléfono debe tener entre 7 y 20 dígitos (puede incluir +, espacios o guiones).",
    ]);
  }

  if (!patronCorreo.test(datos.correo) || datos.correo.length > 120) {
    problemas.push(["correo", "Ingresa un correo electrónico válido."]);
  }

  if (!ROLES.includes(datos.rol)) {
    problemas.push(["rol", "El rol debe ser administrador, entrenador o usuario."]);
  }

  if (problemas.length > 0) {
    throw new AppError(
      400,
      "DATOS_INVALIDOS",
      problemas.map(([, mensaje]) => mensaje).join(" "),
      problemas.map(([campo]) => campo)
    );
  }

  return datos;
}

async function exigirNoDuplicado(documento, excluirId = null) {
  const duplicado = await repositorio.buscarPorDocumento(documento, excluirId);

  if (duplicado) {
    throw new AppError(
      409,
      "USUARIO_DUPLICADO",
      "El usuario ya existe: hay un registro con ese documento.",
      ["documento"]
    );
  }
}

async function exigirExistente(id) {
  const usuario = await repositorio.obtenerPorId(id);

  if (!usuario) {
    throw new AppError(404, "USUARIO_NO_ENCONTRADO", "El usuario no existe.");
  }

  return usuario;
}

// E1-HU1
export async function registrar(cuerpo) {
  const datos = validarUsuario(cuerpo);
  await exigirNoDuplicado(datos.documento);

  return repositorio.crear(datos);
}

// E1-HU2: consultar y buscar por nombre o documento.
export async function listar(consulta = {}) {
  const filtros = {};
  let buscando = false;

  if (consulta.buscar !== undefined) {
    const criterio = comoTexto(consulta.buscar);

    if (!criterio) {
      throw new AppError(
        400,
        "CRITERIO_VACIO",
        "Ingresa un nombre o número de documento para buscar."
      );
    }

    filtros.buscar = criterio;
    buscando = true;
  }

  if (consulta.rol !== undefined) {
    if (!ROLES.includes(consulta.rol)) {
      throw new AppError(400, "ROL_INVALIDO", "El rol indicado no es válido.");
    }
    filtros.rol = consulta.rol;
  }

  if (consulta.estado !== undefined) {
    if (!ESTADOS.includes(consulta.estado)) {
      throw new AppError(400, "ESTADO_INVALIDO", "El estado indicado no es válido.");
    }
    filtros.estado = consulta.estado;
  }

  const [usuarios, resumen] = await Promise.all([
    repositorio.listar(filtros),
    repositorio.resumen(),
  ]);

  return {
    usuarios,
    resumen,
    mensaje:
      buscando && usuarios.length === 0
        ? "No se encontró ningún usuario con ese criterio."
        : undefined,
  };
}

export async function obtener(idCrudo) {
  return exigirExistente(leerId(idCrudo, "id de usuario"));
}

// E1-HU3
export async function actualizar(idCrudo, cuerpo) {
  const id = leerId(idCrudo, "id de usuario");
  await exigirExistente(id);

  const datos = validarUsuario(cuerpo);
  await exigirNoDuplicado(datos.documento, id);

  return repositorio.actualizar(id, datos);
}

// E1-HU4: se cambia el estado, nunca se elimina el registro.
export async function cambiarEstado(idCrudo, cuerpo) {
  const id = leerId(idCrudo, "id de usuario");
  const estado = comoTexto(cuerpo?.estado);

  if (!ESTADOS.includes(estado)) {
    throw new AppError(
      400,
      "ESTADO_INVALIDO",
      "El estado debe ser Activo o Inactivo.",
      ["estado"]
    );
  }

  await exigirExistente(id);

  return repositorio.cambiarEstado(id, estado);
}
