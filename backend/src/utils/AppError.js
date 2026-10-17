/**
 * Error controlado de la aplicación.
 * Lleva el código HTTP, un código interno (para que React lo interprete)
 * y un mensaje claro para mostrar al usuario.
 */
export class AppError extends Error {
  constructor(estado, codigo, mensaje, campos = []) {
    super(mensaje);
    this.name = "AppError";
    this.estado = estado;
    this.codigo = codigo;
    this.campos = campos;
  }
}

/** Convierte un id recibido en la URL o el cuerpo en un entero válido. */
export function leerId(valor, nombre = "id") {
  const texto = String(valor ?? "").trim();

  if (!/^\d+$/.test(texto) || Number(texto) > 2147483647) {
    throw new AppError(400, "ID_INVALIDO", `El ${nombre} indicado no es válido.`);
  }

  return Number(texto);
}
