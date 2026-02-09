import * as cursoUsecase from "./curso.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const getCursos = async (_req, res) => {
  try {
    const result = await cursoUsecase.getCursos();
    if (sendUsecaseError(res, result, "Error al obtener los cursos")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};

export const getCursoById = async (req, res) => {
  const { idCurso } = req.params;

  try {
    const result = await cursoUsecase.getCursoById(idCurso);
    if (sendUsecaseError(res, result, "Error al obtener el curso")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el curso" });
  }
};

export const createCurso = async (req, res) => {
  try {
    const result = await cursoUsecase.createCurso(req.body);
    if (sendUsecaseError(res, result, "Error al crear el curso")) return;
    res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el curso" });
  }
};

export const updateCurso = async (req, res) => {
  const { idCurso } = req.params;

  try {
    const result = await cursoUsecase.updateCurso(idCurso, req.body);
    if (sendUsecaseError(res, result, "Error al actualizar el curso")) return;
    res.json({ message: "Curso actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el curso" });
  }
};

export const deleteCurso = async (req, res) => {
  const { idCurso } = req.params;

  try {
    const result = await cursoUsecase.deleteCurso(idCurso);
    if (sendUsecaseError(res, result, "Error al desactivar el curso")) return;
    res.json({ message: "Curso desactivado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar el curso" });
  }
};
