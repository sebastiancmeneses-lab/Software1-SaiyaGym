import { useState } from "react";
import "./App.css";

function App() {
  const [usuarios, setUsuarios] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: "",
    documento: "",
    telefono: "",
    correo: "",
  });

  const [busqueda, setBusqueda] = useState("");
  const [editando, setEditando] = useState(null);

  const manejarCambio = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const guardarUsuario = (e) => {
    e.preventDefault();

    if (
      !formulario.nombre ||
      !formulario.documento ||
      !formulario.telefono ||
      !formulario.correo
    ) {
      alert("Por favor completa todos los campos.");
      return;
    }

    if (editando !== null) {
      setUsuarios(
        usuarios.map((usuario) =>
          usuario.id === editando
            ? { ...usuario, ...formulario }
            : usuario
        )
      );

      setEditando(null);
    } else {
      const nuevoUsuario = {
        id: Date.now(),
        ...formulario,
        estado: "Activo",
      };

      setUsuarios([...usuarios, nuevoUsuario]);
    }

    setFormulario({
      nombre: "",
      documento: "",
      telefono: "",
      correo: "",
    });
  };

  const editarUsuario = (usuario) => {
    setFormulario({
      nombre: usuario.nombre,
      documento: usuario.documento,
      telefono: usuario.telefono,
      correo: usuario.correo,
    });

    setEditando(usuario.id);
  };

  const cambiarEstado = (id) => {
    setUsuarios(
      usuarios.map((usuario) =>
        usuario.id === id
          ? {
              ...usuario,
              estado: usuario.estado === "Activo" ? "Inactivo" : "Activo",
            }
          : usuario
      )
    );
  };

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usuario.documento.includes(busqueda)
  );

  return (
    <div className="app">
      <header className="encabezado">
        <div>
          <h1>SAIYAGYM</h1>
          <p>Sistema de gestión para gimnasios</p>
        </div>

        <span className="modulo">Gestión de usuarios</span>
      </header>

      <main className="contenido">
        <section className="tarjeta">
          <h2>{editando ? "Actualizar usuario" : "Registrar usuario"}</h2>

          <form onSubmit={guardarUsuario} className="formulario">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre completo"
              value={formulario.nombre}
              onChange={manejarCambio}
            />

            <input
              type="text"
              name="documento"
              placeholder="Documento"
              value={formulario.documento}
              onChange={manejarCambio}
            />

            <input
              type="text"
              name="telefono"
              placeholder="Teléfono"
              value={formulario.telefono}
              onChange={manejarCambio}
            />

            <input
              type="email"
              name="correo"
              placeholder="Correo electrónico"
              value={formulario.correo}
              onChange={manejarCambio}
            />

            <button type="submit">
              {editando ? "Guardar cambios" : "Registrar usuario"}
            </button>
          </form>
        </section>

        <section className="tarjeta">
          <div className="titulo-listado">
            <h2>Usuarios registrados</h2>

            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {usuariosFiltrados.length === 0 ? (
            <p className="vacio">
              No hay usuarios registrados.
            </p>
          ) : (
            <div className="tabla-contenedor">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Documento</th>
                    <th>Teléfono</th>
                    <th>Correo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.documento}</td>
                      <td>{usuario.telefono}</td>
                      <td>{usuario.correo}</td>
                      <td>
                        <span
                          className={
                            usuario.estado === "Activo"
                              ? "activo"
                              : "inactivo"
                          }
                        >
                          {usuario.estado}
                        </span>
                      </td>

                      <td>
                        <button
                          className="boton-editar"
                          onClick={() => editarUsuario(usuario)}
                        >
                          Editar
                        </button>

                        <button
                          className="boton-estado"
                          onClick={() => cambiarEstado(usuario.id)}
                        >
                          {usuario.estado === "Activo"
                            ? "Inactivar"
                            : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;