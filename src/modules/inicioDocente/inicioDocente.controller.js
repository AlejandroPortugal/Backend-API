import * as inicioDocenteUsecase from "./inicioDocente.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const obtenerPanelDocente = async (req, res) => {
  const { idProfesor } = req.params;

  try {
    const result = await inicioDocenteUsecase.obtenerPanelDocente(idProfesor);
    if (sendUsecaseError(res, result, "Error al obtener el panel docente")) return;
    return res.json(result.data);
  } catch (error) {
    console.error("Error al obtener el panel docente:", error);
    return res.status(500).json({ error: "Error al obtener el panel docente" });
  }
};
