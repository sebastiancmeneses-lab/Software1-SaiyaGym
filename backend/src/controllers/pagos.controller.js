import * as servicio from "../services/pagos.service.js";
import { enviar } from "../utils/respuestas.js";

// E3-HU1 (administrador)
export async function registrar(req, res) {
  const pago = await servicio.registrar(req.body, req.usuario);
  enviar(res, 201, pago, {
    mensaje: `Pago de ${pago.usuario_nombre} registrado correctamente.`,
  });
}

export async function listar(req, res) {
  enviar(res, 200, await servicio.listarRecientes());
}

export async function usuariosPagables(req, res) {
  enviar(res, 200, await servicio.listarUsuariosPagables());
}

// E3-HU2 (usuario): solo su propio historial, el id sale de la sesión.
export async function misPagos(req, res) {
  enviar(res, 200, await servicio.consultarHistorial(req.usuario.id, req.query.periodo));
}
