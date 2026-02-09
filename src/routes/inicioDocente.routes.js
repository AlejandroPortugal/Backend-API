import { Router } from "express";
import { obtenerPanelDocente } from "../modules/inicioDocente/inicioDocente.controller.js";

const router = Router();

router.get("/profesores/inicio/:idProfesor", obtenerPanelDocente);

export default router;
