import * as direccionUsecase from "./direccion.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  const body = { error: result.error.message || fallbackMessage };
  if (result.error.payload && typeof result.error.payload === "object") {
    Object.assign(body, result.error.payload);
  }
  res.status(result.error.status).json(body);
  return true;
};

export const getDirecciones = async (_req, res) => {
  try {
    const result = await direccionUsecase.getDirecciones();
    if (sendUsecaseError(res, result, "Error al obtener las direcciones")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las direcciones" });
  }
};

export const getDireccionById = async (req, res) => {
  const { iddireccion } = req.params;

  try {
    const result = await direccionUsecase.getDireccionById(iddireccion);
    if (sendUsecaseError(res, result, "Error al obtener la direcciİn")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la direcciİn" });
  }
};

export const createDireccion = async (req, res) => {
  try {
    const result = await direccionUsecase.createDireccion(req.body);
    if (sendUsecaseError(res, result, "Error al crear la direcciİn")) return;
    return res.status(201).json(result.data);
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(409).json({ error: "La direcciİn ya existe" });
    }
    console.error("Error al crear la direcciİn:", error);
    return res.status(500).json({ error: "Error al crear la direcciİn" });
  }
};

export const updateDireccion = async (req, res) => {
  const { iddireccion } = req.params;

  try {
    const result = await direccionUsecase.updateDireccion(iddireccion, req.body);
    if (sendUsecaseError(res, result, "Error al actualizar la direcciİn")) return;
    res.json({ message: "Direcciİn actualizada correctamente" });
  } catch (error) {
    if (error?.code === "23505") {
      return res.status(409).json({ error: "La direcciİn ya existe" });
    }
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la direcciİn" });
  }
};

export const deleteDireccion = async (req, res) => {
  const { iddireccion } = req.params;

  try {
    const result = await direccionUsecase.deleteDireccion(iddireccion);
    if (sendUsecaseError(res, result, "Error al desactivar la direcciİn")) return;
    res.json({ message: "Direcciİn desactivada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar la direcciİn" });
  }
};
