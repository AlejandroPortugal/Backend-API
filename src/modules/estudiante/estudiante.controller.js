import * as estudianteUsecase from "./estudiante.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const getEstudiantes = async (_req, res) => {
  try {
    const result = await estudianteUsecase.getEstudiantes();
    if (sendUsecaseError(res, result, "Error al obtener los estudiantes")) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error al obtener estudiantes:", error);
    res.status(500).json({ error: "Error al obtener los estudiantes" });
  }
};

export const getEstudianteById = async (req, res) => {
  const { idEstudiante } = req.params;

  try {
    const result = await estudianteUsecase.getEstudianteById(idEstudiante);
    if (sendUsecaseError(res, result, "Error al obtener el estudiante")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el estudiante" });
  }
};

export const createEstudiante = async (req, res) => {
  try {
    const result = await estudianteUsecase.createEstudiante(req.body);
    if (sendUsecaseError(res, result, "Error al crear el estudiante")) return;
    res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateEstudiante = async (req, res) => {
  const { idEstudiante } = req.params;

  try {
    const result = await estudianteUsecase.updateEstudiante(idEstudiante, req.body);
    if (sendUsecaseError(res, result, "Error al actualizar el estudiante")) return;
    res.json({ message: "Estudiante actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteEstudiante = async (req, res) => {
  const { idEstudiante } = req.params;

  try {
    const result = await estudianteUsecase.deleteEstudiante(idEstudiante);
    if (sendUsecaseError(res, result, "Error al desactivar el estudiante")) return;
    res.json({ message: "Estudiante desactivado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
