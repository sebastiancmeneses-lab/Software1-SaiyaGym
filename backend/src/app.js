import cors from "cors";
import express from "express";
import { config } from "./config/env.js";
import { pool } from "./config/db.js";
import { manejarErrores, rutaNoEncontrada } from "./middleware/errorHandler.js";
import asignacionesRoutes from "./routes/asignaciones.routes.js";
import rutinasRoutes from "./routes/rutinas.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";

const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "100kb" }));

// Comprobación rápida de que la API y la base de datos responden.
app.get("/api/salud", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, data: { api: "activa", baseDeDatos: "conectada" } });
  } catch {
    res.status(503).json({
      ok: false,
      error: {
        codigo: "BASE_DE_DATOS_NO_DISPONIBLE",
        mensaje: "No se pudo conectar con la base de datos.",
      },
    });
  }
});

app.use("/api/usuarios", usuariosRoutes);
app.use("/api/rutinas", rutinasRoutes);
app.use("/api/asignaciones", asignacionesRoutes);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
