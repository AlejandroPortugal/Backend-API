import * as entrevistasUsecase from "./entrevistas.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

const DEFAULT_CRON_TIMEZONE = "America/La_Paz";

const resolveFechaPorZonaHoraria = (timeZone = DEFAULT_CRON_TIMEZONE) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const getCronSecretFromRequest = (req) =>
  req.headers["x-cron-secret"] ||
  req.headers["x-job-secret"] ||
  req.query?.token ||
  req.body?.token ||
  null;

export const ejecutarCierreAgendaEntrevistas = async (req, res) => {
  try {
    const configuredSecret = process.env.CRON_SECRET || null;
    const providedSecret = getCronSecretFromRequest(req);

    if (configuredSecret && configuredSecret !== providedSecret) {
      return res.status(401).json({ error: "Token de cron no valido." });
    }

    const timeZone = process.env.EMAIL_JOB_TZ || DEFAULT_CRON_TIMEZONE;
    const fecha = req.body?.fecha || req.query?.fecha || resolveFechaPorZonaHoraria(timeZone);
    const result = await entrevistasUsecase.procesarCierreAgendaEntrevistas(fecha);

    if (sendUsecaseError(res, result, "No se pudo procesar el cierre de agenda")) return;
    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error al ejecutar cierre de agenda:", error);
    return res.status(500).json({ error: "Error al ejecutar el cierre de agenda." });
  }
};

export const agendarEntrevista = async (req, res) => {
  try {
    const result = await entrevistasUsecase.agendarEntrevista(req.body);
    if (sendUsecaseError(res, result, "Error interno del servidor.")) return;
    res.status(201).json(result.data);
  } catch (error) {
    console.error("Error al agendar la entrevista:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const enviarCorreoProfesores = async (payload) =>
  entrevistasUsecase.enviarCorreoProfesores(payload);

export const obtenerFechasHabilitadas = async (req, res) => {
  try {
    const result = await entrevistasUsecase.obtenerFechasHabilitadas(req.query);
    if (sendUsecaseError(res, result, "Error interno del servidor.")) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener fechas habilitadas:", error.message);
    res.status(500).json({ error: "Error interno del servidor." });
  }
};

export const obtenerColaEsperaPrioridadFIFO = async (req, res) => {
  try {
    const result = await entrevistasUsecase.obtenerColaEsperaPrioridadFIFO(req.query.idhorario);
    if (sendUsecaseError(res, result, "Error al obtener la cola de espera")) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener la cola de espera:", error.message);
    res
      .status(500)
      .json({ error: `Error al obtener la cola de espera: ${error.message}` });
  }
};

export const obtenerListaEntrevistaPorFecha = async (req, res) => {
  const { fecha } = req.params;
  const { idProfesor, idPsicologo } = req.query;

  try {
    const result = await entrevistasUsecase.obtenerListaEntrevistaPorFecha({
      fecha,
      idProfesor,
      idPsicologo,
    });
    if (sendUsecaseError(res, result, "Error al obtener las entrevistas por fecha"))
      return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener las entrevistas por fecha:", error.message);
    res.status(500).json({
      error: `Error al obtener las entrevistas por fecha: ${error.message}`,
    });
  }
};

export const insertarReservaEntrevista = async (req, res) => {
  try {
    const result = await entrevistasUsecase.insertarReservaEntrevista(req.body);
    if (sendUsecaseError(res, result, "Error al insertar la reserva de entrevista"))
      return;
    res.status(201).json(result.data);
  } catch (error) {
    console.error("Error al insertar la reserva de entrevista:", error);
    res.status(500).json({ error: "Error al insertar la reserva de entrevista." });
  }
};

export const enviarCorreoPadres = async (payload) =>
  entrevistasUsecase.enviarCorreoPadres(payload);

export const eliminarEntrevista = async (req, res) => {
  const { idReservarEntrevista } = req.params;
  const { nuevoEstado } = req.body;

  try {
    const result = await entrevistasUsecase.eliminarEntrevista({
      idReservarEntrevista,
      nuevoEstado,
    });
    if (sendUsecaseError(res, result, "Error al cambiar el estado de la entrevista"))
      return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al cambiar el estado de la entrevista:", error.message);
    res.status(500).json({ error: "Error al cambiar el estado de la entrevista." });
  }
};

export const obtenerListaEntrevistaPorRango = async (req, res) => {
  const { startDate, endDate } = req.body;
  try {
    const result = await entrevistasUsecase.obtenerListaEntrevistaPorRango(
      startDate,
      endDate
    );
    if (sendUsecaseError(res, result, "Error al obtener la lista de entrevistas"))
      return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener la lista de entrevistas:", error.message);
    res.status(500).json({
      error: `Error al obtener la lista de entrevistas: ${error.message}`,
    });
  }
};

export const verEntrevistasPadres = async (req, res) => {
  const { idPadre } = req.params;

  try {
    const result = await entrevistasUsecase.verEntrevistasPadres(idPadre);
    if (sendUsecaseError(res, result, "Error al obtener el historial de citas")) return;
    res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("Error al obtener el historial de citas:", error.message);
    res.status(500).json({ error: "Error al obtener el historial de citas" });
  }
};
