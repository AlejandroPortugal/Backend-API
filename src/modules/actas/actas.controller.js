import * as actasUsecase from "./actas.usecase.js";

const sendUsecaseError = (res, result) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message });
  return true;
};

export const obtenerActasReunion = async (_req, res) => {
  try {
    const result = await actasUsecase.obtenerActasReunion();
    if (sendUsecaseError(res, result)) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener las actas de reunion:", error);
    res.status(500).json({ error: "Error al obtener las actas de reunion" });
  }
};

export const obtenerActaReunionPorId = async (req, res) => {
  try {
    const result = await actasUsecase.obtenerActaReunionPorId(req.params.idActa);
    if (sendUsecaseError(res, result)) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener el acta de reunion:", error);
    res.status(500).json({ error: "Error al obtener el acta de reunion" });
  }
};

export const crearActaReunion = async (req, res) => {
  try {
    const result = await actasUsecase.crearActaReunion(req.body);
    if (sendUsecaseError(res, result)) return;
    res.status(201).json({
      message: "Acta de reunion creada exitosamente",
      acta: result.data,
    });
  } catch (error) {
    console.error("Error al crear el acta de reunion:", error);
    res.status(500).json({ error: "Error al crear el acta de reunion" });
  }
};

export const actualizarActaReunion = async (req, res) => {
  try {
    const result = await actasUsecase.actualizarActaReunion(req.params.idActa, req.body);
    if (sendUsecaseError(res, result)) return;
    res.status(200).json({
      message: "Acta de reunion actualizada exitosamente",
      acta: result.data,
    });
  } catch (error) {
    console.error("Error al actualizar el acta de reunion:", error);
    res.status(500).json({ error: "Error al actualizar el acta de reunion" });
  }
};

export const eliminarActaReunion = async (req, res) => {
  try {
    const result = await actasUsecase.eliminarActaReunion(req.params.idActa);
    if (sendUsecaseError(res, result)) return;
    res.json({ message: "Acta de reunion eliminada (desactivada) exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el acta de reunion:", error);
    res.status(500).json({ error: "Error al eliminar el acta de reunion" });
  }
};

export const getActasByEstudiante = async (req, res) => {
  try {
    const result = await actasUsecase.getActasByEstudiante(req.params.idestudiante);
    if (sendUsecaseError(res, result)) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener las actas por estudiante:", error);
    res.status(500).json({ error: "Error al obtener las actas por estudiante" });
  }
};

export const activarActaReunion = async (req, res) => {
  try {
    const result = await actasUsecase.activarActaReunion(req.params.idActa);
    if (sendUsecaseError(res, result)) return;
    res.json({ message: "Acta de reunion activada exitosamente", acta: result.data });
  } catch (error) {
    console.error("Error al activar el acta de reunion:", error);
    res.status(500).json({ error: "Error al activar el acta de reunion" });
  }
};

export const obtenerActasInactivas = async (_req, res) => {
  try {
    const result = await actasUsecase.obtenerActasInactivas();
    if (sendUsecaseError(res, result)) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener las actas inactivas:", error);
    res.status(500).json({ error: "Error al obtener las actas inactivas" });
  }
};
