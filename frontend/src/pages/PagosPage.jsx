import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api.js";

const moneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 2,
});

const periodoActual = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;
};

const formularioInicial = () => ({
  usuario_id: "",
  concepto: "Mensualidad",
  periodo: periodoActual(),
  valor: "",
});

// Sprint 3 - E3-HU1: el administrador registra los pagos de los usuarios.
// Las reglas (valor válido, usuario existente, pago duplicado) las valida
// el backend; aquí solo se muestran los mensajes que devuelve la API.
function PagosPage({ notificar }) {
  const [usuarios, setUsuarios] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  const [formulario, setFormulario] = useState(formularioInicial);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  const cargarPagos = useCallback(async () => {
    try {
      const respuesta = await api.pagos.listar();
      setPagos(respuesta.data);
      setErrorCarga(null);
    } catch (error) {
      setErrorCarga(error.message);
    } finally {
      setCargando(false);
    }
  }, []);

  // Carga inicial: usuarios para elegir y últimos pagos registrados.
  useEffect(() => {
    let vigente = true;

    Promise.all([api.pagos.usuarios(), api.pagos.listar()])
      .then(([respUsuarios, respPagos]) => {
        if (!vigente) return;
        setUsuarios(respUsuarios.data);
        setPagos(respPagos.data);
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

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({ ...anterior, [name]: value }));
    setErrores((anteriores) => ({ ...anteriores, [name]: false }));
  };

  const registrarPago = async (e) => {
    e.preventDefault();
    if (guardando) return;

    setGuardando(true);
    setErrores({});

    try {
      const respuesta = await api.pagos.registrar(formulario);

      notificar("exito", respuesta.mensaje);
      setFormulario(formularioInicial());
      await cargarPagos();
    } catch (error) {
      setErrores(
        Object.fromEntries((error.campos || []).map((campo) => [campo, true]))
      );
      notificar("error", error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <>
      <section className="bienvenida">
        <div>
          <span className="sobretitulo">PANEL ADMINISTRATIVO</span>
          <h2>Gestión de pagos</h2>
          <p>
            Registra los pagos realizados por los usuarios para mantener
            el control de los ingresos del gimnasio.
          </p>
        </div>

        <div className="bienvenida-icono" aria-hidden="true">
          <span>SG</span>
        </div>
      </section>

      <section className="tarjeta">
        <div className="encabezado-tarjeta">
          <div>
            <span className="sobretitulo">NUEVO REGISTRO</span>
            <h2>Registrar pago</h2>
          </div>

          <span className="numero-seccion">01</span>
        </div>

        <form onSubmit={registrarPago} className="formulario" noValidate>
          <label
            className={`campo-completo ${errores.usuario_id ? "campo-error" : ""}`}
          >
            Usuario
            <select
              name="usuario_id"
              value={formulario.usuario_id}
              onChange={manejarCambio}
              aria-invalid={Boolean(errores.usuario_id)}
            >
              <option value="">Selecciona un usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre} · {usuario.documento}
                  {usuario.estado !== "Activo" ? " (inactivo)" : ""}
                </option>
              ))}
            </select>
          </label>

          <label className={errores.concepto ? "campo-error" : ""}>
            Concepto
            <input
              type="text"
              name="concepto"
              placeholder="Ej. Mensualidad"
              value={formulario.concepto}
              onChange={manejarCambio}
              autoComplete="off"
              aria-invalid={Boolean(errores.concepto)}
            />
          </label>

          <label className={errores.periodo ? "campo-error" : ""}>
            Período
            <input
              type="month"
              name="periodo"
              value={formulario.periodo}
              onChange={manejarCambio}
              aria-invalid={Boolean(errores.periodo)}
            />
          </label>

          <label className={`campo-completo ${errores.valor ? "campo-error" : ""}`}>
            Valor del pago (COP)
            <input
              type="text"
              inputMode="decimal"
              name="valor"
              placeholder="Ej. 80000"
              value={formulario.valor}
              onChange={manejarCambio}
              autoComplete="off"
              aria-invalid={Boolean(errores.valor)}
            />
          </label>

          <div className="acciones-formulario">
            <button className="boton-principal" type="submit" disabled={guardando}>
              {guardando ? "Registrando..." : "Registrar pago"}
            </button>
          </div>
        </form>
      </section>

      <section className="tarjeta">
        <div className="encabezado-listado">
          <div className="titulo-listado">
            <div>
              <span className="sobretitulo">MOVIMIENTOS</span>
              <h2>Últimos pagos registrados</h2>
            </div>

            <span className="contador">
              {pagos.length} {pagos.length === 1 ? "pago" : "pagos"}
            </span>
          </div>
        </div>

        {cargando ? (
          <div className="vacio">
            <h3>Cargando pagos...</h3>
          </div>
        ) : errorCarga ? (
          <div className="vacio">
            <div className="vacio-icono" aria-hidden="true">!</div>
            <h3>No se pudieron cargar los pagos</h3>
            <p>{errorCarga}</p>
            <button
              className="boton-secundario boton-compacto"
              type="button"
              onClick={cargarPagos}
            >
              Reintentar
            </button>
          </div>
        ) : pagos.length === 0 ? (
          <div className="vacio">
            <div className="vacio-icono" aria-hidden="true">＋</div>
            <h3>Todavía no hay pagos</h3>
            <p>Registra el primer pago con el formulario de arriba.</p>
          </div>
        ) : (
          <div className="tabla-contenedor">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Documento</th>
                  <th>Concepto</th>
                  <th>Período</th>
                  <th>Valor</th>
                  <th>Fecha de pago</th>
                </tr>
              </thead>

              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id}>
                    <td data-label="Usuario">
                      <div className="celda-usuario">
                        <span className="avatar">
                          {pago.usuario_nombre.charAt(0).toUpperCase()}
                        </span>
                        <span>{pago.usuario_nombre}</span>
                      </div>
                    </td>
                    <td data-label="Documento">{pago.usuario_documento}</td>
                    <td data-label="Concepto">{pago.concepto}</td>
                    <td data-label="Período">{pago.periodo}</td>
                    <td data-label="Valor">{moneda.format(pago.valor)}</td>
                    <td data-label="Fecha">{pago.fecha_pago}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default PagosPage;
