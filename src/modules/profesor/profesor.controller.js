import * as entrevistasUsecase from "../entrevistas/entrevistas.usecase.js";
import * as profesorUsecase from "./profesor.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const getProfesores = async (_req, res) => {
  try {
    const result = await profesorUsecase.getProfesores();
    if (sendUsecaseError(res, result, "Error al obtener los profesores")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los profesores" });
  }
};

export const getProfesorById = async (req, res) => {
  const { idProfesor } = req.params;

  try {
    const result = await profesorUsecase.getProfesorById(idProfesor);
    if (sendUsecaseError(res, result, "Error al obtener el profesor")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el profesor" });
  }
};

export const createProfesor = async (req, res) => {
  try {
    const result = await profesorUsecase.createProfesor(req.body);
    if (sendUsecaseError(res, result, "Error al crear el profesor")) return;
    return res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateProfesor = async (req, res) => {
  const { idProfesor } = req.params;

  try {
    const result = await profesorUsecase.updateProfesor(idProfesor, req.body);
    if (sendUsecaseError(res, result, "Error al actualizar el profesor")) return;
    res.json({ message: "Profesor actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteProfesor = async (req, res) => {
  const { idProfesor } = req.params;

  try {
    const result = await profesorUsecase.deleteProfesor(idProfesor);
    if (sendUsecaseError(res, result, "Error al desactivar el profesor")) return;
    res.json({ message: "Profesor desactivado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getProfesorCount = async (_req, res) => {
  try {
    const result = await profesorUsecase.getProfesorCount();
    if (sendUsecaseError(res, result, "Error al obtener la cantidad de profesores")) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener la cantidad de profesores:", error);
  }
};

export const getProfesoresConHorarios = async (_req, res) => {
  try {
    const result = await profesorUsecase.getProfesoresConHorarios();
    if (sendUsecaseError(res, result, "Error al obtener profesores y psicologos con horarios")) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error al obtener profesores y psicologos con horarios:", error);
    res.status(500).json({ error: "Error al obtener profesores y psicologos con horarios" });
  }
};

export const getHorarioMateriaByProfesor = async (req, res) => {
  const { idProfesor } = req.params;
  try {
    const result = await profesorUsecase.getHorarioMateriaByProfesor(idProfesor);
    if (sendUsecaseError(res, result, "Error al obtener horario/materia del profesor")) return;
    return res.json(result.data);
  } catch (error) {
    console.error("Error getHorarioMateriaByProfesor:", error);
    return res.status(500).json({ error: "Error al obtener horario/materia del profesor" });
  }
};

export const actualizarEstadoEntrevistaProfesor = async (req, res) => {
  try {
    const result = await profesorUsecase.validarEstadoEntrevistaProfesor(req.body);
    if (sendUsecaseError(res, result, "No se pudo actualizar el estado de la entrevista")) return;

    const updateResult = await entrevistasUsecase.eliminarEntrevista({
      idReservarEntrevista: result.data.idreservarentrevista,
      nuevoEstado: result.data.nuevoIdEstado,
    });
    if (sendUsecaseError(res, updateResult, "No se pudo actualizar el estado de la entrevista")) {
      return;
    }
    return res.status(200).json(updateResult.data);
  } catch (error) {
    console.error("Error al actualizar el estado de la entrevista:", error);
    return res.status(500).json({ error: "No se pudo actualizar el estado de la entrevista" });
  }
};

export const getPadreConHijos = async (req, res) => {
  const { idPadre } = req.params;

  try {
    const result = await profesorUsecase.getPadreConHijos(idPadre);
    if (sendUsecaseError(res, result, "Error al obtener padre de familia con sus hijos")) return;
    return res.json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener padre de familia con sus hijos" });
  }
};
