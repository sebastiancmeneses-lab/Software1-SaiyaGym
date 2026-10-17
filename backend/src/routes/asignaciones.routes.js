import { Router } from "express";
import * as controlador from "../controllers/rutinas.controller.js";

// Rutas del entrenador (el acceso se restringe en app.js).
const router = Router();

router.post("/", controlador.asignar); // E2-HU2 asignar rutina a un usuario
router.get("/usuarios", controlador.usuariosAsignables); // usuarios a quienes asignar

export default router;
