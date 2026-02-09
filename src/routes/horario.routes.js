import Router from 'express';
import {
  createHorario,
  deleteHorario,
  getHorarioById,
  getHorarios,
  updateHorario,
} from '../modules/horario/horario.controller.js';

const router = Router();

router.get('/obtener/horarios', getHorarios);
router.get('/obtener/horario/:idhorario', getHorarioById);  // Mantener consistencia con el controlador
router.post('/crear/horario', createHorario);
router.put('/actualizar/horario/:idhorario', updateHorario);
router.delete('/eliminar/horario/:idhorario', deleteHorario);

export default router;getHorarios
