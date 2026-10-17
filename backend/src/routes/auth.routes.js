import { Router } from "express";
import * as controlador from "../controllers/auth.controller.js";
import { autenticar } from "../middleware/auth.js";

const router = Router();

router.post("/login", controlador.iniciarSesion); // público
router.get("/yo", autenticar, controlador.yo); // requiere sesión

export default router;
