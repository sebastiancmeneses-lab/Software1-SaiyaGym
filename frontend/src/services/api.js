// Capa de comunicación con la API REST (Express). Todo el acceso a datos
// del frontend pasa por aquí; los componentes no usan fetch directamente.

const BASE = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
  constructor(mensaje, codigo = "ERROR", campos = [], estado = 0) {
    super(mensaje);
    this.name = "ApiError";
    this.codigo = codigo;
    this.campos = campos;
    this.estado = estado;
  }
}

async function solicitar(metodo, ruta, cuerpo) {
  let respuesta;

  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.",
      "SIN_CONEXION"
    );
  }

  let json = null;

  try {
    json = await respuesta.json();
  } catch {
    json = null;
  }

  if (!respuesta.ok || !json || json.ok !== true) {
    const detalle = json?.error;

    throw new ApiError(
      detalle?.mensaje ||
        "El servidor no pudo procesar la solicitud. Intenta de nuevo.",
      detalle?.codigo || "ERROR",
      detalle?.campos || [],
      respuesta.status
    );
  }

  return json; // { ok, data, meta?, mensaje? }
}

function conParametros(ruta, parametros = {}) {
  const consulta = new URLSearchParams();

  Object.entries(parametros).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null) consulta.append(clave, valor);
  });

  const texto = consulta.toString();
  return texto ? `${ruta}?${texto}` : ruta;
}

export const api = {
  usuarios: {
    listar: (parametros) => solicitar("GET", conParametros("/usuarios", parametros)),
    registrar: (datos) => solicitar("POST", "/usuarios", datos),
    actualizar: (id, datos) => solicitar("PUT", `/usuarios/${id}`, datos),
    cambiarEstado: (id, estado) =>
      solicitar("PATCH", `/usuarios/${id}/estado`, { estado }),
    rutinaAsignada: (id) => solicitar("GET", `/usuarios/${id}/rutina`),
  },
  rutinas: {
    listar: () => solicitar("GET", "/rutinas"),
    obtener: (id) => solicitar("GET", `/rutinas/${id}`),
    crear: (datos) => solicitar("POST", "/rutinas", datos),
    actualizar: (id, datos) => solicitar("PUT", `/rutinas/${id}`, datos),
  },
  asignaciones: {
    asignar: (datos) => solicitar("POST", "/asignaciones", datos),
  },
};
