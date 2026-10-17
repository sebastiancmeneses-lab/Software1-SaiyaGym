import { Router } from "express";
import * as controlador from "../controllers/rutinas.controller.js";

// Ruta del usuario del gimnasio (el acceso se restringe en app.js).
const router = Router();

router.get("/", controlador.miRutina); // E2-HU4 consultar mi rutina asignada

export default router;
