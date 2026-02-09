import Router from 'express';
import { enviarCodigoConfirmacion, enviarCorreo } from '../modules/correo/correo.controller.js';

const router = Router();

router.post('/enviarCorreo', enviarCorreo);

router.post('/enviarCorreoConfirmacion', enviarCodigoConfirmacion);
export default router;
