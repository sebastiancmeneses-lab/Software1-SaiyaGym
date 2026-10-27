import { Router } from "express";
import * as controlador from "../controllers/pagos.controller.js";

// Rutas del administrador (el acceso se restringe en app.js).
const router = Router();

router.post("/", controlador.registrar); // E3-HU1 registrar un pago
router.get("/", controlador.listar); // últimos pagos registrados
router.get("/usuarios", controlador.usuariosPagables); // usuarios a quienes registrar pagos

export default router;
