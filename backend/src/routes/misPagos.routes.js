import { Router } from "express";
import * as controlador from "../controllers/pagos.controller.js";

// Ruta del usuario del gimnasio (el acceso se restringe en app.js).
const router = Router();

router.get("/", controlador.misPagos); // E3-HU2 consultar mi historial de pagos

export default router;
