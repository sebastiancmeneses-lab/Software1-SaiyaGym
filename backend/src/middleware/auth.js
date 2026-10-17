import { validarToken } from "../services/auth.service.js";
import { AppError } from "../utils/AppError.js";

/**
 * Exige una sesión válida (cabecera "Authorization: Bearer <token>").
 * El rol y el estado se leen de la base de datos en cada petición:
 * si el administrador inactiva o cambia de rol a alguien, el efecto
 * es inmediato.
 */
export async function autenticar(req, res, next) {
  const cabecera = req.headers.authorization || "";
  const [esquema, token] = cabecera.split(" ");

  if (esquema !== "Bearer" || !token) {
    throw new AppError(
      401,
      "NO_AUTENTICADO",
      "Debes iniciar sesión para continuar."
    );
  }

  req.usuario = await validarToken(token);
  next();
}

/** Permite el acceso solo a los roles indicados. Va después de autenticar. */
export function autorizar(...rolesPermitidos) {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario?.rol)) {
      throw new AppError(
        403,
        "SIN_PERMISO",
        "No tienes permiso para realizar esta acción."
      );
    }

    next();
  };
}
