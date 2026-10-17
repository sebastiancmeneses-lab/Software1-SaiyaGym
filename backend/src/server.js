import app from "./app.js";
import { pool } from "./config/db.js";
import { config } from "./config/env.js";

// Sin una clave de firma segura no se puede iniciar: las sesiones
// quedarían sin protección.
if (config.jwt.secreto.length < 16) {
  console.error(
    "Falta JWT_SECRET en backend/.env (mínimo 16 caracteres).\n" +
      "Copia el valor de ejemplo de .env.example y cámbialo por una frase larga y propia."
  );
  process.exit(1);
}

const servidor = app.listen(config.puerto, async () => {
  console.log(`API de SAIYAGYM escuchando en http://localhost:${config.puerto}`);

  try {
    await pool.query("SELECT 1");
    console.log(
      `Conectado a PostgreSQL (${config.db.database} en ${config.db.host}:${config.db.port}).`
    );
  } catch (error) {
    console.error(
      "No se pudo conectar a PostgreSQL. Revisa backend/.env y que la base exista (npm run db:init).\n" +
        `Detalle: ${error.message}`
    );
  }
});

servidor.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `El puerto ${config.puerto} ya está en uso. Cierra el otro programa o cambia PORT en backend/.env.`
    );
  } else {
    console.error(error);
  }
  process.exit(1);
});

async function cerrar() {
  servidor.close();
  await pool.end();
  process.exit(0);
}

process.on("SIGINT", cerrar);
process.on("SIGTERM", cerrar);
