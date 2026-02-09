import * as materiaUsecase from "./materia.usecase.js";

const sendUsecaseError = (res, result) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message });
  return true;
};

export const getMateria = async (_req, res) => {
  try {
    const result = await materiaUsecase.getMaterias();
    if (sendUsecaseError(res, result)) return;
    return res.json(result.data);
  } catch (error) {
    console.error("Error getMateria:", error);
    return res.status(500).json({ error: "Error al obtener la materia" });
  }
};

export const getMateriaById = async (req, res) => {
  try {
    const result = await materiaUsecase.getMateriaById(req.params.idMateria);
    if (sendUsecaseError(res, result)) return;
    return res.json(result.data);
  } catch (error) {
    console.error("Error getMateriaById:", error);
    return res.status(500).json({ error: "Error al obtener la materia" });
  }
};

export const getMateriaForPsicologo = async (_req, res) => {
  try {
    const result = await materiaUsecase.getMateriasForPsicologo();
    if (sendUsecaseError(res, result)) return;
    return res.json(result.data);
  } catch (error) {
    console.error("Error getMateriaForPsicologo:", error);
    return res.status(500).json({ error: "Error al obtener la materia" });
  }
};
