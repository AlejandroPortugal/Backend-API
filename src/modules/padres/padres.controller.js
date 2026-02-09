import * as padresUsecase from "./padres.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const getPadresFamilia = async (_req, res) => {
  try {
    const result = await padresUsecase.getPadresFamilia();
    if (sendUsecaseError(res, result, "Error al obtener los padres de familia")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los padres de familia" });
  }
};

export const getPadreFamiliaById = async (req, res) => {
  const { idPadre } = req.params;

  try {
    const result = await padresUsecase.getPadreFamiliaById(idPadre);
    if (sendUsecaseError(res, result, "Error al obtener el padre de familia")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el padre de familia" });
  }
};

export const getPadreFamiliaConEstudiantes = async (req, res) => {
  const { idPadre } = req.params;

  try {
    const result = await padresUsecase.getPadreFamiliaConEstudiantes(idPadre);
    if (sendUsecaseError(res, result, "Error al obtener el padre de familia con sus estudiantes"))
      return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error al obtener el padre de familia con sus estudiantes",
    });
  }
};

export const createPadreFamilia = async (req, res) => {
  try {
    const result = await padresUsecase.createPadreFamilia(req.body);
    if (sendUsecaseError(res, result, "Error al crear el padre de familia")) return;
    return res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

export const updatePadreFamilia = async (req, res) => {
  const { idPadre } = req.params;

  try {
    const result = await padresUsecase.updatePadreFamilia(idPadre, req.body);
    if (sendUsecaseError(res, result, "Error al actualizar el padre de familia")) return;
    res.json({ message: "Padre de familia actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deletePadreFamilia = async (req, res) => {
  const { idPadre } = req.params;

  try {
    const result = await padresUsecase.deletePadreFamilia(idPadre);
    if (sendUsecaseError(res, result, "Error al desactivar el padre de familia")) return;
    res.json({ message: "Padre de familia desactivado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getDatesPadresFamilia = async (_req, res) => {
  try {
    const result = await padresUsecase.getDatesPadresFamilia();
    if (sendUsecaseError(res, result, "Error al obtener los padres de familia")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los padres de familia" });
  }
};
