import { Router } from "express";
import * as controlador from "../controllers/rutinas.controller.js";

const router = Router();

router.post("/", controlador.asignar); // E2-HU2 asignar rutina a un usuario

export default router;
