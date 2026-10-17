import { Router } from "express";
import * as controlador from "../controllers/usuarios.controller.js";

const router = Router();

router.post("/", controlador.registrar); // E1-HU1 registrar
router.get("/", controlador.listar); // E1-HU2 consultar / buscar
router.get("/:id", controlador.obtener); // consultar un usuario
router.put("/:id", controlador.actualizar); // E1-HU3 actualizar
router.patch("/:id/estado", controlador.cambiarEstado); // E1-HU4 activar / inactivar
router.get("/:id/rutina", controlador.rutinaAsignada); // E2-HU4 rutina asignada

export default router;
