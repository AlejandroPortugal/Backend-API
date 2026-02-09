import * as adminUsecase from "./administrator.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const getAdministrador = async (_req, res) => {
  try {
    const result = await adminUsecase.getAdministrador();
    if (sendUsecaseError(res, result, "Error al obtener los administradores")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los administradores" });
  }
};

export const getAdministradorById = async (req, res) => {
  const { idAdministrador } = req.params;

  try {
    const result = await adminUsecase.getAdministradorById(idAdministrador);
    if (sendUsecaseError(res, result, "Error al obtener el administrador")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el administrador" });
  }
};

export const createAdministrador = async (req, res) => {
  try {
    const result = await adminUsecase.createAdministrador(req.body);
    if (sendUsecaseError(res, result, "Error al crear el administrador")) return;
    return res.status(201).json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear el administrador" });
  }
};

export const updateAdministrador = async (req, res) => {
  const { idAdministrador } = req.params;

  try {
    const result = await adminUsecase.updateAdministrador(idAdministrador, req.body);
    if (sendUsecaseError(res, result, "Error al actualizar el administrador")) return;
    res.json({ message: "Administrador actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el administrador" });
  }
};

export const deleteAdministrador = async (req, res) => {
  const { idAdministrador } = req.params;

  try {
    const result = await adminUsecase.deleteAdministrador(idAdministrador);
    if (sendUsecaseError(res, result, "Error al desactivar el administrador")) return;
    res.json({ message: "Administrador desactivado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al desactivar el administrador" });
  }
};
