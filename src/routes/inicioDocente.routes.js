import { Router } from "express";
import { obtenerPanelDocente } from "../controllers/inicioDocente.controller.js";

const router = Router();

router.get("/profesores/inicio/:idProfesor", obtenerPanelDocente);

export default router;
