import { Router } from 'express';
import {
  getMateria,
  getMateriaById,
  getMateriaForPsicologo,
} from '../modules/materia/materia.controller.js';

const router = Router();

// Asegúrate de que esta ruta está bien definida
router.get('/obtener/materia', getMateria);
router.get('/obtener/materiaForPsicologo', getMateriaForPsicologo);
router.get('/obtener/materiaById/:idMateria', getMateriaById );
export default router;


