import * as horarioUsecase from "./horario.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const getHorarios = async (_req, res) => {
  try {
    const result = await horarioUsecase.getHorarios();
    if (sendUsecaseError(res, result, "Error al obtener los horarios")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los horarios" });
  }
};

export const getHorarioById = async (req, res) => {
  const { idhorario } = req.params;

  try {
    const result = await horarioUsecase.getHorarioById(idhorario);
    if (sendUsecaseError(res, result, "Error al obtener el horario")) return;
    return res.json(result.data);
  } catch (error) {
    console.error("Error getHorarioById:", error);
    return res.status(500).json({ error: "Error al obtener el horario" });
  }
};

export const createHorario = async (req, res) => {
  const { idmateria, horainicio, horafin, fecha, estado } = req.body;

  try {
    const result = await horarioUsecase.createHorario({
      idmateria,
      horainicio,
      horafin,
      fecha,
      estado,
    });
    if (sendUsecaseError(res, result, "Error al crear el horario")) return;
    res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el horario" });
  }
};

export const updateHorario = async (req, res) => {
  const { idhorario } = req.params;
  const { idmateria, horainicio, horafin, fecha, estado } = req.body;

  try {
    const result = await horarioUsecase.updateHorario(idhorario, {
      idmateria,
      horainicio,
      horafin,
      fecha,
      estado,
    });
    if (sendUsecaseError(res, result, "Error al actualizar el horario")) return;
    res.json({ message: "Horario actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el horario" });
  }
};

export const deleteHorario = async (req, res) => {
  const { idhorario } = req.params;

  try {
    const result = await horarioUsecase.deleteHorario(idhorario);
    if (sendUsecaseError(res, result, "Error al desactivar el horario")) return;
    res.json({ message: "Horario desactivado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar el horario" });
  }
};
