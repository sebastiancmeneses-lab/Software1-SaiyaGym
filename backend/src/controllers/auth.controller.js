import * as servicio from "../services/auth.service.js";
import { enviar } from "../utils/respuestas.js";

export async function iniciarSesion(req, res) {
  const sesion = await servicio.iniciarSesion(req.body, req.ip);
  enviar(res, 200, sesion, { mensaje: "Sesión iniciada correctamente." });
}

// Devuelve el usuario de la sesión actual (el frontend lo usa al recargar).
export async function yo(req, res) {
  const { id, nombre, rol } = req.usuario;
  enviar(res, 200, { id, nombre, rol });
}
