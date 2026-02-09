import * as repository from "./dashboard.repository.js";

const ok = (data) => ({ data });
const fail = (status, message) => ({ error: { status, message } });

export const getActiveProfessorsCount = async () => {
  const { rows } = await repository.fetchActiveProfessorsCount();
  return ok({ total: parseInt(rows[0].total, 10) });
};

export const getActiveUsersCount = async () => {
  const { rows } = await repository.fetchActiveUsersCounts();
  if (!rows || rows.length === 0) {
    return fail(404, "No se encontraron usuarios activos");
  }
  const counts = rows[0];
  const total = Object.values(counts).reduce((acc, count) => acc + parseInt(count, 10), 0);
  return ok({ counts, total });
};

export const getWeeklyInterviews = async () => {
  const { rows } = await repository.fetchWeeklyInterviews();
  const interviewCounts = Array(5).fill(0);
  rows.forEach((row) => {
    const dayIndex = parseInt(row.dia_semana, 10) - 1;
    interviewCounts[dayIndex] = parseInt(row.total, 10);
  });
  return ok(interviewCounts);
};

export const getInterviewStatusCounts = async () => {
  const { rows } = await repository.fetchInterviewStatusCounts();
  return ok(rows[0]);
};

export const getMostRequestedSubject = async () => {
  const { rows } = await repository.fetchMostRequestedSubject();
  if (Array.isArray(rows) && rows.length > 0) {
    const formattedData = rows.map((row) => ({
      nombre: row.nombre,
      cantidad: parseInt(row.cantidad, 10),
    }));
    return ok(formattedData);
  }
  return ok([]);
};

export const getMostRequestedProfessor = async () => {
  const { rows } = await repository.fetchMostRequestedProfessor();
  return ok(rows[0]);
};
