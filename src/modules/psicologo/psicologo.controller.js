import * as psicologoUsecase from "./psicologo.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const getPsicologos = async (_req, res) => {
  try {
    const result = await psicologoUsecase.getPsicologos();
    if (sendUsecaseError(res, result, "Error al obtener los psicologos")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los psicologos" });
  }
};

export const getPsicologoById = async (req, res) => {
  const { idPsicologo } = req.params;

  try {
    const result = await psicologoUsecase.getPsicologoById(idPsicologo);
    if (sendUsecaseError(res, result, "Error al obtener el psicologo")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el psicologo" });
  }
};

export const createPsicologo = async (req, res) => {
  try {
    const result = await psicologoUsecase.createPsicologo(req.body);
    if (sendUsecaseError(res, result, "Error al crear el psicologo")) return;
    return res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const updatePsicologo = async (req, res) => {
  const { idPsicologo } = req.params;

  try {
    const result = await psicologoUsecase.updatePsicologo(idPsicologo, req.body);
    if (sendUsecaseError(res, result, "Error al actualizar el psicologo")) return;
    res.json({ message: "Psicologo actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deletePsicologo = async (req, res) => {
  const { idPsicologo } = req.params;

  try {
    const result = await psicologoUsecase.deletePsicologo(idPsicologo);
    if (sendUsecaseError(res, result, "Error al desactivar el psicologo")) return;
    res.json({ message: "Psicologo desactivado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
