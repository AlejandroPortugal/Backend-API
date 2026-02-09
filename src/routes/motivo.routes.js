import { Router } from 'express';
import { getMotivos, getMotivosById } from '../modules/motivo/motivo.controller.js';

const router = Router();

// Asegúrate de que esta ruta está bien definida
router.get('/obtener/motivo', getMotivos);

router.get('/obtener/motivoById/:idMotivo', getMotivosById);
export default router;


