import * as usersUsecase from "./users.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const getAllUsers = async (_req, res) => {
  try {
    const result = await usersUsecase.getAllUsers();
    if (sendUsecaseError(res, result, "Error al obtener los usuarios")) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

export const filterUsuarios = async (req, res) => {
  try {
    const result = await usersUsecase.filterUsuarios(req.query.searchTerm);
    if (sendUsecaseError(res, result, "Error al filtrar usuarios")) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error al filtrar usuarios:", error);
    res.status(500).json({ error: "Error al filtrar usuarios" });
  }
};

export const getallUserEntry = async (_req, res) => {
  try {
    const result = await usersUsecase.getallUserEntry();
    if (sendUsecaseError(res, result, "Error al obtener los usuarios")) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

export const filterUsers = async (req, res) => {
  try {
    const result = await usersUsecase.filterUsers(req.query.searchTerm);
    if (sendUsecaseError(res, result, "Error al filtrar usuarios.")) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error al filtrar usuarios:", error);
    res.status(500).json({ error: "Error al filtrar usuarios." });
  }
};

export const registrarIngreso = async (req, res) => {
  try {
    const result = await usersUsecase.registrarIngreso(req.body);
    if (sendUsecaseError(res, result, "Error al registrar el ingreso")) return;
    res.status(201).json({ message: "Ingreso registrado exitosamente" });
  } catch (error) {
    console.error("Error al registrar el ingreso:", error);
    res.status(500).json({ message: "Error al registrar el ingreso" });
  }
};

export const obtenerIngresos = async (_req, res) => {
  try {
    const result = await usersUsecase.obtenerIngresos();
    if (sendUsecaseError(res, result, "Error al obtener los ingresos")) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener los ingresos:", error);
    res.status(500).json({ message: "Error al obtener los ingresos" });
  }
};

export const obtenerDatosUsuariosConIngresos = async (_req, res) => {
  try {
    const result = await usersUsecase.obtenerDatosUsuariosConIngresos();
    if (sendUsecaseError(res, result, "Error al obtener los datos de usuarios con ingresos.")) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener los datos de usuarios con ingresos:", error);
    res.status(500).json({ message: "Error al obtener los datos de usuarios con ingresos." });
  }
};

export const obtenerIngresosPorRango = async (req, res) => {
  try {
    const result = await usersUsecase.obtenerIngresosPorRango(req.body.startDate, req.body.endDate);
    if (sendUsecaseError(res, result, "Hubo un error al obtener los ingresos.")) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error al obtener ingresos por rango de fechas:", error);
    res.status(500).json({ error: "Hubo un error al obtener los ingresos." });
  }
};

export const obtenerCantidadUsuariosConIngresos = async (_req, res) => {
  try {
    const result = await usersUsecase.obtenerCantidadUsuariosConIngresos();
    if (sendUsecaseError(res, result, "Error al obtener la cantidad de usuarios con ingresos.")) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al obtener la cantidad de usuarios con ingresos:", error);
    res.status(500).json({ message: "Error al obtener la cantidad de usuarios con ingresos." });
  }
};

export const listarUsuariosInactivos = async (_req, res) => {
  try {
    const result = await usersUsecase.listarUsuariosInactivos();
    if (sendUsecaseError(res, result, "Error al listar usuarios inactivos.")) return;
    res.status(200).json(result.data);
  } catch (error) {
    console.error("Error al listar usuarios inactivos:", error);
    res.status(500).json({ error: "Error al listar usuarios inactivos." });
  }
};

export const activarUsuario = async (req, res) => {
  try {
    const result = await usersUsecase.activarUsuario(req.body);
    if (sendUsecaseError(res, result, "Error al actualizar el estado del usuario.")) return;
    res.status(200).json({ message: "Estado del usuario actualizado exitosamente." });
  } catch (error) {
    console.error("Error al actualizar el estado del usuario:", error);
    res.status(500).json({ error: "Error al actualizar el estado del usuario." });
  }
};
