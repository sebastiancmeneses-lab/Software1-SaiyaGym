import { useCallback, useState } from "react";
import "./App.css";
import Mensaje from "./components/Mensaje.jsx";
import MiRutinaPage from "./pages/MiRutinaPage.jsx";
import RutinasPage from "./pages/RutinasPage.jsx";
import UsuariosPage from "./pages/UsuariosPage.jsx";

const modulos = [
  { id: "usuarios", nombre: "Usuarios", perfil: "Administrador", sprint: 1 },
  { id: "rutinas", nombre: "Rutinas", perfil: "Entrenador", sprint: 2 },
  { id: "mi-rutina", nombre: "Mi rutina", perfil: "Usuario", sprint: 2 },
];

function App() {
  const [moduloActivo, setModuloActivo] = useState("usuarios");
  const [mensaje, setMensaje] = useState(null);

  // Cada llamada crea un objeto nuevo para que el aviso se reinicie.
  const notificar = useCallback((tipo, texto) => {
    setMensaje({ tipo, texto });
  }, []);

  const cerrarMensaje = useCallback(() => setMensaje(null), []);

  const cambiarModulo = (id) => {
    setModuloActivo(id);
    setMensaje(null);
  };

  const modulo = modulos.find((item) => item.id === moduloActivo);

  return (
    <div className="app">
      <Mensaje mensaje={mensaje} onCerrar={cerrarMensaje} />

      <header className="encabezado">
        <div className="marca">
          <div className="marca-simbolo">S</div>

          <div>
            <h1>SAIYAGYM</h1>
            <p>SISTEMA DE GESTIÓN PARA GIMNASIOS</p>
          </div>
        </div>

        <nav className="navegacion" aria-label="Módulos del sistema">
          {modulos.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`navegacion-item ${
                item.id === moduloActivo ? "activa" : ""
              }`}
              aria-current={item.id === moduloActivo ? "page" : undefined}
              onClick={() => cambiarModulo(item.id)}
            >
              <span>{item.nombre}</span>
              <small>{item.perfil}</small>
            </button>
          ))}
        </nav>
      </header>

      <main className="contenido">
        {moduloActivo === "usuarios" && <UsuariosPage notificar={notificar} />}
        {moduloActivo === "rutinas" && <RutinasPage notificar={notificar} />}
        {moduloActivo === "mi-rutina" && <MiRutinaPage notificar={notificar} />}

        <footer className="pie-pagina">
          <span>SAIYAGYM</span>
          <span>
            {modulo.nombre} · Sprint {modulo.sprint}
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
