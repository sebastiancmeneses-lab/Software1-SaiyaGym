// Muestra una rutina completa: datos generales y tabla de ejercicios.
function DetalleRutina({ rutina }) {
  return (
    <div className="detalle-rutina">
      <dl className="metadatos">
        <div>
          <dt>Objetivo</dt>
          <dd>{rutina.objetivo}</dd>
        </div>
        <div>
          <dt>Entrenador</dt>
          <dd>{rutina.entrenador_nombre}</dd>
        </div>
        <div>
          <dt>Ejercicios</dt>
          <dd>{rutina.ejercicios.length}</dd>
        </div>
      </dl>

      <div className="tabla-contenedor">
        <table className="tabla-corta">
          <thead>
            <tr>
              <th>#</th>
              <th>Ejercicio</th>
              <th>Series</th>
              <th>Repeticiones</th>
            </tr>
          </thead>

          <tbody>
            {rutina.ejercicios.map((ejercicio) => (
              <tr key={ejercicio.orden}>
                <td data-label="#">{ejercicio.orden}</td>
                <td data-label="Ejercicio">{ejercicio.nombre}</td>
                <td data-label="Series">{ejercicio.series}</td>
                <td data-label="Repeticiones">{ejercicio.repeticiones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DetalleRutina;
