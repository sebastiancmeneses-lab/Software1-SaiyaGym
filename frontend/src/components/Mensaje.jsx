import { useEffect } from "react";

// Aviso flotante de éxito o error. Desaparece solo a los 5 segundos.
function Mensaje({ mensaje, onCerrar }) {
  useEffect(() => {
    if (!mensaje) return undefined;

    const temporizador = setTimeout(onCerrar, 5000);
    return () => clearTimeout(temporizador);
  }, [mensaje, onCerrar]);

  if (!mensaje) return null;

  return (
    <div
      className={`mensaje ${mensaje.tipo}`}
      role={mensaje.tipo === "error" ? "alert" : "status"}
    >
      <span>{mensaje.texto}</span>
      <button
        type="button"
        className="mensaje-cerrar"
        onClick={onCerrar}
        aria-label="Cerrar mensaje"
      >
        ×
      </button>
    </div>
  );
}

export default Mensaje;
