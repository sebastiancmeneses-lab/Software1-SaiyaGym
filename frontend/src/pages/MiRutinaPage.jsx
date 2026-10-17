import { useCallback, useEffect, useState } from "react";
import DetalleRutina from "../components/DetalleRutina.jsx";
import { api } from "../services/api.js";

// Sprint 2 - E2-HU4: el usuario consulta su rutina asignada.
// Mientras no exista inicio de sesión, se elige el usuario de una lista.
function MiRutinaPage({ notificar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState(null); // { rutina, fecha_asignacion }
  const [aviso, setAviso] = useState(null); // { titulo, texto }

  const cargarUsuarios = useCallback(async () => {
    try {
      const respuesta = await api.usuarios.listar({ rol: "usuario" });
      setUsuarios(respuesta.data);
      setErrorCarga(null);
    } catch (error) {
      setErrorCarga(error.message);
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga inicial de la lista de usuarios al abrir el módulo.
  useEffect(() => {
    let vigente = true;

    api.usuarios
      .listar({ rol: "usuario" })
      .then((respuesta) => {
        if (!vigente) return;
        setUsuarios(respuesta.data);
        setErrorCarga(null);
      })
      .catch((error) => {
        if (vigente) setErrorCarga(error.message);
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  const consultar = async (e) => {
    e.preventDefault();

    setResultado(null);
    setAviso(null);

    if (!usuarioId) {
      notificar("error", "Selecciona un usuario para consultar su rutina.");
      return;
    }

    setConsultando(true);

    try {
      const respuesta = await api.usuarios.rutinaAsignada(usuarioId);
      setResultado(respuesta.data);
    } catch (error) {
      if (error.codigo === "SIN_RUTINA") {
        setAviso({ titulo: "Sin rutina asignada", texto: error.message });
      } else if (error.codigo === "RUTINA_NO_DISPONIBLE") {
        setAviso({ titulo: "Rutina no disponible", texto: error.message });
      } else {
        notificar("error", error.message);
      }
    } finally {
      setConsultando(false);
    }
  };

  return (
    <>
      <section className="bienvenida">
        <div>
          <span className="sobretitulo">PANEL DEL USUARIO</span>
          <h2>Mi rutina</h2>
          <p>
            Consulta los ejercicios que debes realizar según la rutina
            que te asignó tu entrenador.
          </p>
        </div>

        <div className="bienvenida-icono" aria-hidden="true">
          <span>SG</span>
        </div>
      </section>

      <section className="tarjeta">
        <div className="encabezado-tarjeta">
          <div>
            <span className="sobretitulo">CONSULTA</span>
            <h2>Consultar rutina asignada</h2>
          </div>

          <span className="numero-seccion">01</span>
        </div>

        {errorCarga ? (
          <div className="vacio">
            <div className="vacio-icono" aria-hidden="true">!</div>
            <h3>No se pudo cargar la lista de usuarios</h3>
            <p>{errorCarga}</p>
            <button
              className="boton-secundario boton-compacto"
              type="button"
              onClick={cargarUsuarios}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <form onSubmit={consultar} className="formulario" noValidate>
            <label className="campo-completo">
              Usuario
              <select
                value={usuarioId}
                onChange={(e) => setUsuarioId(e.target.value)}
                disabled={cargando}
              >
                <option value="">
                  {cargando ? "Cargando usuarios..." : "Selecciona un usuario"}
                </option>
                {usuarios.map((usuario) => (
                  <option key={usuario.id} value={usuario.id}>
                    {usuario.nombre} · {usuario.documento}
                    {usuario.estado === "Inactivo" ? " (inactivo)" : ""}
                  </option>
                ))}
              </select>
            </label>

            <div className="acciones-formulario">
              <button
                className="boton-principal"
                type="submit"
                disabled={consultando}
              >
                {consultando ? "Consultando..." : "Consultar rutina"}
              </button>
            </div>
          </form>
        )}
      </section>

      {aviso && (
        <section className="tarjeta">
          <div className="vacio">
            <div className="vacio-icono" aria-hidden="true">i</div>
            <h3>{aviso.titulo}</h3>
            <p>{aviso.texto}</p>
          </div>
        </section>
      )}

      {resultado && (
        <section className="tarjeta">
          <div className="encabezado-tarjeta">
            <div>
              <span className="sobretitulo">
                RUTINA DE {resultado.usuario.nombre.toUpperCase()}
              </span>
              <h2>{resultado.rutina.nombre}</h2>
            </div>

            <span className="contador">
              Asignada el {resultado.fecha_asignacion}
            </span>
          </div>

          <DetalleRutina rutina={resultado.rutina} />
        </section>
      )}
    </>
  );
}

export default MiRutinaPage;
