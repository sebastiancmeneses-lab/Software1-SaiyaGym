import { Router } from "express";
import * as controlador from "../controllers/rutinas.controller.js";

const router = Router();

router.post("/", controlador.crear); // E2-HU1 crear rutina
router.get("/", controlador.listar); // listar rutinas
router.get("/:id", controlador.obtener); // consultar una rutina
router.put("/:id", controlador.actualizar); // E2-HU3 modificar rutina

export default router;
