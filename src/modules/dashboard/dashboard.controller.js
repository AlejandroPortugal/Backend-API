import * as dashboardUsecase from "./dashboard.usecase.js";

const sendUsecaseError = (res, result, fallbackMessage) => {
  if (!result?.error) return false;
  res.status(result.error.status).json({ error: result.error.message || fallbackMessage });
  return true;
};

export const getActiveProfessorsCount = async (_req, res) => {
  try {
    const result = await dashboardUsecase.getActiveProfessorsCount();
    if (sendUsecaseError(res, result, "Error al obtener la cantidad de profesores activos")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la cantidad de profesores activos" });
  }
};

export const getActiveUsersCount = async (_req, res) => {
  try {
    const result = await dashboardUsecase.getActiveUsersCount();
    if (sendUsecaseError(res, result, "Error al obtener la cantidad de usuarios activos")) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error al obtener la cantidad de usuarios activos:", error?.message || error);
    res.status(500).json({ error: "Error al obtener la cantidad de usuarios activos" });
  }
};

export const getWeeklyInterviews = async (_req, res) => {
  try {
    const result = await dashboardUsecase.getWeeklyInterviews();
    if (sendUsecaseError(res, result, "Error al obtener entrevistas semanales")) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error al obtener entrevistas semanales:", error);
    res.status(500).json({ error: "Error al obtener entrevistas semanales" });
  }
};

export const getInterviewStatusCounts = async (_req, res) => {
  try {
    const result = await dashboardUsecase.getInterviewStatusCounts();
    if (sendUsecaseError(res, result, "Error al obtener el estado de entrevistas")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el estado de entrevistas" });
  }
};

export const getMostRequestedSubject = async (_req, res) => {
  try {
    const result = await dashboardUsecase.getMostRequestedSubject();
    if (sendUsecaseError(res, result, "Error al obtener la materia mas demandada")) return;
    res.json(result.data);
  } catch (error) {
    console.error("Error al obtener la materia mas demandada:", error);
    res.status(500).json({ error: "Error al obtener la materia mas demandada" });
  }
};

export const getMostRequestedProfessor = async (_req, res) => {
  try {
    const result = await dashboardUsecase.getMostRequestedProfessor();
    if (sendUsecaseError(res, result, "Error al obtener el profesor mas demandado")) return;
    res.json(result.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener el profesor mas demandado" });
  }
};
