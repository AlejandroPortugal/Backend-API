import * as motivoUsecase from "./motivo.usecase.js";

const sendUsecaseError = (res, result) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message });
  return true;
};

export const getMotivos = async (_req, res) => {
  try {
    const result = await motivoUsecase.getMotivos();
    if (sendUsecaseError(res, result)) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el motivo" });
  }
};

export const getMotivosById = async (req, res) => {
  const { idMotivo } = req.params;

  try {
    const result = await motivoUsecase.getMotivosById(idMotivo);
    if (sendUsecaseError(res, result)) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el motivo" });
  }
};
