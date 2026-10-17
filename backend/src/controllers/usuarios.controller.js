import * as servicio from "../services/usuarios.service.js";
import { enviar } from "../utils/respuestas.js";

// Los controladores solo reciben la petición, llaman al servicio
// y arman la respuesta. La lógica de negocio vive en los servicios.

export async function registrar(req, res) {
  const usuario = await servicio.registrar(req.body);
  enviar(res, 201, usuario, { mensaje: "Usuario registrado correctamente." });
}

export async function listar(req, res) {
  const { usuarios, resumen, mensaje } = await servicio.listar(req.query);
  enviar(res, 200, usuarios, { meta: { resumen }, mensaje });
}

export async function obtener(req, res) {
  enviar(res, 200, await servicio.obtener(req.params.id));
}

export async function actualizar(req, res) {
  const usuario = await servicio.actualizar(req.params.id, req.body, req.usuario);
  enviar(res, 200, usuario, { mensaje: "Usuario actualizado correctamente." });
}

export async function cambiarEstado(req, res) {
  const usuario = await servicio.cambiarEstado(req.params.id, req.body, req.usuario);
  const accion = usuario.estado === "Activo" ? "activado" : "inactivado";

  enviar(res, 200, usuario, {
    mensaje: `${usuario.nombre} fue ${accion} correctamente.`,
  });
}
