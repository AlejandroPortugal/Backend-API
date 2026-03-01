import Router from 'express';
import {
  agendarEntrevista,
  ejecutarCierreAgendaEntrevistas,
  eliminarEntrevista,
  insertarReservaEntrevista,
  obtenerColaEsperaPrioridadFIFO,
  obtenerMetricasCola,
  obtenerFechasHabilitadas,
  obtenerListaEntrevistaPorFecha,
  obtenerListaEntrevistaPorRango,
  verEntrevistasPadres,
} from '../modules/entrevistas/entrevistas.controller.js';

const router = Router();

// Ruta para agendar una entrevista y añadirla a la cola
router.post('/agendarEntrevista', agendarEntrevista);

router.get('/colaEspera', obtenerColaEsperaPrioridadFIFO);
router.get('/colaEspera/metricas', obtenerMetricasCola);

router.get('/listaEntrevistas/:fecha', obtenerListaEntrevistaPorFecha);

router.get('/entrevistas/fechas-habilitadas', obtenerFechasHabilitadas);

router.post('/jobs/entrevistas/cierre-agenda', ejecutarCierreAgendaEntrevistas);

router.get('/verEntrevistasPadres/:idPadre', verEntrevistasPadres);

//borrado logico
router.put('/eliminarEntrevista/:idReservarEntrevista', eliminarEntrevista);

//Entrevista por rango 
router.post('/obtener/entrevistas/rango', obtenerListaEntrevistaPorRango);

router.post('/crear/reservarentrevista', insertarReservaEntrevista);




export default router;
