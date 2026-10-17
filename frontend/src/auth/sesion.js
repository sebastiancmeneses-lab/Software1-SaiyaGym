// El token vive en sessionStorage: se borra al cerrar el navegador.
// Todo acceso va protegido porque el almacenamiento puede no estar disponible.
const CLAVE = "saiyagym.token";

export function leerToken() {
  try {
    return sessionStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export function guardarToken(token) {
  try {
    sessionStorage.setItem(CLAVE, token);
  } catch {
    /* sin almacenamiento: la sesión dura hasta recargar */
  }
}

export function borrarToken() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    /* nada que borrar */
  }
}
