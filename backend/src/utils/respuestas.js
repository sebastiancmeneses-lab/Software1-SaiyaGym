/** Respuesta exitosa con formato uniforme: { ok: true, data, ...extra } */
export function enviar(res, estado, data, extra = {}) {
  return res.status(estado).json({ ok: true, data, ...extra });
}
