import { fileURLToPath } from "node:url";
import path from "node:path";
import dotenv from "dotenv";

// Carga backend/.env sin importar desde qué carpeta se ejecute el comando.
dotenv.config({
  path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.env"),
  quiet: true,
});

// Toda la configuración sale de variables de entorno (archivo .env).
// Las credenciales NUNCA van escritas en el código.
export const config = {
  puerto: Number(process.env.PORT) || 3000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || "saiyagym",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  },
};
