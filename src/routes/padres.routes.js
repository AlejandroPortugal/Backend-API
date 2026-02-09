import Router from 'express'
import {
  createPadreFamilia,
  deletePadreFamilia,
  getDatesPadresFamilia,
  getPadreFamiliaById,
  getPadreFamiliaConEstudiantes,
  getPadresFamilia,
  updatePadreFamilia,
} from '../modules/padres/padres.controller.js';
import { getPadreConHijos } from '../modules/profesor/profesor.controller.js';

const router = Router();

router.get('/obtener/padresdefamilia', getPadresFamilia); 
router.get('/obtener/padredefamilia/:idPadre', getPadreFamiliaById); 
router.get('/padre/:idPadre/estudiantes', getPadreFamiliaConEstudiantes);
router.get('/obtener/datos/padres', getDatesPadresFamilia);
router.get('/obtener/padre/hijos/:idPadre', getPadreConHijos);
router.post('/crear/padredefamilia', createPadreFamilia);
router.put('/actualizar/padredefamilia/:idPadre', updatePadreFamilia); 
router.delete('/eliminar/padredefamilia/:idPadre', deletePadreFamilia);

export default router

